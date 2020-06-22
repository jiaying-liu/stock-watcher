from flask_restful import Resource, reqparse
from ..decorators import authenticate
from iexfinance.stocks import Stock, get_historical_intraday, get_historical_data
from iexfinance.refdata import get_symbols
from datetime import datetime, timedelta
from pandas.tseries.offsets import BDay
from concurrent.futures import ThreadPoolExecutor
from functools import reduce

import os
import sys
import pandas
import asyncio
import functools

class StockList(Resource):
	method_decorators = [authenticate]
	
	def get(self):
		try:
			stocks = get_symbols()

			return { 'stocks': stocks }, 200
		except Exception as e:
			print('Error while retrieving list of stocks:', e, file=sys.stderr)

			return { 'message': 'Error while retrieving list  of stocks' }, 500

class StockDetail(Resource):
	method_decorators = [authenticate]

	parser = reqparse.RequestParser()
	parser.add_argument(
		'symbol',
		type=str,
		required=True,
		help="Must include stock ticker symbol!"
	)

	def get(self):
		try:
			symbol = StockDetail.parser.parse_args()['symbol']
			stock = Stock(symbol)
			company = stock.get_company()
			quote = stock.get_quote()
			stats = stock.get_key_stats()

			return {
				'symbol': company['symbol'],
				'name': company['companyName'],
				'description': company['description'],
				'ceo': company['CEO'],
				'employees': company['employees'],
				'industry': company['industry'],
				'price': quote['latestPrice'],
				'volume': quote['volume'],
				'avgVolume': stats['avg10Volume'],
				'week52High': stats['week52high'],
				'week52Low': stats['week52low'],
				'marketCap': stats['marketcap'],
				'peRatio': stats['peRatio'],
				'dividendYield': stats['dividendYield']
			}, 200
		except Exception as e:
			print('Error while retrieving company', e, file=sys.stderr)
			return { 'message': 'Could not find company' }, 500

class StockChart(Resource):
	method_decorators = [authenticate]

	parser = reqparse.RequestParser()
	parser.add_argument(
		'symbol',
		type=str,
		required=True,
		help="Must include stock ticker symbol!"
	)

	def get(self, date_agg):
		try:
			symbol = StockChart.parser.parse_args()['symbol']
			chart_data = self.get_chart_data(symbol, date_agg)
			
			return chart_data, 200
		except Exception as e:
			print('Error while retrieving Stock Chart Data for Day', e, file=sys.stderr)
			return { 'message': 'Server error while retrieving stock chart data' }, 500
	
	def get_chart_data(self, symbol, date_agg):
		if date_agg == '5d':
			return self.get_chart_data_intraday(symbol, 5)
		elif date_agg == '1m' or date_agg == '6m' or date_agg == '1y' or date_agg == '5y':
			return self.get_chart_data_interday(symbol, date_agg)
		
		return self.get_chart_data_intraday(symbol)

	def _combine_list_reduce_callback(self, acc_list, curr_list):
		acc_list += curr_list

		return acc_list

	def get_chart_data_interday(self, symbol, range):
		offset = pandas.offsets.DateOffset(months=1)

		if range == '6m':
			offset = pandas.offsets.DateOffset(months=6)
		elif range == '1y':
			offset = pandas.offsets.DateOffset(years=1)
		elif range == '5y':
			offset = pandas.offsets.DateOffset(years=5)
		
		start_date = datetime.today() - offset
		chart_data_dict = get_historical_data(symbol, start=start_date, end=datetime.today(), close_only=True)
		chart_data = []

		for date in chart_data_dict:
			chart_data_point = chart_data_dict[date]
			chart_data.append({
				'date': date,
				'close': chart_data_point['close']
			})

		return chart_data

	def get_chart_data_intraday(self, symbol, num_days = 1):
		last_business_day = datetime.today()

		if not self.is_business_day(last_business_day):
			last_business_day = last_business_day - BDay(1)

		business_days = []
		for _i in range(num_days):
			business_days.insert(0, last_business_day.strftime("%Y%m%d"))
			last_business_day = last_business_day - BDay(1)
		
		loop = asyncio.new_event_loop()
		asyncio.set_event_loop(loop)
		futures = list(map(lambda date: loop.run_in_executor(
			None,
			functools.partial(
				get_historical_intraday,
				symbol=symbol,
				date=date
			)
		), business_days))
		results = loop.run_until_complete(asyncio.gather(*futures))
		loop.close()

		return reduce(
			self._combine_list_reduce_callback,
			results,
			[]
		)
	
	def is_business_day(self, date):
		return bool(len(pandas.bdate_range(date, date)))
