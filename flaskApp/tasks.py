# -*- coding: utf-8 -*- 

from flaskApp import celery
from flask import jsonify
import dcs.load
import dcs.view
import dcs.analyze
import dcs.clean
import os
import requests
import pandas as pd
import numpy as np
import json
import datetime
import traceback

@celery.task()
def userUploadedCSVToDataFrame(uploadID, initialSkip, sampleSize, seed, headerIncluded):
	"""Task invoked synchronously by :ref:`POST /upload <flask-upload>` request in Flask application

	Calls :func:`dcs.load.CSVtoDataFrame` and :func:`flaskApp.tasks.saveToCache`

	Returns:
		str: new Willow sessionID
	"""

	toReturn = None
	path = 'flaskApp/temp/' + uploadID + '.csv'
	if uploadID and os.path.isfile(path):
		data = dcs.load.CSVtoDataFrame('flaskApp/temp/' + uploadID + '.csv', initialSkip=initialSkip, sampleSize=sampleSize, seed=seed, headerIncluded=headerIncluded)
		os.remove(path)
		if data is not None and saveToCache(data, uploadID):
			toReturn = uploadID
	return toReturn

@celery.task()
def userUploadedJSONToDataFrame(uploadID, initialSkip, sampleSize, seed):
	"""Task invoked synchronously by :ref:`POST /upload <flask-upload>` request in Flask application

	Calls :func:`dcs.load.JSONtoDataFrame` and :func:`flaskApp.tasks.saveToCache`

	Returns:
		str: new Willow sessionID
	"""

	toReturn = None
	path = 'flaskApp/temp/' + uploadID + '.json'
	if uploadID and os.path.isfile(path):
		data = dcs.load.JSONtoDataFrame('flaskApp/temp/' + uploadID + '.json', sampleSize=sampleSize, seed=seed)
		os.remove(path)
		if data is not None and saveToCache(data, uploadID):
			toReturn = uploadID
	return toReturn

@celery.task()
def userUploadedXLSXToDataFrame(uploadID, initialSkip, sampleSize, seed, headerIncluded):
	"""Task invoked synchronously by :ref:`POST /upload <flask-upload>` request in Flask application

	Calls :func:`dcs.load.XLSXtoDataFrame` and :func:`flaskApp.tasks.saveToCache`

	Returns:
		str: new Willow sessionID
	"""

	toReturn = None
	path = 'flaskApp/temp/' + uploadID + '.xlsx'
	if uploadID and os.path.isfile(path):
		data = dcs.load.XLSXtoDataFrame('flaskApp/temp/' + uploadID + '.xlsx', initialSkip=initialSkip, sampleSize=sampleSize, seed=seed, headerIncluded=headerIncluded)
		os.remove(path)
		if data is not None and saveToCache(data, uploadID):
			toReturn = uploadID
	return toReturn

@celery.task()
def userUploadedXLSToDataFrame(uploadID, initialSkip, sampleSize, seed, headerIncluded):
	"""Task invoked synchronously by :ref:`POST /upload <flask-upload>` request in Flask application

	Calls :func:`dcs.load.XLSXtoDataFrame` and :func:`flaskApp.tasks.saveToCache`

	Returns:
		str: new Willow sessionID
	"""

	toReturn = None
	path = 'flaskApp/temp/' + uploadID + '.xls'
	if uploadID and os.path.isfile(path):
		data = dcs.load.XLSXtoDataFrame('flaskApp/temp/' + uploadID + '.xls', initialSkip=initialSkip, sampleSize=sampleSize, seed=seed, headerIncluded=headerIncluded)
		os.remove(path)
		if data is not None and saveToCache(data, uploadID):
			toReturn = uploadID
	return toReturn

def undoAvailable(sessionID):
	"""Supporting function that detects whether an undo operation is available. 

	The HDF file format supports storing multiple datasets with different labels in the same file. 
	Undo operations revert to a dataset to what is stored under the 'undo' label in the
	same HDF file. 

	This function checks if the 'undo' label is present for the HDF file for the
	specified sessionID.  

	Args:
		sessionID (str): Willow sessionID

	Returns:
		bool
	"""

	return type(loadDataFrameFromCache(sessionID, "undo")) is pd.DataFrame

