from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine

import os
import sys

db = SQLAlchemy()

def _convert_result_to_list (result):
	return list(map(lambda row: dict(row), result))

def run_query (query, values={}):
	try:
		connection = create_engine(os.getenv(
			'DATABASE_HOST',
		)).connect()
		
		return _convert_result_to_list(connection.execute(query, **values))
	except Exception as e:
		print('Error while running query', e, file=sys.stderr)
