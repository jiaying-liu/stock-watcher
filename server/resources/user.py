from flask_restful import Resource
from flask import session
from flask_cors import cross_origin
from ..models.user import User
from ..decorators import authenticate
from ..helpers.redis import get_redis
import sys

class CurrentUser(Resource):
	method_decorators = [authenticate]
	
	def get(self):
		try:
			session_id = session.get('session_id', '')
			user_id = get_redis().get(f'session:{session_id}')

			if user_id is None:
				raise Exception('Invalid Session ID!')
			
			user = User.find_user_by_id(user_id)

			if user is None:
				raise Exception('User does not exist!')

			return user.to_json(), 200
		except Exception as e:
			print('Error while getting current user:', e, file=sys.stderr)
			return { "message": "Error" }, 500
