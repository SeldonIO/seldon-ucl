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

"""
@socketio.on('setColumnType')
def setColumnType(data):
	if "requestID" in data and "sessionID" in data and "column" in data and "newType" in data:
		toReturn = {'success' : False, 'requestID': data["requestID"]}

		df = tasks.loadDataFrameFromCache(data['sessionID'])
		if df is not None:
			sessions[request.sid] = data["sessionID"] ### kind of temporary ####

			# check validity of column
			columnIndex = -1
			try: 
				columnIndex = int(data["columnIndex])
			except:
				pass

			if columnIndex >= 0 and columnIndex < len(df.columns):
				# valid column index
				if data["newType"] == "float":
					data[str(data.columns[columnIndex]) + "_original"] = data[data.columns[columnIndex]].copy(deep=True)
					converted = dcs.load.dataFrameColumnAsNumericType(df, columnIndex, )
					data[data.columns[columnIndex]] = converted
					tasks.saveToCache(data, data['sessionID'])
					toReturn['success'] = True
		emit('setColumnType', toReturn, room=request.sid)
"""

def generateRandomID():
	return "%030x" % random.randrange(16**30)

@app.route('/celeryTaskCompleted/', methods=['POST'])
def celeryTaskCompleted():
	task = request.get_json()
	if "sessionID" in task and "requestID" in task:
		print("received proper task completion signal: %s" % task)
		pendingTask = models.CeleryOperation.query.filter_by(sessionID=task["sessionID"]).filter_by(requestID=task["requestID"]).first()
		if pendingTask is not None:			
			db.session.delete(pendingTask)
			db.session.commit()
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