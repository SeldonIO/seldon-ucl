from flaskApp import app, socketio, db
from flask import request, jsonify
from flask_socketio import join_room, leave_room, emit
from . import tasks, models
from werkzeug import secure_filename
import os
import dcs.load
import random

@socketio.on('connect')
def connected():
	print("User %s has connected" % request.sid)

@socketio.on('disconnect')
def disconnected():
	print("User %s has disconnected" % request.sid)

@socketio.on('fullJSON')
def fullJSON(data):
	if "requestID" in data and "sessionID" in data:
		join_room(data["sessionID"])

		result = tasks.fullJSON.delay(data['sessionID'], data['requestID'])
		operation = models.CeleryOperation(data["sessionID"], data['requestID'], 'fullJSON', result.task_id)
		db.session.add(operation)
		db.session.commit()

@socketio.on('renameColumn')
def renameColumn(data):
	if "requestID" in data and "sessionID" in data and "column" in data and "newName" in data:
		join_room(data["sessionID"])

		result = tasks.renameColumn.delay(data['sessionID'], data['requestID'], data['column'], data['newName'])
		operation = models.CeleryOperation(data["sessionID"], data['requestID'], 'renameColumn', result.task_id)
		db.session.add(operation)
		db.session.commit()

@socketio.on('deleteRows')
def deleteRows(data):
	if "requestID" in data and "sessionID" in data and "rowFrom" in data and "rowTo" in data:
		join_room(data["sessionID"])

		result = tasks.deleteRows.delay(data['sessionID'], data['requestID'], data['rowFrom'], data['rowTo'])
		operation = models.CeleryOperation(data["sessionID"], data['requestID'], 'deleteRows', result.task_id)
		db.session.add(operation)
		db.session.commit()

@socketio.on('changeColumnDataType')
def changeColumnDataType(data):
	if "requestID" in data and "sessionID" in data and "column" in data and "newDataType" in data:
		join_room(data["sessionID"])

		result = tasks.changeColumnDataType.delay(data['sessionID'], data['requestID'], data['column'], data['newDataType'])
		operation = models.CeleryOperation(data["sessionID"], data['requestID'], 'changeColumnDataType', result.task_id)
		db.session.add(operation)
		db.session.commit()

def generateRandomID():
	return "%030x" % random.randrange(16**30)

@app.route('/celeryTaskCompleted/', methods=['POST'])
def celeryTaskCompleted():
	task = request.get_json()
	if "sessionID" in task and "requestID" in task:
		pendingTask = models.CeleryOperation.query.filter_by(sessionID=task["sessionID"]).filter_by(requestID=task["requestID"]).first()
		if pendingTask is not None:			
			db.session.delete(pendingTask)
			db.session.commit()
			print("received proper task completion signal: %s" % pendingTask.operation)
			print("sending message '%s' with contents: %s" % (pendingTask.operation, task))
			socketio.emit(pendingTask.operation, task, room=task["sessionID"])
	return ""

@app.route('/upload/', methods=['POST'])
def upload():
	file = request.files['file']
	uploadID = generateRandomID()
	if file:
		file.save('flaskApp/temp/' + uploadID + '.csv')

	result = tasks.userUploadedCSVToDataFrame.delay(uploadID).get()

	if result is not None:
		return jsonify({'success':True, 'sessionID': result})
	else:
		return jsonify({'success':False})