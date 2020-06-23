from flask import session
from flask_restful import Resource, reqparse
from google.oauth2 import id_token
from google.auth.transport import requests
from ..helpers.redis import get_redis
import sys
import os
import secrets

from ..models.user import User

class Login(Resource):
	parser = reqparse.RequestParser()
	parser.add_argument('idToken',
		type=str,
		required=True,
		help="Must Have ID Token!")
	
	def post(self):
		try:
			## Need to get access token and verify with google
			data = Login.parser.parse_args()
			token = data['idToken']

			id_info = id_token.verify_oauth2_token(token, requests.Request(), os.getenv('GOOGLE_CLIENT_ID'))

			if id_info['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
				raise ValueError('Wrong issuer')

			## find user and add it to session
			user_name = id_info['name']
			user_email = id_info['email']

			user = User.find_user_by_email(user_email)

			if (user is None):
				user = User(user_name, user_email)
				user.save_to_db()
				user = User.find_user_by_email(user_email)
			
			session.permanent = True
			# session['user_id'] = user.id
			session_id = secrets.token_urlsafe()
			get_redis().set(f'session:{session_id}', user.id)
			session['session_id'] = session_id

			return { "message": "Login Success" }, 200
		except Exception as e:
			print('Error while logging in:', e, file=sys.stderr)
			return { "message": "Unauthorized" }, 401

class Logout(Resource):
	def post(self):
		session_id = session.get('session_id', '')
		get_redis().delete(f'session:{session_id}')
		session.clear()
		return { "message": "Logout Success" }, 200
