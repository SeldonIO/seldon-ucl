from flask import Flask, request, jsonify
from flask_socketio import SocketIO, join_room, leave_room, emit

application = Flask(__name__)
application.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024
application.debug=True
socketio = SocketIO(application)

import pandas as pd ### temporary ###
import numpy as np ### temporary ###
import random
import tables

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

@application.route('/', methods=["GET"])
def angular():
	return application.send_static_file('index.html')

def retrieveDataFrameFromCache(sessionID):
	data = None
	if isinstance(sessionID, str) and len(sessionID) == 30:
		try:
			data = pd.read_hdf("cache/" + sessionID + ".h5", "original")
		except:
			pass
	return data if type(data) is pd.DataFrame else None

def DataFrameToJSON(data):
	if type(data) is pd.DataFrame:
		return data.to_json(orient="index") if type(data) is pd.DataFrame else ""

# returns DataFrame or None
def CSVtoDataFrame(filestream):
	data = None
	if filestream:
		try:
			data = pd.read_csv(filestream, encoding="cp1252")
			data["day"] = data["day"].astype(np.int)
			data["temperature"] = data["temperature"].astype(np.double)
		except:
			pass
	return data if type(data) is pd.DataFrame else None

def generateRandomSessionID():
	return "%030x" % random.randrange(16**30)

def saveToCache(df, sessionID):
	try:
		df.to_hdf("cache/" + sessionID + ".h5", "original", mode="w", format="table")
		return True
	except:
		return False

@application.route('/upload/', methods=['POST'])
def upload():
	file = request.files['file']
	if file:
		data = CSVtoDataFrame(file.stream)
	if data is not None:
		sessionID = generateRandomSessionID()
		if saveToCache(data, sessionID):
			return jsonify(success=True, sessionID=sessionID)
	return jsonify(success=False)

if __name__ == '__main__':
	socketio.run(application)