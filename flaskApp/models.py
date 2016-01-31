from flaskApp import db

class CeleryOperation(db.Model):
	operation = db.Column(db.String(64))
	taskID = db.Column(db.String(36), primary_key=True)
	sessionID = db.Column(db.String(30), primary_key=True)
	requestID = db.Column(db.String(16))

	def __init__(self, sessionID, requestID, operation, taskID):
		self.operation = operation
		self.taskID = taskID
		self.requestID = requestID
		self.sessionID = sessionID

	def __repr__(self):
		return '<CeleryOperation %r>' % self.taskID