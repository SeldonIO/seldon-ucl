from flaskApp import app, socketio, db
from flask import request, jsonify
from flask import Flask, make_response
from flask_socketio import join_room, leave_room, emit
from . import tasks, models
from werkzeug import secure_filename
import os
import random
import datetime

@socketio.on('connect')
def connected():
	print("User %s has connected" % request.sid)

@socketio.on('disconnect')
def disconnected():
	print("User %s has disconnected" % request.sid)

@socketio.on('metadata')
def metadata(data):
	if "requestID" in data and "sessionID" in data:
		join_room(data["sessionID"])

		result = tasks.metadata.delay(data)
		operation = models.CeleryOperation(data["sessionID"], data['requestID'], 'metadata', result.task_id)
		db.session.add(operation)
		db.session.commit()

@socketio.on('data')
def data(data):
	if "requestID" in data and "sessionID" in data:
		join_room(data["sessionID"])
		
		result = tasks.data.delay(data)
		operation = models.CeleryOperation(data["sessionID"], data['requestID'], 'data', result.task_id)
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
	if "requestID" in data and "sessionID" in data and "rowIndices" in data:
		join_room(data["sessionID"])

		result = tasks.deleteRows.delay(data['sessionID'], data['requestID'], data['rowIndices'])
		operation = models.CeleryOperation(data["sessionID"], data['requestID'], 'deleteRows', result.task_id)
		db.session.add(operation)
		db.session.commit()

@socketio.on('deleteColumns')
def deleteRows(data):
	if "requestID" in data and "sessionID" in data and "columnIndices" in data:
		join_room(data["sessionID"])

		result = tasks.deleteColumns.delay(data['sessionID'], data['requestID'], data['columnIndices'])
		operation = models.CeleryOperation(data["sessionID"], data['requestID'], 'deleteColumns', result.task_id)
		db.session.add(operation)
		db.session.commit()

@socketio.on('changeColumnDataType')
def changeColumnDataType(data):
	if "requestID" in data and "sessionID" in data and "column" in data and "newDataType" in data:
		join_room(data["sessionID"])

		result = tasks.changeColumnDataType.delay(data['sessionID'], data['requestID'], data['column'], data['newDataType'], dateFormat=data["dateFormat"] if "dateFormat" in data else None)
		operation = models.CeleryOperation(data["sessionID"], data['requestID'], 'changeColumnDataType', result.task_id)
		db.session.add(operation)
		db.session.commit()

@socketio.on('fillDown')
def fillDown(data):
	if "requestID" in data and "sessionID" in data and "columnFrom" in data and "columnTo" in data and "method" in data:
		join_room(data["sessionID"])

		result = tasks.fillDown.delay(data['sessionID'], data['requestID'], data['columnFrom'], data['columnTo'], data['method'])
		operation = models.CeleryOperation(data["sessionID"], data['requestID'], 'fillDown', result.task_id)
		db.session.add(operation)
		db.session.commit()

@socketio.on('interpolate')
def interpolate(data):
	if "requestID" in data and "sessionID" in data and "columnIndex" in data and "method" in data and "order" in data:
		join_room(data["sessionID"])

		result = tasks.interpolate.delay(data['sessionID'], data['requestID'], data["columnIndex"], data['method'], data['order'])
		operation = models.CeleryOperation(data["sessionID"], data['requestID'], 'interpolate', result.task_id)
		db.session.add(operation)
		db.session.commit()

@socketio.on('fillWithCustomValue')
def fillWithCustomValue(data):
	if "requestID" in data and "sessionID" in data and "columnIndex" in data and "newValue" in data:
		join_room(data["sessionID"])

		result = tasks.fillWithCustomValue.delay(data['sessionID'], data['requestID'], data["columnIndex"], data['newValue'])
		operation = models.CeleryOperation(data["sessionID"], data['requestID'], 'fillWithCustomValue', result.task_id)
		db.session.add(operation)
		db.session.commit()

@socketio.on('fillWithAverage')
def fillWithAverage(data):
	if "requestID" in data and "sessionID" in data and "columnIndex" in data and "metric" in data:
		join_room(data["sessionID"])

		result = tasks.fillWithAverage.delay(data['sessionID'], data['requestID'], data["columnIndex"], data['metric'])
		operation = models.CeleryOperation(data["sessionID"], data['requestID'], 'fillWithAverage', result.task_id)
		db.session.add(operation)
		db.session.commit()

@socketio.on('standardize')
def standardize(data):
	if "requestID" in data and "sessionID" in data and "columnIndex" in data:
		join_room(data["sessionID"])

		result = tasks.standardize.delay(data['sessionID'], data['requestID'], data["columnIndex"])
		operation = models.CeleryOperation(data["sessionID"], data['requestID'], 'standardize', result.task_id)
		db.session.add(operation)
		db.session.commit()

@socketio.on('normalize')
def normalize(data):
	if "requestID" in data and "sessionID" in data and "columnIndex" in data and "rangeFrom" in data and "rangeTo" in data:
		join_room(data["sessionID"])

		result = tasks.normalize.delay(data['sessionID'], data['requestID'], data["columnIndex"], data['rangeFrom'], data['rangeTo'])
		operation = models.CeleryOperation(data["sessionID"], data['requestID'], 'normalize', result.task_id)
		db.session.add(operation)
		db.session.commit()

