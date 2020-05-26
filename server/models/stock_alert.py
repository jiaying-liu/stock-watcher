from ..db import db

class StockAlert(db.Model):
	__tablename__ = 'stock_alert'
	__tableargs__ = (
		db.UniqueConstraint('stock_ticker', 'user_id', name='stock_ticker_user_id_uc')
	)

	id = db.Column(db.Integer, primary_key=True, autoincrement=True)
	stock_ticker = db.Column(db.String(50))
	stock_name = db.Column(db.String(255))
	condition = db.Column(db.String(255))
	price = db.Column(db.Integer) ## sqlite does not support decimals so will need to store as integer
	## price will be in cents. This should be changed when using different type of database
	user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

	def __init__(self, stock_ticker, stock_name, condition, price, user_id):
		self.stock_ticker = stock_ticker
		self.stock_name = stock_name
		self.condition = condition
		self.price = price
		self.user_id = user_id
	
	def update_price(self, price):
		self.price = price
	
	def update_condition(self, condition):
		self.condition = condition

	def save_to_db(self):
		db.session.add(self)
		self.commit_db_changes()
	
	def delete_from_db(self):
		db.session.delete(self)
		self.commit_db_changes()
	
	def commit_db_changes(self):
		db.session.commit()
	
	def to_json(self):
		return {
			'id': self.id,
			'stockName': self.stock_name,
			'stockTicker': self.stock_ticker,
			'condition': self.condition,
			'price': self.price / 100
		}
	
	@classmethod
	def get_stock_alerts_for_user(cls, user_id):
		return cls.query.filter_by(user_id = user_id).all()
	
	@classmethod
	def get_all_stock_alerts (cls):
		return cls.query.all()
	
	@classmethod
	def get_stock_alert_by_id(cls, stock_alert_id):
		return cls.query.filter_by(id = stock_alert_id).first()
