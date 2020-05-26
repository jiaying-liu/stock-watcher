from functools import wraps
from flask import session
from .models.user import User
from flask_restful import abort
import sys

def authenticate(func):
	@wraps(func)
	def wrapper(*args, **kwargs):
		user_id = session.get('user_id', -1)
		user = User.find_user_by_id(user_id)
		
		if user is None:
			return abort(401)

		return func(*args, **kwargs)
	return wrapper