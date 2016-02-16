from flaskApp import celery
from flask import jsonify
import dcs.load
import dcs.view
import dcs.analyze
import dcs.clean
import os
import requests
import pandas as pd
import json
import datetime

# Returns a sessionID (str) on successful conversion, and None on fail
@celery.task()
def userUploadedCSVToDataFrame(uploadID, initialSkip, sampleSize, seed, headerIncluded):
	toReturn = None
	path = 'flaskApp/temp/' + uploadID + '.csv'
	if uploadID and os.path.isfile(path):
		data = dcs.load.CSVtoDataFrame('flaskApp/temp/' + uploadID + '.csv', initialSkip=initialSkip, sampleSize=sampleSize, seed=seed, headerIncluded=headerIncluded)
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
			toReturn['changed'] = True
			toReturn['success'] = True

	requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn)

# POSTs JSON result to Flask app on /celeryTaskCompleted/ endpoint
@celery.task()
def changeColumnDataType(sessionID, requestID, column, newDataType, dateFormat=None):
	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID}
	df = loadDataFrameFromCache(sessionID)

	if type(df) is pd.DataFrame and column in df.columns:
		if dcs.load.changeColumnDataType(df, column, newDataType, dateFormat=dateFormat):
			saveToCache(df, sessionID)
			toReturn['changed'] = True
			toReturn['success'] = True

	requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn)

# POSTs JSON result to Flask app on /celeryTaskCompleted/ endpoint
@celery.task()
def deleteRows(sessionID, requestID, rowIndices):
	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID}
	df = loadDataFrameFromCache(sessionID)

	if type(df) is pd.DataFrame:
		if dcs.load.removeRows(df, rowIndices):
			saveToCache(df, sessionID)
			toReturn['changed'] = True
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
			toReturn['changed'] = list(range(columnFrom, columnTo + 1))
			toReturn['success'] = True

	requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn)

# POSTs JSON result to Flask app on /celeryTaskCompleted/ endpoint
@celery.task()
def interpolate(sessionID, requestID, columnIndex, method, order):
	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID}
	df = loadDataFrameFromCache(sessionID)
	if type(df) is pd.DataFrame:
		if dcs.clean.fillByInterpolation(df, columnIndex, method, order):
			saveToCache(df, sessionID)
			toReturn['changed'] = True
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
			toReturn['changed'] = True
			toReturn['success'] = True

	requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn)

# POSTs JSON result to Flask app on /celeryTaskCompleted/ endpoint
@celery.task()
def fillWithAverage(sessionID, requestID, columnIndex, metric):
	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID}
	df = loadDataFrameFromCache(sessionID)
	if type(df) is pd.DataFrame:
		if dcs.clean.fillWithAverage(df, columnIndex, metric):
			saveToCache(df, sessionID)
			toReturn['changed'] = True
			toReturn['success'] = True

	requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn)

# POSTs JSON result to Flask app on /celeryTaskCompleted/ endpoint
@celery.task()
def normalize(sessionID, requestID, columnIndex, rangeFrom, rangeTo):
	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID}
	df = loadDataFrameFromCache(sessionID)
	if type(df) is pd.DataFrame:
		if dcs.clean.normalize(df, columnIndex, rangeFrom, rangeTo):
			saveToCache(df, sessionID)
			toReturn['changed'] = True
			toReturn['success'] = True

	requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn)

# POSTs JSON result to Flask app on /celeryTaskCompleted/ endpoint
@celery.task()
def standardize(sessionID, requestID, columnIndex):
	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID}
	df = loadDataFrameFromCache(sessionID)
	if type(df) is pd.DataFrame:
		if dcs.clean.standardize(df, columnIndex):
			saveToCache(df, sessionID)
			toReturn['changed'] = True
			toReturn['success'] = True

	requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn)

