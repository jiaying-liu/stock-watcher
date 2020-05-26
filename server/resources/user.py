from flask_restful import Resource
from flask import session
from flask_cors import cross_origin
from ..models.user import User
from ..decorators import authenticate
import sys

class CurrentUser(Resource):
	method_decorators = [authenticate]
	
	def get(self):
		try:
			user_id = session.get('user_id')
			user = User.find_user_by_id(user_id)

			if user is None:
				raise Exception('User does not exist!')

			return user.to_json(), 200
		except Exception as e:
			print('Error while getting current user:', e, file=sys.stderr)
			return { "message": "Error" }, 500
