from flaskApp import celery
from dcs import load

@celery.task()
def loadUserUploadedCSV(filestream, uploadID):
	if filestream:
		data = load.CSVtoDataFrame(file.stream)
	if data is not None:
		if saveToCache(data, uploadID):
			return jsonify(success=True, sessionID=sessionID)
	return jsonify(success=False, sessionID=sessionID)

@celery.task()
def loadDataFrameFromCache(sessionID):
	data = None
	if isinstance(sessionID, str) and len(sessionID) == 30:
		try:
			data = pd.read_hdf("cache/" + sessionID + ".h5", "original")
		except:
			pass
	return data if type(data) is pd.DataFrame else None

@celery.task()
def saveToCache(df, sessionID):
	try:
		df.to_hdf("cache/" + sessionID + ".h5", "original", mode="w", format="table")
		return True
	except:
		return False