# POSTs JSON result to Flask app on /celeryTaskCompleted/ endpoint
@celery.task()
def deleteRowsWithNA(sessionID, requestID, columnIndex):
	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID}
	df = loadDataFrameFromCache(sessionID)
	if type(df) is pd.DataFrame:
		if dcs.clean.deleteRowsWithNA(df, columnIndex):
			saveToCache(df, sessionID)
			toReturn['changed'] = True
			toReturn['success'] = True

	requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn)

# POSTs JSON result to Flask app on /celeryTaskCompleted/ endpoint
@celery.task()
def findReplace(sessionID, requestID, columnIndex, toReplace, replaceWith, matchRegex):
	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID}
	df = loadDataFrameFromCache(sessionID)
	
	if type(df) is pd.DataFrame:
		if dcs.clean.findReplace(df, columnIndex, toReplace, replaceWith, matchRegex):
			saveToCache(df, sessionID)
			toReturn['changed'] = True
			toReturn['success'] = True

	requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn)

# POSTs response to flask app on /celeryTaskCompleted/ endpoint
@celery.task()
def metadata(request):
	toReturn = {'success' : False, 'requestID': request["requestID"], 'sessionID': request["sessionID"]}
	# start = datetime.datetime.now()
	df = loadDataFrameFromCache(request["sessionID"])
	# print("Metadata: Loaded HDF from cache in ", str(datetime.datetime.now() - start))

	if df is not None:
		if "invalidColumnIndices" in request and type(request["invalidColumnIndices"]) is list:
			# metadata for invalid rows
			df = dcs.load.rowsWithInvalidValuesInColumns(df, request["invalidColumnIndices"])
		
		toReturn['success'] = True
		toReturn['dataSize'] = { 'rows': df.shape[0], 'columns': df.shape[1] }
		toReturn['columns'] = []
		toReturn['columnInfo'] = {}
		for index, column in enumerate(df.columns):
			if "__original__b0YgCpYKkWwuJKypnOEZeDJM8__original__" not in column:
				toReturn['columns'].append(column)
				information = {}
				information['index'] = index
				information['dataType'] = str(df[column].dtype)
				information['invalidValues'] = df[column].isnull().sum()
				toReturn['columnInfo'][column] = information

	try:
		requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn, timeout=0.001)
	except:
		print("Didn't get a timely POST response")

@celery.task()
def data(request):
	toReturn = {'success' : False, 'requestID': request["requestID"], 'sessionID': request["sessionID"]}
	print(request)
	df = loadDataFrameFromCache(request["sessionID"])
	if df is not None:
		try:
			if "rowIndexFrom" in request and "rowIndexTo" in request and "columnIndexFrom" in request and "columnIndexTo" in request:
				# getting data (normally)
				if "invalidColumnIndices" in request:
					# data for invalid rows
					df = dcs.load.rowsWithInvalidValuesInColumns(df, request["invalidColumnIndices"])

				data = dcs.load.dataFrameToJSON(df, request["rowIndexFrom"], request["rowIndexTo"], request["columnIndexFrom"], request["columnIndexTo"])

				if data is not None:
					toReturn['success'] = True
					toReturn['data'] = data
			elif "sortedSample" in request and "sampleColumn" in request and "dataColumns" in request:
				# getting sorted sampled data (for visualization)
				df = dcs.view.sortedSample(df, request["sortedSample"], request["sampleColumn"], request["dataColumns"])
				data = dcs.load.dataFrameToJSON(df)
				print(df.shape)
				print(data)
				if data is not None:
					toReturn['success'] = True
					toReturn['data'] = data
		except:
			pass
	try:
		requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn, timeout=0.001)
	except:
		print("Didn't get a timely POST response")

# POSTs response to flask app on /celeryTaskCompleted/ endpoint
@celery.task()
def analyze(sessionID, requestID, column):
	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID}
	df = loadDataFrameFromCache(sessionID)

	if df is not None:
		analysis = dcs.analyze.analysisForColumn(df, column)
		if analysis:
			toReturn['success'] = True
			toReturn['data'] = analysis

	requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn)