@celery.task()
def loadDataFrameFromCache(sessionID, key="original"):
	"""Supporting function that loads a dataset from the HDF file store. 

	The HDF file format supports storing multiple datasets with different labels in the same file. 
	The HDF file associated with a Willow sessionID *always* stores the current version of the dataset,
	under the 'original' label. 

	Uses :func:`pandas.read_hdf`. 

	Args:
		sessionID (str): Willow sessionID
		key (str, optional): retrieve a dataset under a different label in the HDF file

	Returns:
		pandas.dataFrame: pandas.dataFrame on success, ``None`` on failure"""

	if isinstance(sessionID, basestring) and len(sessionID) == 30:
		try:
			data = pd.read_hdf("flaskApp/cache/" + sessionID + ".h5", key)
			if type(data) is pd.DataFrame:
				return data
		except:
			pass
	return None

@celery.task()
def DataFrameToCSV(sessionID):
	"""Task invoked synchronously by :ref:`GET /downloadCSV <flask-download-CSV>` request in Flask application

	Uses :meth:`pandas.DataFrame.to_csv`.

	Returns:
		str: CSV text"""

	df = loadDataFrameFromCache(sessionID)
	if type(df) is pd.DataFrame:
		return df.to_csv(None, index=False, force_ascii=False)
	else:
		return None

@celery.task()
def DFtoJSON(sessionID):
	"""Task invoked synchronously by :ref:`GET /downloadJSON <flask-download-JSON>` request in Flask application

	Uses :meth:`pandas.DataFrame.to_json`.

	Returns:
		str: CSV text"""

	df = loadDataFrameFromCache(sessionID)
	if type(df) is pd.DataFrame:
		return df.to_json(orient="records", date_format="iso", force_ascii=True)
	else:
		return None

def uniquefyDataFrameColumnNames(df):
	"""Supporting function that ensures that all column names in a :class:`pandas.DataFrame` object are unique. 

	The HDF fixed file format used by Willow does not support duplicate column names, so this function
	checks if every column name is unique. If a duplicate column name is found, the column name is
	renamed with a unique integer appended to the column name

	e.g. (..., Date, Date, ...) becomes (..., Date_1, Date, ...)"""

	frequencies = {}
	newNames = []
	for index, name in enumerate(reversed(df.columns)):
		if frequencies.get(name, 0) > 0:
			newName = "%s.%d" % (name, frequencies[name])
			incrementer = 0
			while newName in df.columns:
				incrementer += 1
				newName = "%s.%d" % (name, frequencies[name] + incrementer)
			newNames.append(newName)
		else:
			newNames.append(name)

		frequencies[name] = frequencies.get(name, 0) + 1

	df.columns = reversed(newNames)

@celery.task()
def saveToCache(df, sessionID):
	"""Supporting function that saves a :class:`pandas.DataFrame` object to the HDF file store. 

	This function must be called after every Celery operation that modifies the dataset, as the
	Willow backend depends on the invariant that the HDF file corresponding to a Willow sessionID
	always holds the latest version of the dataset. 

	Uses :meth:`pandas.DataFrame.to_hdf`. 

	Returns:
		bool: ``True`` on success, ``False`` on failure"""

	if isinstance(sessionID, basestring) and len(sessionID) == 30:
		try:
			uniquefyDataFrameColumnNames(df) # hdf fixed format does not support duplicate column names

			path = "flaskApp/cache/" + sessionID + ".h5"
			oldDF = loadDataFrameFromCache(sessionID)
			if type(oldDF) is pd.DataFrame:
				# save one undo
				oldDF.to_hdf(path, "undo", mode="w", format="fixed")

			df.to_hdf(path, "original", mode="a", format="fixed")
			return True
		except Exception as e:
			print("failed to save hdf ", e)
	return False

@celery.task()
def undo(sessionID, requestID):
	"""Task invoked asynchronously by :ref:`'undo' WebSocket request <socket-undo>` in Flask application

	Uses :func:`loadDataFrameFromCache`.

	POSTs result dictionary in JSON format to :ref:`/celeryTaskCompleted <flask-celery-task-completed>`
	endpoint in Flask application. """

	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID, 'operation': "undo"}
	backup = loadDataFrameFromCache(sessionID, "undo")

	if type(backup) is pd.DataFrame:
		saveToCache(backup, sessionID)
		toReturn['changed'] = True
		toReturn['success'] = True
	else:
		toReturn['error'] = "IllegalOperation"
		toReturn['errorDescription'] = "The undo operation is currently not available on this dataframe. "

	try:
		requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn, timeout=0.001)
	except:
		pass

