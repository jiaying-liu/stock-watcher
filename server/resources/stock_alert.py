from flask_restful import Resource, reqparse
from ..decorators import authenticate
from ..models.stock_alert import StockAlert

import sys

class StockAlertResource(Resource):
	method_decorators = [authenticate]

	parser = reqparse.RequestParser()
	parser.add_argument(
		'condition',
		type=str,
		required=True,
		help='Must have condition!'
	)
	parser.add_argument(
		'price',
		type=float,
		required=True,
		help="Must have price!"
	)
	def put(self, stock_alert_id):
		try:
			data = StockAlertResource.parser.parse_args()
			condition = data['condition']
			price = int(data['price'] * 100)
			stock_alert = StockAlert.get_stock_alert_by_id(stock_alert_id)
			stock_alert.update_price(price)
			stock_alert.update_condition(condition)
			stock_alert.commit_db_changes()
			
			return { 'message': 'Success!' }, 200
		except Exception as e:
			print('Error while creating stock alert', e, file=sys.stderr)
			return { "message": "Error" }, 500

	def delete(self, stock_alert_id):
		try:
			stock_alert = StockAlert.get_stock_alert_by_id(stock_alert_id)
			stock_alert.delete_from_db()

			return { 'message': 'Successfully deleted stock alert!' }, 200
		except Exception as e:
			print('Error while deleting stock alert', e, file=sys.stderr)
			return { 'message': 'Error while deleting stock alert' }, 500


class UserStockAlertList(Resource):
	method_decorators = [authenticate]
	parser = reqparse.RequestParser()
	parser.add_argument(
		'stockTicker',
		type=str,
		required=True,
		help="Must have stock ticker symbol (stockTicker)!"
	)
	parser.add_argument(
		'stockName',
		type=str,
		required=True,
		help="Must have stock name (stockName)!"
	)
	parser.add_argument(
		'condition',
		type=str,
		required=True,
		help='Must have condition!'
	)
	parser.add_argument(
		'price',
		type=float,
		required=True,
		help="Must have price!"
	)

	def get(self, user_id):
		try:
			stock_alerts = StockAlert.get_stock_alerts_for_user(user_id)
			
			stock_alerts_json = list(map(lambda stock_alert: stock_alert.to_json(), stock_alerts))

			return stock_alerts_json, 200
		except Exception as e:
			print('Error while getting stock list for user:', e, file=sys.stderr)
			return { "message": "Error" }, 500
	
	def post(self, user_id):
		print('posting stock alert')
		try:
			data = UserStockAlertList.parser.parse_args()
			stock_ticker = data['stockTicker']
			stock_name = data['stockName']
			condition = data['condition']
			price = int(data['price'] * 100)
			stock_alert = StockAlert(stock_ticker, stock_name, condition, price, user_id)
			stock_alert.save_to_db()
			
			return { "id": stock_alert.id }, 201
		except Exception as e:
			print('Error while creating stock alert', e, file=sys.stderr)
			return { "message": "Error" }, 500