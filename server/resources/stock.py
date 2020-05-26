from flask_restful import Resource, reqparse
from ..decorators import authenticate
from iexfinance.stocks import Stock
from iexfinance.refdata import get_symbols

import os
import sys

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
