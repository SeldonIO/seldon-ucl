from flaskApp import app, socketio, db
from flask import request, jsonify
from flask import Flask, make_response
from flask_socketio import join_room, leave_room, emit
from . import tasks, models
import os
import random
import datetime

@socketio.on('connect')
def connected():
	print("User %s has connected" % request.sid)

@socketio.on('disconnect')
def disconnected():
	print("User %s has disconnected" % request.sid)

def updateSessionID(socketID, sessionID):
	user = models.User.query.filter_by(socketID=socketID).first()
	if user is None:
		user = models.User(socketID, sessionID)
		db.session.add(user)
	user.sessionID = sessionID
	db.session.commit()

@socketio.on('metadata')
def metadata(data):
	if "requestID" in data and "sessionID" in data:
		join_room(data["sessionID"])
		updateSessionID(request.sid, data["sessionID"])
		result = tasks.metadata.delay(data)

@socketio.on('data')
def data(data):
	if "requestID" in data and "sessionID" in data:
		join_room(data["sessionID"])
		updateSessionID(request.sid, data["sessionID"])
		result = tasks.data.delay(data)

@socketio.on('renameColumn')
def renameColumn(data):
	if "requestID" in data and "sessionID" in data and "column" in data and "newName" in data:
		join_room(data["sessionID"])
		updateSessionID(request.sid, data["sessionID"])
		result = tasks.renameColumn.delay(data['sessionID'], data['requestID'], data['column'], data['newName'])

@socketio.on('newCellValue')
def newCellValue(data):
	if "requestID" in data and "sessionID" in data and "columnIndex" in data and "rowIndex" in data and "newValue" in data:
		join_room(data["sessionID"])
		updateSessionID(request.sid, data["sessionID"])
		result = tasks.newCellValue.delay(data['sessionID'], data['requestID'], data['columnIndex'], data['rowIndex'], data['newValue'])

@socketio.on('emptyStringToNan')
def emptyStringToNan(data):
	if "requestID" in data and "sessionID" in data and "columnIndex" in data:
		join_room(data["sessionID"])
		updateSessionID(request.sid, data["sessionID"])
		result = tasks.emptyStringToNan.delay(data['sessionID'], data['requestID'], data['columnIndex'])

@socketio.on('deleteRows')
def deleteRows(data):
	if "requestID" in data and "sessionID" in data and "rowIndices" in data:
		join_room(data["sessionID"])
		updateSessionID(request.sid, data["sessionID"])
		result = tasks.deleteRows.delay(data['sessionID'], data['requestID'], data['rowIndices'])

@socketio.on('deleteColumns')
def deleteColumns(data):
	if "requestID" in data and "sessionID" in data and "columnIndices" in data:
		join_room(data["sessionID"])
		updateSessionID(request.sid, data["sessionID"])
		result = tasks.deleteColumns.delay(data['sessionID'], data['requestID'], data['columnIndices'])

@socketio.on('changeColumnDataType')
def changeColumnDataType(data):
	if "requestID" in data and "sessionID" in data and "column" in data and "newDataType" in data:
		join_room(data["sessionID"])
		updateSessionID(request.sid, data["sessionID"])
		result = tasks.changeColumnDataType.delay(data['sessionID'], data['requestID'], data['column'], data['newDataType'], dateFormat=data["dateFormat"] if "dateFormat" in data else None)

@socketio.on('fillDown')
def fillDown(data):
	if "requestID" in data and "sessionID" in data and "columnFrom" in data and "columnTo" in data and "method" in data:
		join_room(data["sessionID"])
		updateSessionID(request.sid, data["sessionID"])
		result = tasks.fillDown.delay(data['sessionID'], data['requestID'], data['columnFrom'], data['columnTo'], data['method'])

@socketio.on('interpolate')
def interpolate(data):
	if "requestID" in data and "sessionID" in data and "columnIndex" in data and "method" in data and "order" in data:
		join_room(data["sessionID"])
		updateSessionID(request.sid, data["sessionID"])
		result = tasks.interpolate.delay(data['sessionID'], data['requestID'], data["columnIndex"], data['method'], data['order'])

@socketio.on('fillWithCustomValue')
def fillWithCustomValue(data):
	if "requestID" in data and "sessionID" in data and "columnIndex" in data and "newValue" in data:
		join_room(data["sessionID"])
		updateSessionID(request.sid, data["sessionID"])
		result = tasks.fillWithCustomValue.delay(data['sessionID'], data['requestID'], data["columnIndex"], data['newValue'])

@socketio.on('fillWithAverage')
def fillWithAverage(data):
	if "requestID" in data and "sessionID" in data and "columnIndex" in data and "metric" in data:
		join_room(data["sessionID"])
		updateSessionID(request.sid, data["sessionID"])
		result = tasks.fillWithAverage.delay(data['sessionID'], data['requestID'], data["columnIndex"], data['metric'])

@socketio.on('standardize')
def standardize(data):
	if "requestID" in data and "sessionID" in data and "columnIndex" in data:
		join_room(data["sessionID"])
		updateSessionID(request.sid, data["sessionID"])
		result = tasks.standardize.delay(data['sessionID'], data['requestID'], data["columnIndex"])

@socketio.on('normalize')
def normalize(data):
	if "requestID" in data and "sessionID" in data and "columnIndex" in data and "rangeFrom" in data and "rangeTo" in data:
		join_room(data["sessionID"])
		updateSessionID(request.sid, data["sessionID"])
		result = tasks.normalize.delay(data['sessionID'], data['requestID'], data["columnIndex"], data['rangeFrom'], data['rangeTo'])