@celery.task()
def renameColumn(sessionID, requestID, column, newName):
	"""Task invoked asynchronously by :ref:`'renameColumn' WebSocket request <socket-rename-column>` in Flask application

	Uses :func:`dcs.load.renameColumn`. 

	POSTs result dictionary in JSON format to :ref:`/celeryTaskCompleted <flask-celery-task-completed>`
	endpoint in Flask application. """

	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID, 'operation': "renameColumn"}
	df = loadDataFrameFromCache(sessionID)

	try:
		dcs.load.renameColumn(df, column, newName)
		saveToCache(df, sessionID)
		toReturn['changed'] = True
		toReturn['success'] = True
	except Exception as e:
		toReturn['error'] = str(e)
		toReturn['errorDescription'] = traceback.format_exc()

	try:
		requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn, timeout=0.001)
	except:
		pass

@celery.task()
def newCellValue(sessionID, requestID, columnIndex, rowIndex, newValue):
	"""Task invoked asynchronously by :ref:`'newCellValue' WebSocket request <socket-rename-column>` in Flask application

	Uses :func:`dcs.load.newCellValue`. 

	POSTs result dictionary in JSON format to :ref:`/celeryTaskCompleted <flask-celery-task-completed>`
	endpoint in Flask application. """

	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID, 'operation': "newCellValue"}
	df = loadDataFrameFromCache(sessionID)

	try:
		dcs.load.newCellValue(df, columnIndex, rowIndex, newValue)
		saveToCache(df, sessionID)
		toReturn['changed'] = True
		toReturn['success'] = True
	except Exception as e:
		toReturn['error'] = str(e)
		toReturn['errorDescription'] = traceback.format_exc()

	try:
		requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn, timeout=0.001)
	except:
		pass

@celery.task()
def changeColumnDataType(sessionID, requestID, column, newDataType, dateFormat=None):
	"""Task invoked asynchronously by :ref:`'changeColumnDataType' WebSocket request <socket-change-column-data-type>` in Flask application

	Uses :func:`dcs.load.changeColumnDataType`. 

	POSTs result dictionary in JSON format to :ref:`/celeryTaskCompleted <flask-celery-task-completed>`
	endpoint in Flask application. """

	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID, 'operation': "changeColumnDataType"}
	df = loadDataFrameFromCache(sessionID)

	try:
		dcs.load.changeColumnDataType(df, column, newDataType, dateFormat=dateFormat)
		saveToCache(df, sessionID)
		toReturn['changed'] = True
		toReturn['success'] = True
	except Exception as e:
		toReturn['error'] = str(e)
		toReturn['errorDescription'] = traceback.format_exc()

	try:
		requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn, timeout=0.001)
	except:
		pass

@celery.task()
def deleteRows(sessionID, requestID, rowIndices):
	"""Task invoked asynchronously by :ref:`'deleteRows' WebSocket request <socket-delete-rows>` in Flask application

	Uses :func:`dcs.load.removeRows`. 

	POSTs result dictionary in JSON format to :ref:`/celeryTaskCompleted <flask-celery-task-completed>`
	endpoint in Flask application. """

	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID, 'operation': "deleteRows"}
	df = loadDataFrameFromCache(sessionID)

	try:
		dcs.load.removeRows(df, rowIndices)
		saveToCache(df, sessionID)
		toReturn['changed'] = True
		toReturn['success'] = True
	except Exception as e:
		toReturn['error'] = str(e)
		toReturn['errorDescription'] = traceback.format_exc()

	try:
		requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn, timeout=0.001)
	except:
		pass

@celery.task()
def deleteColumns(sessionID, requestID, columnIndices):
	"""Task invoked asynchronously by :ref:`'deleteColumns' WebSocket request <socket-delete-columns>` in Flask application

	Uses :func:`dcs.load.removeColumns`. 

	POSTs result dictionary in JSON format to :ref:`/celeryTaskCompleted <flask-celery-task-completed>`
	endpoint in Flask application. """

	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID, 'operation': "deleteColumns"}
	df = loadDataFrameFromCache(sessionID)

	try:
		dcs.load.removeColumns(df, columnIndices)
		saveToCache(df, sessionID)
		toReturn['changed'] = True
		toReturn['success'] = True
	except Exception as e:
		toReturn['error'] = str(e)
		toReturn['errorDescription'] = traceback.format_exc()

	try:
		requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn, timeout=0.001)
	except:
		pass

