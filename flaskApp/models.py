from flaskApp import db

class User(db.Model):
	socketID = db.Column(db.String(32), primary_key=True)
	sessionID = db.Column(db.String(30))

	def __init__(self, socketID, sessionID):
		self.socketID = socketID
		self.sessionID = sessionID

	def __repr__(self):
		return "Socket user %s accessing %s" % (self.socketID, self.sessionID)