@socketio.on('deleteRowsWithNA')
def deleteRowsWithNA(data):
	if "requestID" in data and "sessionID" in data and "columnIndex" in data:
		join_room(data["sessionID"])
		updateSessionID(request.sid, data["sessionID"])
		result = tasks.deleteRowsWithNA.delay(data['sessionID'], data['requestID'], data["columnIndex"])

@socketio.on('findReplace')
def findReplace(data):
	if "requestID" in data and "sessionID" in data and "columnIndex" in data and "toReplace" in data and "replaceWith" in data and "matchRegex" in data:
		join_room(data["sessionID"])
		updateSessionID(request.sid, data["sessionID"])
		result = tasks.findReplace.delay(data['sessionID'], data['requestID'], data["columnIndex"], data["toReplace"], data["replaceWith"], data["matchRegex"])

@socketio.on('generateDummies')
def generateDummies(data):
	if "requestID" in data and "sessionID" in data and "columnIndex" in data and "inplace" in data:
		join_room(data["sessionID"])
		updateSessionID(request.sid, data["sessionID"])
		result = tasks.generateDummies.delay(data['sessionID'], data['requestID'], data["columnIndex"], data["inplace"])

@socketio.on('insertDuplicateColumn')
def insertDuplicateColumn(data):
	if "requestID" in data and "sessionID" in data and "columnIndex" in data:
		join_room(data["sessionID"])
		updateSessionID(request.sid, data["sessionID"])
		result = tasks.insertDuplicateColumn.delay(data['sessionID'], data['requestID'], data["columnIndex"])

@socketio.on('splitColumn')
def splitColumn(data):
	if "requestID" in data and "sessionID" in data and "columnIndex" in data and "delimiter" in data and "regex" in data:
		join_room(data["sessionID"])
		updateSessionID(request.sid, data["sessionID"])
		result = tasks.splitColumn.delay(data['sessionID'], data['requestID'], data["columnIndex"], data["delimiter"], data["regex"])

@socketio.on('combineColumns')
def combineColumns(data):
	if "requestID" in data and "sessionID" in data and "columnsToCombine" in data and "seperator" in data and "newName" in data and "insertIndex" in data:
		join_room(data["sessionID"])
		updateSessionID(request.sid, data["sessionID"])
		result = tasks.combineColumns.delay(data['sessionID'], data['requestID'], data["columnsToCombine"], data["seperator"], data["newName"], data["insertIndex"])

@socketio.on('discretize')
def discretize(data):
	if "requestID" in data and "sessionID" in data and "columnIndex" in data and "cutMode" in data and "numberOfBins" in data:
		join_room(data["sessionID"])
		updateSessionID(request.sid, data["sessionID"])
		result = tasks.discretize.delay(data['sessionID'], data['requestID'], data["columnIndex"], data["cutMode"], data["numberOfBins"])

# HIGHWAY TO THE DANGER ZONE
@socketio.on('executeCommand')
def executeCommand(data):
	if "requestID" in data and "sessionID" in data and "command" in data:
		join_room(data["sessionID"])
		updateSessionID(request.sid, data["sessionID"])
		result = tasks.executeCommand.delay(data['sessionID'], data['requestID'], data["command"])

@socketio.on('analyze')
def analyze(data):
	if "requestID" in data and "sessionID" in data and "column" in data:
		join_room(data["sessionID"])
		updateSessionID(request.sid, data["sessionID"])
		result = tasks.analyze.delay(data['sessionID'], data['requestID'], data['column'])

@socketio.on('visualize')
def visualize(data):
	if "requestID" in data and "sessionID" in data and "type" in data:
		join_room(data["sessionID"])
		updateSessionID(request.sid, data["sessionID"])
		result = tasks.visualize.delay(data)

@socketio.on('undo')
def undo(data):
	if "requestID" in data and "sessionID" in data:
		join_room(data["sessionID"])
		updateSessionID(request.sid, data["sessionID"])
		result = tasks.undo.delay(data["sessionID"], data["requestID"])

def generateRandomID():
	return "%030x" % random.randrange(16**30)

@app.route('/celeryTaskCompleted/', methods=['POST'])
def celeryTaskCompleted():
	# print("Got POSTed data at " + str(datetime.datetime.now()))
	start = datetime.datetime.now()
	task = request.get_json()
	if "sessionID" in task and "requestID" in task and "operation" in task:
		socketio.emit(task["operation"], task, room=task["sessionID"])

		if "changed" in task and task["changed"]:
			socketio.emit("dataChanged", {"requestID": task["requestID"]}, room=task["sessionID"])
	return ""

@app.route('/upload/', methods=['POST'])
def upload():
	file = request.files['file']
	filename, fileType = os.path.splitext(file.filename)
	uploadID = generateRandomID()
	initialSkip = int(request.form['initialSkip'])
	sampleSize = float(request.form['sampleSize'])
	seed = request.form['seed']
	headerIncluded = request.form['headerIncluded']
	if file:
		if fileType == ".csv":
			file.save('flaskApp/temp/' + uploadID + '.csv')
			result = tasks.userUploadedCSVToDataFrame.delay(uploadID, initialSkip, sampleSize, seed, headerIncluded).get()
		if fileType == ".json":
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