@celery.task()
def emptyStringToNan(sessionID, requestID, columnIndex):
	"""Task invoked asynchronously by :ref:`'emptyStringToNan' WebSocket request <socket-empty-string-to-nan>` in Flask application

	Uses :func:`dcs.load.emptyStringToNan`. 

	POSTs result dictionary in JSON format to :ref:`/celeryTaskCompleted <flask-celery-task-completed>`
	endpoint in Flask application. """

	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID, 'operation': "emptyStringToNan"}
	df = loadDataFrameFromCache(sessionID)

	try:
		dcs.load.emptyStringToNan(df, columnIndex)
		saveToCache(df, sessionID)
		toReturn['changed'] = True
		toReturn['success'] = True
	except Exception as e:
		toReturn['error'] = str(e)
		toReturn['errorDescription'] = traceback.format_exc()

	try:
		requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn, timeout=0.001)
	except:
		pass

@celery.task()
def fillDown(sessionID, requestID, columnFrom, columnTo, method):
	"""Task invoked asynchronously by :ref:`'fillDown' WebSocket request <socket-fill-down>` in Flask application

	Uses :func:`dcs.clean.fillDown`. 

	POSTs result dictionary in JSON format to :ref:`/celeryTaskCompleted <flask-celery-task-completed>`
	endpoint in Flask application. """

	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID, 'operation': "fillDown"}
	df = loadDataFrameFromCache(sessionID)
	
	try:
		dcs.clean.fillDown(df, columnFrom, columnTo, method)
		saveToCache(df, sessionID)
		toReturn['changed'] = list(range(columnFrom, columnTo + 1))
		toReturn['success'] = True
	except Exception as e:
		toReturn['error'] = str(e)
		toReturn['errorDescription'] = traceback.format_exc()

	try:
		requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn, timeout=0.001)
	except:
		pass

@celery.task()
def interpolate(sessionID, requestID, columnIndex, method, order):
	"""Task invoked asynchronously by :ref:`'interpolate' WebSocket request <socket-interpolate>` in Flask application

	Uses :func:`dcs.clean.fillByInterpolation`. 

	POSTs result dictionary in JSON format to :ref:`/celeryTaskCompleted <flask-celery-task-completed>`
	endpoint in Flask application. """

	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID, 'operation': "interpolate"}
	df = loadDataFrameFromCache(sessionID)
	
	try:
		dcs.clean.fillByInterpolation(df, columnIndex, method, order)
		saveToCache(df, sessionID)
		toReturn['changed'] = True
		toReturn['success'] = True
	except MemoryError as e:
		toReturn['error'] = "Memory Error"
		toReturn['errorDescription'] = traceback.format_exc()
	except Exception as e:
		toReturn['error'] = str(e)
		toReturn['errorDescription'] = traceback.format_exc()

	try:
		requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn, timeout=0.001)
	except:
		pass

@celery.task()
def fillWithCustomValue(sessionID, requestID, columnIndex, newValue):
	"""Task invoked asynchronously by :ref:`'fillWithCustomValue' WebSocket request <socket-fill-with-custom-value>` in Flask application

	Uses :func:`dcs.clean.fillWithCustomValue`. 

	POSTs result dictionary in JSON format to :ref:`/celeryTaskCompleted <flask-celery-task-completed>`
	endpoint in Flask application. """

	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID, 'operation': "fillWithCustomValue"}
	df = loadDataFrameFromCache(sessionID)
	
	try:
		dcs.clean.fillWithCustomValue(df, columnIndex, newValue)
		saveToCache(df, sessionID)
		toReturn['changed'] = True
		toReturn['success'] = True
	except Exception as e:
		toReturn['error'] = str(e)
		toReturn['errorDescription'] = traceback.format_exc()

	try:
		requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn, timeout=0.001)
	except:
		pass

@celery.task()
def fillWithAverage(sessionID, requestID, columnIndex, metric):
	"""Task invoked asynchronously by :ref:`'fillWithAverage' WebSocket request <socket-fill-with-average>` in Flask application

	Uses :func:`dcs.clean.fillWithAverage`. 

	POSTs result dictionary in JSON format to :ref:`/celeryTaskCompleted <flask-celery-task-completed>`
	endpoint in Flask application. """

	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID, 'operation': "fillWithAverage"}
	df = loadDataFrameFromCache(sessionID)
	
	try:
		dcs.clean.fillWithAverage(df, columnIndex, metric)
		saveToCache(df, sessionID)
		toReturn['changed'] = True
		toReturn['success'] = True
	except Exception as e:
		toReturn['error'] = str(e)
		toReturn['errorDescription'] = traceback.format_exc()

	try:
		requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn, timeout=0.001)
	except:
		pass

