from flaskApp import app, socketio
from flask import request, jsonify
from flask_socketio import join_room, leave_room, emit
from . import tasks
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
		emit('fullJSON', {'requestID': data["requestID"], 'data': DataFrameToJSON(retrieveDataFrameFromCache(data['sessionID']))})

@app.route('/', methods=["GET"])
def angular():
	return application.send_static_file('index.html')

def generateRandomSessionID():
	return "%030x" % random.randrange(16**30)

@app.route('/upload/', methods=['POST'])
def upload():
	file = request.files['file']
	uploadID = generateRandomID()
	tasks.loadUserUploadedCSV(file, uploadID)
	return jsonify(uploadID=uploadID)