@socketio.on('deleteRowsWithNA')
def normalize(data):
	if "requestID" in data and "sessionID" in data and "columnIndex" in data:
		join_room(data["sessionID"])

		result = tasks.deleteRowsWithNA.delay(data['sessionID'], data['requestID'], data["columnIndex"])
		operation = models.CeleryOperation(data["sessionID"], data['requestID'], 'deleteRowsWithNA', result.task_id)
		db.session.add(operation)
		db.session.commit()

@socketio.on('findReplace')
def normalize(data):
	if "requestID" in data and "sessionID" in data and "columnIndex" in data and "toReplace" in data and "replaceWith" in data and "matchRegex" in data:
		join_room(data["sessionID"])

		result = tasks.findReplace.delay(data['sessionID'], data['requestID'], data["columnIndex"], data["toReplace"], data["replaceWith"], data["matchRegex"])
		operation = models.CeleryOperation(data["sessionID"], data['requestID'], 'findReplace', result.task_id)
		db.session.add(operation)
		db.session.commit()

@socketio.on('generateDummies')
def normalize(data):
	if "requestID" in data and "sessionID" in data and "columnIndex" in data and "inplace" in data:
		join_room(data["sessionID"])

		result = tasks.generateDummies.delay(data['sessionID'], data['requestID'], data["columnIndex"], data["inplace"])
		operation = models.CeleryOperation(data["sessionID"], data['requestID'], 'generateDummies', result.task_id)
		db.session.add(operation)
		db.session.commit()

@socketio.on('analyze')
def analyze(data):
	if "requestID" in data and "sessionID" in data and "column" in data:
		join_room(data["sessionID"])

		result = tasks.analyze.delay(data['sessionID'], data['requestID'], data['column'])
		operation = models.CeleryOperation(data['sessionID'], data['requestID'], 'analyze', result.task_id)
		db.session.add(operation)
		db.session.commit()

@socketio.on('visualize')
def visualize(data):
	if "requestID" in data and "sessionID" in data and "type" in data:
		join_room(data["sessionID"])

		result = tasks.visualize.delay(data)
		operation = models.CeleryOperation(data['sessionID'], data['requestID'], 'visualize', result.task_id)
		db.session.add(operation)
		db.session.commit()

@socketio.on('undo')
def undo(data):
	if "requestID" in data and "sessionID" in data:
		join_room(data["sessionID"])
		result = tasks.undo.delay(data["sessionID"], data["requestID"])
		operation = models.CeleryOperation(data['sessionID'], data['requestID'], 'undo', result.task_id)
		db.session.add(operation)
		db.session.commit()

def generateRandomID():
	return "%030x" % random.randrange(16**30)

@app.route('/celeryTaskCompleted/', methods=['POST'])
def celeryTaskCompleted():
	# print("Got POSTed data at " + str(datetime.datetime.now()))
	start = datetime.datetime.now()
	task = request.get_json()
	if "sessionID" in task and "requestID" in task:
		pendingTask = models.CeleryOperation.query.filter_by(sessionID=task["sessionID"]).filter_by(requestID=task["requestID"]).first()
		if pendingTask is not None:			
			db.session.delete(pendingTask)
			db.session.commit()
			# print("received proper task completion signal: %s" % pendingTask.operation)
			# print("sending message '%s' with contents: %s" % (pendingTask.operation, task))
			# print("Prepared to send ", pendingTask.operation, " in ", str(datetime.datetime.now() - start))
			socketio.emit(pendingTask.operation, task, room=task["sessionID"])

			if "changed" in task and task["changed"]:
				socketio.emit("dataChanged", {"requestID": task["requestID"]}, room=task["sessionID"])
	return ""

@app.route('/upload/', methods=['POST'])
def upload():
	file = request.files['file']
	fileType = request.form['fileType']
	uploadID = generateRandomID()
	initialSkip = int(request.form['initialSkip'])
	sampleSize = float(request.form['sampleSize'])
	seed = request.form['seed']
	headerIncluded = request.form['headerIncluded']
	if file:
		if fileType == "text/csv":
			file.save('flaskApp/temp/' + uploadID + '.csv')
			result = tasks.userUploadedCSVToDataFrame.delay(uploadID, initialSkip, sampleSize, seed, headerIncluded).get()
		if fileType == "application/json":
			file.save('flaskApp/temp/' + uploadID + '.json')
			result = tasks.userUploadedJSONToDataFrame.delay(uploadID, initialSkip, sampleSize, seed).get()
	if result is not None:
		return jsonify({'success':True, 'sessionID': result})
	else:
		return jsonify({'success':False})

@app.route("/downloadJSON/<sessionID>")
def downloadJSON(sessionID):
    result = tasks.DFtoJSON.delay(sessionID).get()
    response = make_response(result)
    response.headers["Content-Disposition"] = "attachment; filename=data.json"
    response.headers["Content-Type"] = "application/json"
    return response

@app.route("/downloadCSV/<sessionID>")
def downloadCSV(sessionID):
    result = tasks.DataFrameToCSV.delay(sessionID).get()
    response = make_response(result)
    response.headers["Content-Disposition"] = "attachment; filename=data.csv"
    response.headers["Content-Type"] = "text/csv"
    return response       