@celery.task()
def normalize(sessionID, requestID, columnIndex, rangeFrom, rangeTo):
	"""Task invoked asynchronously by :ref:`'normalize' WebSocket request <socket-normalize>` in Flask application

	Uses :func:`dcs.clean.normalize`. 

	POSTs result dictionary in JSON format to :ref:`/celeryTaskCompleted <flask-celery-task-completed>`
	endpoint in Flask application. """

	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID, 'operation': "normalize"}
	df = loadDataFrameFromCache(sessionID)
	
	try:
		dcs.clean.normalize(df, columnIndex, rangeFrom, rangeTo)
		saveToCache(df, sessionID)
		toReturn['changed'] = True
		toReturn['success'] = True
	except Exception as e:
		toReturn['error'] = str(e)
		toReturn['errorDescription'] = traceback.format_exc()

	try:
		requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn, timeout=0.001)
	except:
		pass

@celery.task()
def standardize(sessionID, requestID, columnIndex):
	"""Task invoked asynchronously by :ref:`'standardize' WebSocket request <socket-standardize>` in Flask application

	Uses :func:`dcs.clean.standardize`. 

	POSTs result dictionary in JSON format to :ref:`/celeryTaskCompleted <flask-celery-task-completed>`
	endpoint in Flask application. """

	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID, 'operation': "standardize"}
	df = loadDataFrameFromCache(sessionID)
	
	try:
		dcs.clean.standardize(df, columnIndex)
		saveToCache(df, sessionID)
		toReturn['changed'] = True
		toReturn['success'] = True
	except Exception as e:
		toReturn['error'] = str(e)
		toReturn['errorDescription'] = traceback.format_exc()

	try:
		requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn, timeout=0.001)
		print("standardize done")
	except:
		pass

@celery.task()
def deleteRowsWithNA(sessionID, requestID, columnIndex):
	"""Task invoked asynchronously by :ref:`'deleteRowsWithNA' WebSocket request <socket-delete-rows-with-na>` in Flask application

	Uses :func:`dcs.clean.deleteRowsWithNA`. 

	POSTs result dictionary in JSON format to :ref:`/celeryTaskCompleted <flask-celery-task-completed>`
	endpoint in Flask application. """

	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID, 'operation': "deleteRowsWithNA"}
	df = loadDataFrameFromCache(sessionID)

	try:
		dcs.clean.deleteRowsWithNA(df, columnIndex)
		saveToCache(df, sessionID)
		toReturn['changed'] = True
		toReturn['success'] = True
	except Exception as e:
		toReturn['error'] = str(e)
		toReturn['errorDescription'] = traceback.format_exc()

	try:
		requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn, timeout=0.001)
	except:
		pass

@celery.task()
def findReplace(sessionID, requestID, columnIndex, toReplace, replaceWith, matchRegex):
	"""Task invoked asynchronously by :ref:`'findReplace' WebSocket request <socket-find-replace>` in Flask application

	Uses :func:`dcs.clean.findReplace`. 

	POSTs result dictionary in JSON format to :ref:`/celeryTaskCompleted <flask-celery-task-completed>`
	endpoint in Flask application. """

	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID, 'operation': "findReplace"}
	df = loadDataFrameFromCache(sessionID)
	
	try:
		dcs.clean.findReplace(df, columnIndex, toReplace, replaceWith, matchRegex)
		saveToCache(df, sessionID)
		toReturn['changed'] = True
		toReturn['success'] = True
	except Exception as e:
		toReturn['error'] = str(e)
		toReturn['errorDescription'] = traceback.format_exc()

	try:
		requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn, timeout=0.001)
	except:
		pass

@celery.task()
def generateDummies(sessionID, requestID, columnIndex, inplace):
	"""Task invoked asynchronously by :ref:`'generateDummies' WebSocket request <socket-generate-dummies>` in Flask application

	Uses :func:`dcs.clean.generateDummies`. 

	POSTs result dictionary in JSON format to :ref:`/celeryTaskCompleted <flask-celery-task-completed>`
	endpoint in Flask application. """

	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID, 'operation': "generateDummies"}
	df = loadDataFrameFromCache(sessionID)
	
	try:
		dcs.clean.generateDummies(df, columnIndex, inplace)
		saveToCache(df, sessionID)
		toReturn['changed'] = True
		toReturn['success'] = True
	except Exception as e:
		toReturn['error'] = str(e)
		toReturn['errorDescription'] = traceback.format_exc()

	try:
		requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn, timeout=0.001)
	except:
		pass

