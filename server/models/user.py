from ..db import db

class User(db.Model):
	__tablename__ = 'user'

	id = db.Column(db.Integer, primary_key=True)
	name = db.Column(db.String(128))
	email = db.Column(db.String(128))

	def __init__(self, name, email):
		self.name = name
		self.email = email
	
	def save_to_db(self):
		db.session.add(self)
		db.session.commit()
	
	def to_json(self):
		return {
			'id': self.id,
			'name': self.name,
			'email': self.email
		}
	
	@classmethod
	def find_user_by_email(cls, email):
		return cls.query.filter_by(email=email).first()
	
	@classmethod
	def find_user_by_id(cls, user_id):
		return cls.query.filter_by(id=user_id).first()
	