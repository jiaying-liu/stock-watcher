from functools import wraps
from flask import session
from .models.user import User
from flask_restful import abort
from .helpers.redis import get_redis
import sys

def authenticate(func):
	@wraps(func)
	def wrapper(*args, **kwargs):
		try:
			session_id = session.get('session_id', '')
			user_id = get_redis().get(f'session:{session_id}')

			if user_id is None:
				raise Exception('Invalid session id!')

			user = User.find_user_by_id(user_id)
			
			if user is None:
				raise Exception('User does not exist!')

			return func(*args, **kwargs)
		except Exception as e:
			print('Failed authentication:', e, file=sys.stderr)
			return abort(401)
	return wrapper