@celery.task()
def insertDuplicateColumn(sessionID, requestID, columnIndex):
	"""Task invoked asynchronously by :ref:`'insertDuplicateColumn' WebSocket request <socket-insert-duplicate-column>` in Flask application

	Uses :func:`dcs.clean.insertDuplicateColumn`. 

	POSTs result dictionary in JSON format to :ref:`/celeryTaskCompleted <flask-celery-task-completed>`
	endpoint in Flask application. """

	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID, 'operation': "insertDuplicateColumn"}
	df = loadDataFrameFromCache(sessionID)
	
	try:
		dcs.clean.insertDuplicateColumn(df, columnIndex)
		saveToCache(df, sessionID)
		toReturn['changed'] = True
		toReturn['success'] = True
	except Exception as e:
		toReturn['error'] = str(e)
		toReturn['errorDescription'] = traceback.format_exc()

	try:
		requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn, timeout=0.001)
	except:
		pass

@celery.task()
def splitColumn(sessionID, requestID, columnIndex, delimiter, regex):
	"""Task invoked asynchronously by :ref:`'splitColumn' WebSocket request <socket-split-column>` in Flask application

	Uses :func:`dcs.clean.splitColumn`. 

	POSTs result dictionary in JSON format to :ref:`/celeryTaskCompleted <flask-celery-task-completed>`
	endpoint in Flask application. """

	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID, 'operation': "splitColumn"}
	df = loadDataFrameFromCache(sessionID)
	
	try:
		dcs.clean.splitColumn(df, columnIndex, delimiter, regex)
		saveToCache(df, sessionID)
		toReturn['changed'] = True
		toReturn['success'] = True
	except Exception as e:
		toReturn['error'] = str(e)
		toReturn['errorDescription'] = traceback.format_exc()		

	try:
		requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn, timeout=0.001)
	except:
		pass

@celery.task()
def combineColumns(sessionID, requestID, columnsToCombine, seperator, newName, insertIndex):
	"""Task invoked asynchronously by :ref:`'combineColumns' WebSocket request <socket-combine-columns>` in Flask application

	Uses :func:`dcs.clean.combineColumns`. 

	POSTs result dictionary in JSON format to :ref:`/celeryTaskCompleted <flask-celery-task-completed>`
	endpoint in Flask application. """

	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID, 'operation': "combineColumns"}
	df = loadDataFrameFromCache(sessionID)
	
	try:
		dcs.clean.combineColumns(df, columnsToCombine, seperator, newName, insertIndex)
		saveToCache(df, sessionID)
		toReturn['changed'] = True
		toReturn['success'] = True
	except Exception as e:
		toReturn['error'] = str(e)
		toReturn['errorDescription'] = traceback.format_exc()			

	try:
		requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn, timeout=0.001)
	except:
		pass

@celery.task()
def discretize(sessionID, requestID, columnIndex, cutMode, numberOfBins):
	"""Task invoked asynchronously by :ref:`'discretize' WebSocket request <socket-discretize>` in Flask application

	Uses :func:`dcs.clean.discretize`. 

	POSTs result dictionary in JSON format to :ref:`/celeryTaskCompleted <flask-celery-task-completed>`
	endpoint in Flask application. """

	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID, 'operation': "discretize"}
	df = loadDataFrameFromCache(sessionID)
	
	try:
		dcs.clean.discretize(df, columnIndex, cutMode, numberOfBins)
		saveToCache(df, sessionID)
		toReturn['changed'] = True
		toReturn['success'] = True
	except Exception as e:
		toReturn['error'] = str(e)
		toReturn['errorDescription'] = traceback.format_exc()	

	try:
		requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn, timeout=0.001)
	except:
		pass

