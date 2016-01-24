from flaskApp import celery
from flask import jsonify
import dcs.load
import dcs.clean
import os
import requests
import pandas as pd

# Returns a sessionID (str) on successful conversion, and None on fail
@celery.task()
def userUploadedCSVToDataFrame(uploadID):
	toReturn = None
	path = 'flaskApp/temp/' + uploadID + '.csv'
	if uploadID and os.path.isfile(path):
		data = dcs.load.CSVtoDataFrame('flaskApp/temp/' + uploadID + '.csv')
		os.remove(path)
		if data is not None and saveToCache(data, uploadID):
			toReturn = uploadID
	return toReturn

# Returns a pandas.DataFrame on successful loading, and None on fail
@celery.task()
def loadDataFrameFromCache(sessionID):
	if isinstance(sessionID, basestring) and len(sessionID) == 30:
		try:
			data = pd.read_hdf("flaskApp/cache/" + sessionID + ".h5", "original")
			if type(data) is pd.DataFrame:
				return data
		except:
			return None
	return None

# Returns True on successful save, and False on fail
@celery.task()
def saveToCache(df, sessionID):
	if isinstance(sessionID, basestring) and len(sessionID) == 30:
		try:
			df.to_hdf("flaskApp/cache/" + sessionID + ".h5", "original", mode="w", format="fixed")
			return True
		except Exception as e:
			print("failed to save hdf ", e)
	return False

# POSTs JSON result to Flask app on /celeryTaskCompleted/ endpoint
@celery.task()
def renameColumn(sessionID, requestID, column, newName):
	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID}
	df = loadDataFrameFromCache(sessionID)

	if type(df) is pd.DataFrame and column in df.columns:
		if dcs.load.renameColumn(df, column, newName):
			saveToCache(df, sessionID)
			toReturn['success'] = True

	requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn)

# POSTs JSON result to Flask app on /celeryTaskCompleted/ endpoint
@celery.task()
def changeColumnDataType(sessionID, requestID, column, newDataType):
	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID}
	df = loadDataFrameFromCache(sessionID)

	if type(df) is pd.DataFrame and column in df.columns:
		if dcs.load.changeColumnDataType(df, column, newDataType):
			saveToCache(df, sessionID)
			toReturn['success'] = True

	requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn)

# POSTs JSON result to Flask app on /celeryTaskCompleted/ endpoint
@celery.task()
def deleteRows(sessionID, requestID, rowFrom, rowTo):
	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID}
	df = loadDataFrameFromCache(sessionID)

	if type(df) is pd.DataFrame:
		if dcs.load.removeRows(df, rowFrom, rowTo):
			saveToCache(df, sessionID)
			toReturn['success'] = True

	requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn)

# POSTs JSON result to Flask app on /celeryTaskCompleted/ endpoint
@celery.task()
def fillDown(sessionID, requestID, columnFrom, columnTo, method):
	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID}
	df = loadDataFrameFromCache(sessionID)
	if type(df) is pd.DataFrame:
		if dcs.clean.fillDown(df, columnFrom, columnTo, method):
			saveToCache(df, sessionID)
			toReturn['success'] = True

	requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn)

# POSTs JSON result to Flask app on /celeryTaskCompleted/ endpoint
@celery.task()
def interpolate(sessionID, requestID, columnIndex, method):
	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID}
	df = loadDataFrameFromCache(sessionID)
	if type(df) is pd.DataFrame:
		if dcs.clean.fillByInterpolation(df, columnIndex, method):
			saveToCache(df, sessionID)
			toReturn['success'] = True

	requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn)

# POSTs JSON result to Flask app on /celeryTaskCompleted/ endpoint
@celery.task()
def fillWithCustomValue(sessionID, requestID, columnIndex, newValue):
	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID}
	df = loadDataFrameFromCache(sessionID)
	if type(df) is pd.DataFrame:
		if dcs.clean.fillWithCustomValue(df, columnIndex, newValue):
			saveToCache(df, sessionID)
			toReturn['success'] = True

	requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn)

# POSTs response to flask app on /celeryTaskCompleted/ endpoint
@celery.task()
def fullJSON(sessionID, requestID):
	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID}
	df = loadDataFrameFromCache(sessionID)

	if df is not None:
		toReturn['success'] = True
		toReturn['data'] = dcs.load.dataFrameToJSON(df)
		toReturn['invalidValues'] = dcs.clean.invalidValuesInDataFrame(df)
		# toReturn['missing'] = dcs.clean.missingValuesInDataFrame(df)
		toReturn['dataTypes'] = { str(column): str(df.loc[:, column].dtype) for column in df.columns }

	requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn)