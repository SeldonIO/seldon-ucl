from flaskApp import celery
from flask import jsonify
import dcs.load
import os.path

@celery.task()
def loadUserUploadedCSV(uploadID):
	if uploadID and os.path.isfile('flaskApp/temp/' + uploadID + '.csv'):
		data = dcs.load.CSVtoDataFrame('flaskApp/temp/' + uploadID + '.csv')
		if data is not None:
			if saveToCache(data, uploadID):
				return {'success':True, 'sessionID':uploadID}
	return {'success':False, 'sessionID':uploadID}

@celery.task()
def loadDataFrameFromCache(sessionID):
	if isinstance(sessionID, str) and len(sessionID) == 30:
		try:
			data = pd.read_hdf("flaskApp/cache/" + sessionID + ".h5", "original")
			return data
		except:
			pass
		return None
	return None

@celery.task()
def saveToCache(df, sessionID):
	try:
		df.to_hdf("flaskApp/cache/" + sessionID + ".h5", "original", mode="w", format="table")
		return True
	except:
		return False