from flaskApp import app, socketio
from flask import request, jsonify
from flask_socketio import join_room, leave_room, emit
from . import tasks
from werkzeug import secure_filename
import os
import dcs.load
import random

@socketio.on('connect')
def connected():
	print("User %s has connected, but not yet identified himself/herself" % request.sid)

@socketio.on('disconnect')
def disconnected():
	print("User %s has disconnected" % request.sid)

@socketio.on('fullJSON')
def fullJSON(data):
	if "requestID" in data and "sessionID" in data:
		emit('fullJSON', {'requestID': data["requestID"], 'data': dcs.load.dataFrameToJSON(tasks.loadDataFrameFromCache(data['sessionID']))})

def generateRandomID():
	return "%030x" % random.randrange(16**30)

@app.route('/upload/', methods=['POST'])
def upload():
	file = request.files['file']
	uploadID = generateRandomID()
	if file:
		filename = secure_filename(file.filename)
		file.save('flaskApp/temp/' + uploadID + '.csv')
	result = tasks.loadUserUploadedCSV.delay(uploadID)
	return jsonify(result.get())