@celery.task()
def executeCommand(sessionID, requestID, command):
	"""Task invoked asynchronously by :ref:`'executeCommand' WebSocket request <socket-execute-command>` in Flask application

	Uses :func:`dcs.clean.executeCommand`. 

	.. danger::
		
		Using this function carries direct risk, as any arbitrary command can be executed

	POSTs result dictionary in JSON format to :ref:`/celeryTaskCompleted <flask-celery-task-completed>`
	endpoint in Flask application. """

	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID, 'operation': "executeCommand"}
	df = loadDataFrameFromCache(sessionID)
	
	try:
		dcs.clean.executeCommand(df, command)
		saveToCache(df, sessionID)
		toReturn['changed'] = True
		toReturn['success'] = True
	except Exception as e:
		toReturn['error'] = str(e)
		toReturn['errorDescription'] = traceback.format_exc()	

	try:
		requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn, timeout=0.001)
	except:
		pass

@celery.task()
def metadata(request):
	"""Task invoked asynchronously by :ref:`'metadata' WebSocket request <socket-metadata>` in Flask application

	Uses :func:`dcs.load.dataFrameToJSON`, :func:`dcs.load.rowsWithInvalidValuesInColumns`,
	:func`dcs.load.outliersTrimmedMeanSd`, :func:`dcs.load.duplicateRowsInColumns` and
	:func:`dcs.view.filterWithSearchQuery`.

	POSTs result dictionary in JSON format to :ref:`/celeryTaskCompleted <flask-celery-task-completed>`
	endpoint in Flask application. """

	toReturn = {'success' : False, 'requestID': request["requestID"], 'sessionID': request["sessionID"], 'operation': "metadata"}
	# start = datetime.datetime.now()
	df = loadDataFrameFromCache(request["sessionID"])
	# print("Metadata: Loaded HDF from cache in ", str(datetime.datetime.now() - start))

	if df is not None:
		if "filterColumnIndices" in request and type(request["filterColumnIndices"]) is list and "filterType" in request:
			# filtered metadata
			if request["filterType"] == "invalid":
				df = dcs.load.rowsWithInvalidValuesInColumns(df, request["filterColumnIndices"])
			elif request["filterType"] == "outliers":
				df = dcs.load.outliersTrimmedMeanSd(df, request["filterColumnIndices"], request.get("outliersStdDev", 2), request.get("outliersTrimPortion", 0))
			elif request["filterType"] == "duplicates":
				df = dcs.load.duplicateRowsInColumns(df, request["filterColumnIndices"])

		if "searchColumnIndices" in request and type(request["searchColumnIndices"]) is list and "searchQuery" in request:
			df = dcs.view.filterWithSearchQuery(df, request["searchColumnIndices"], request["searchQuery"], request["searchIsRegex"] if "searchIsRegex" in request else False)
		
		toReturn['success'] = True
		toReturn['undoAvailable'] = undoAvailable(request["sessionID"])
		toReturn['dataSize'] = { 'rows': df.shape[0], 'columns': df.shape[1] }
		toReturn['columns'] = []
		toReturn['columnInfo'] = {}
		for index, column in enumerate(df.columns):
			toReturn['columns'].append(column)
			information = {}
			information['index'] = index
			if np.issubdtype(df[column].dtype, np.integer):
				information['dataType'] = 'int'
			elif np.issubdtype(df[column].dtype, np.float):
				information['dataType'] = 'float'
			elif np.issubdtype(df[column].dtype, np.datetime64):
				information['dataType'] = 'datetime'
			elif df[column].dtype == np.object:
				information['dataType'] = 'string'
			else:
				information['dataType'] = str(df[column].dtype)
			information['invalidValues'] = df[column].isnull().sum()
			toReturn['columnInfo'][column] = information

	try:
		requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn, timeout=0.001)
	except:
		pass

