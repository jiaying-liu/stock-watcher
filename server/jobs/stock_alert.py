import redis
import os
import sys
import asyncio
from ..db import run_query
from functools import reduce
from iexfinance.stocks import Stock
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.combining import OrTrigger
from datetime import datetime, time
from pytz import utc

class StockAlert:
	def __init__(self, stock_ticker, stock_name, condition, price, user_id):
		self.stock_ticker = stock_ticker
		self.stock_name = stock_name
		self.condition = condition
		self.price = price
		self.user_id = user_id
	
	def does_price_cross_condition(self, price):
		price_in_dollar = self.price / 100
		if self.condition == 'under':
			return price_in_dollar >= price
		else:
			return price_in_dollar <= price

def _get_user_ids():
	return list(map(
		lambda row: row['id'],
		run_query('SELECT id FROM USER')
	))

def _refresh_user_triggered_stock_alert_tracker(redis_store):
	user_ids = _get_user_ids()
	keys = list(map(lambda user_id: f"user:{user_id}:triggered_stock_alerts", user_ids))
	redis_store.delete(*keys)

def connect_to_redis():
	return redis.Redis(
		host=os.getenv('REDIS_HOST'),
		port=int(os.getenv('REDIS_PORT')),
		password=os.getenv('REDIS_PASSWORD'),
		charset='utf-8',
		decode_responses=True
	)

redis_store = connect_to_redis()

def _get_stock_alerts():
	stock_alerts = list(map(
		lambda row: StockAlert(
			row['stock_ticker'].upper(),
			row['stock_name'],
			row['condition'],
			row['price'],
			row['user_id']
		),
		run_query('SELECT * FROM STOCK_ALERT')
	))

	return stock_alerts

def _add_to_user_dict(user_dict, user):
	user_dict[user['id']] = user

	return user_dict

def _create_user_stock_alert_dict(stock_alerts):
	user_dict = reduce(
		_add_to_user_dict,
		run_query('SELECT id, email FROM user'),
		dict()
	)
	user_stock_dict = dict()

	for stock_alert in stock_alerts:
		user_id = stock_alert.user_id

		if user_id not in user_stock_dict:
			user = user_dict[user_id]
			if user is not None:
				user_stock_dict[user_id] = {
					'email': user['email'],
					'stock_alerts': []
				}
		
		user_stock_dict[user_id]['stock_alerts'].append(stock_alert)
	
	return user_stock_dict

def _add_to_stock_set (stock_set, stock_alert):
	stock_set.add(stock_alert.stock_ticker.upper())

	return stock_set

def _create_stock_set(stock_alerts):
	return reduce(
		_add_to_stock_set,
		stock_alerts,
		set()
	)

def _fetch_stock_price (stock_ticker):
	stock = Stock(stock_ticker)
	
	return {
		'stock_ticker': stock_ticker,
		'price': stock.get_quote()['latestPrice']
	}

def _add_to_stock_price_dict(stock_price_dict, stock):
	stock_price_dict[stock['stock_ticker']] = stock['price']

	return stock_price_dict

async def _get_current_stock_prices(stock_tickers):
	loop = asyncio.get_event_loop()
	futures = list(map(lambda stock_ticker: loop.run_in_executor(
		None,
		_fetch_stock_price,
		stock_ticker
	), stock_tickers))

	stock_prices = await asyncio.gather(*futures)

	return reduce(_add_to_stock_price_dict, stock_prices, dict())

def _send_alert_emails(user_stock_alert_dict, stock_price_dict):
	global redis_store

	for user_id in user_stock_alert_dict:
		email_message = ''
		email = user_stock_alert_dict[user_id]['email']
		stock_alerts = user_stock_alert_dict[user_id]['stock_alerts']
		redis_stock_alert_key = f"user:{user_id}:triggered_stock_alerts"

		for stock_alert in stock_alerts:
			current_price = stock_price_dict[stock_alert.stock_ticker]

			if stock_alert.does_price_cross_condition(current_price) and stock_alert.stock_ticker not in redis_store.smembers(redis_stock_alert_key):
				email_message += f"{stock_alert.stock_name} ({stock_alert.stock_ticker}): ${current_price}\n"
				redis_store.sadd(redis_stock_alert_key, stock_alert.stock_ticker)
		
		if len(email_message) > 0:
			sendgrid_mail = Mail(
				from_email=os.getenv('SENDGRID_FROM_EMAIL'),
				to_emails=email,
				subject='Your Stock Alert(s) has been triggered!',
				html_content=f'<div>{email_message}</div>'
			)

			try:
				sendgrid_client = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))
				sendgrid_client.send(sendgrid_mail)
			except Exception as e:
				print('Could not send email', e, file=sys.stderr)


async def _send_stock_alerts():
	try:
		stock_alerts = _get_stock_alerts()
		user_stock_alert_dict = _create_user_stock_alert_dict(stock_alerts)
		stock_set = _create_stock_set(stock_alerts)
		stock_price_dict = await _get_current_stock_prices(list(stock_set))
		_send_alert_emails(user_stock_alert_dict, stock_price_dict)
	except Exception as e:
		print('Error while sending stock alerts', e, file=sys.stderr)

def send_stock_alerts():
	asyncio.run(_send_stock_alerts())

def schedule_stock_alerts():
	global redis_store
	try:
		scheduler = BackgroundScheduler(timezone=utc)
		_refresh_user_triggered_stock_alert_tracker(redis_store)
		cron1 = CronTrigger(day_of_week='mon-fri', hour='13', minute='30,35,40,45,50,55', timezone=utc)
		cron2 = CronTrigger(day_of_week='mon-fri', hour='14-20', minute='*/5', timezone=utc)
		trigger = OrTrigger([cron1, cron2])
		scheduler.add_job(send_stock_alerts, trigger)
		scheduler.add_job(lambda: _refresh_user_triggered_stock_alert_tracker(redis_store), 'cron', day_of_week='mon-fri', hour='13', minute=30)
		scheduler.start()
	except Exception as e:
		print('Error while scheduling alerts', e, file=sys.stderr)
