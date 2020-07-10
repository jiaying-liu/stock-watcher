from flask import Flask, session
from flask_restful import Resource, Api
from flask_cors import CORS
from .db import db
from .resources.auth import Login, Logout
from .resources.user import CurrentUser
from .resources.stock import StockDetail, StockList, StockChart
from .resources.stock_alert import UserStockAlertList, StockAlertResource
from .jobs.stock_alert import schedule_stock_alerts
from dotenv import load_dotenv

import logging
import os
import sys

load_dotenv()
app = Flask(__name__)
CORS(app, resource = r"/api/*", origins = os.getenv('ORIGIN_URI'), supports_credentials = True)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_HOST')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = os.getenv('SECRET_KEY')
api = Api(app)
db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/')
def hello():
    return 'Hello World'

api.add_resource(Login, '/api/login')
api.add_resource(Logout, '/api/logout')
api.add_resource(CurrentUser, '/api/current-user')
api.add_resource(UserStockAlertList, '/api/users/<int:user_id>/stock-alerts')
api.add_resource(StockAlertResource, '/api/stock-alerts/<int:stock_alert_id>')
api.add_resource(StockDetail, '/api/stocks/details')
api.add_resource(StockList, '/api/stocks')
api.add_resource(StockChart, '/api/stocks/chart/<string:date_agg>')

app.run(port=os.getenv('PORT', 5000))

schedule_stock_alerts()