@celery.task()
def data(request):
	"""Task invoked asynchronously by :ref:`'data' WebSocket request <socket-data>` in Flask application

	Uses :func:`dcs.load.dataFrameToJSON`, :func:`dcs.load.rowsWithInvalidValuesInColumns`,
	:func`dcs.load.outliersTrimmedMeanSd`, :func:`dcs.load.duplicateRowsInColumns` and
	:func:`dcs.view.filterWithSearchQuery`.

	POSTs result dictionary in JSON format to :ref:`/celeryTaskCompleted <flask-celery-task-completed>`
	endpoint in Flask application. """

	toReturn = {'success' : False, 'requestID': request["requestID"], 'sessionID': request["sessionID"], 'operation': "data"}
	df = loadDataFrameFromCache(request["sessionID"])
	if df is not None:
		try:
			if "rowIndexFrom" in request and "rowIndexTo" in request and "columnIndexFrom" in request and "columnIndexTo" in request:
				if "filterColumnIndices" in request and type(request["filterColumnIndices"]) is list:
					if request["filterType"] == "invalid":
						df = dcs.load.rowsWithInvalidValuesInColumns(df, request["filterColumnIndices"])
					elif request["filterType"] == "outliers":
						df = dcs.load.outliersTrimmedMeanSd(df, request["filterColumnIndices"], request.get("outliersStdDev", 2), request.get("outliersTrimPortion", 0))
					elif request["filterType"] == "duplicates":
						df = dcs.load.duplicateRowsInColumns(df, request["filterColumnIndices"])

				if "searchColumnIndices" in request and type(request["searchColumnIndices"]) is list and "searchQuery" in request:
					df = dcs.view.filterWithSearchQuery(df, request["searchColumnIndices"], request["searchQuery"], request.get("searchIsRegex", False))
		
				if "sortColumnIndex" in request and type(request["sortColumnIndex"]) is int and request["sortColumnIndex"] >= 0 and request["sortColumnIndex"] < len(df.columns):
					df.sort_values(df.columns[request["sortColumnIndex"]], ascending=request.get("sortAscending", True), inplace=True)

				data = dcs.load.dataFrameToJSON(df, request["rowIndexFrom"], request["rowIndexTo"], request["columnIndexFrom"], request["columnIndexTo"])

				if data is not None:
					toReturn['success'] = True
					toReturn['data'] = data
		except:
			pass
	try:
		requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn, timeout=0.001)
	except:
		pass

@celery.task()
def analyze(sessionID, requestID, column):
	"""Task invoked asynchronously by :ref:`'analyze' WebSocket request <socket-analyze>` in Flask application

	Uses :func:`dcs.analyze.analysisForColumn`. 

	POSTs result dictionary in JSON format to :ref:`/celeryTaskCompleted <flask-celery-task-completed>`
	endpoint in Flask application. """

	toReturn = {'success' : False, 'requestID': requestID, 'sessionID': sessionID, 'operation': "analyze"}
	df = loadDataFrameFromCache(sessionID)
	print('requesting analysis for %s' % column)

	try:
		toReturn['data'] = dcs.analyze.analysisForColumn(df, column)
		print('got analysis for %s' % column)
		toReturn['success'] = True
	except Exception as e:
		toReturn['error'] = str(e)
		toReturn['errorDescription'] = traceback.format_exc()	
		print(str(e))
		print(traceback.format_exc())

	try:
		requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn, timeout=0.001)
	except:
		pass

@celery.task()
def visualize(request):
	"""Task invoked asynchronously by :ref:`'visualize' WebSocket request <socket-visualize>` in Flask application

	Uses :func:`dcs.view.histogram`, :func:`dcs.view.scatter`, :func:`dcs.view.line`,
	:func:`dcs.view.date` and :func:`dcs.view.frequency`. 

	POSTs result dictionary in JSON format to :ref:`/celeryTaskCompleted <flask-celery-task-completed>`
	endpoint in Flask application. """

	toReturn = {'success' : False, 'requestID': request["requestID"], 'sessionID': request["sessionID"], 'operation': "visualize"}
	df = loadDataFrameFromCache(request["sessionID"])

	try:
		if request["type"] == "histogram" and "columnIndices" in request:
			toReturn.update(dcs.view.histogram(df, request["columnIndices"], request))
			toReturn['success'] = True
		elif request["type"] == "scatter" and "xColumnIndex" in request and "yColumnIndices" in request:
			toReturn.update(dcs.view.scatter(df, request["xColumnIndex"], request["yColumnIndices"], request))
			toReturn['success'] = True
		elif request["type"] == "line" and "xColumnIndex" in request and "yColumnIndices" in request:
			toReturn.update(dcs.view.line(df, request["xColumnIndex"], request["yColumnIndices"], request))
			toReturn['success'] = True
		elif request["type"] == "date" and "xColumnIndex" in request and "yColumnIndices" in request:
			toReturn.update(dcs.view.date(df, request["xColumnIndex"], request["yColumnIndices"], request))
			toReturn['success'] = True
		elif request["type"] == "frequency" and "columnIndex" in request:
			toReturn.update(dcs.view.frequency(df, request["columnIndex"], request))
			toReturn['success'] = True
	except Exception as e:
		toReturn['error'] = str(e)
		toReturn['errorDescription'] = traceback.format_exc()	

	try:
		requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn, timeout=0.001)
	except:
		pass