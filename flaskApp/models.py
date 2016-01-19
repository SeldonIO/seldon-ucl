from flaskApp import db

class CeleryOperation(db.Model):
	operation = db.Column(db.String(64))
	taskID = db.Column(db.String(36))
	sessionID = db.Column(db.String(30))
	requestID = db.Column(db.String(16), primary_key=True)

	def __init__(self, sessionID, requestID, operation, taskID):
		self.operation = operation
		self.taskID = taskID
		self.requestID = requestID
		self.sessionID = sessionID

	def __repr__(self):
		return '<CeleryOperation %r>' % self.taskID

class Client(db.Model):
	socketID = db.Column(db.String(36), primary_key=True)
	sessionID = db.Column(db.String(30))

	def __init__(self, socketID, sessionID):
		self.socketID = socketID
		self.sessionID = sessionID

	def __repr__(self):
		return '<Client %r>' % self.socketID