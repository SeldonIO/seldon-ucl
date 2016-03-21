from datetime import datetime, timedelta
import pandas as pd
from flaskApp import tasks

requestCacheMemoryLimit = 128 * 1000 * 1000 # 128 MB

class RequestManager:
	def __init__(self):
		self.cache = {}

	def processRequest(self, request):
		if type(request) is dict and "requestID" in request and "sessionID" in request and "operation" in request:
			if request["operation"] == "metadata":
				

class SessionServer:
	def __init__(self, sessionID, event, queue):
		self.sessionID = sessionID
		self.requestManager = RequestManager()
		self.event = event
		self.queue = queue

	@property
	def dataframe(self):
	    if type(self._dataframe) is not pd.DataFrame:
	    	self._dataframe = tasks.loadDataFrameFromCache(self.sessionID)
	    return self._dataframe

	def saveDataframe(self):
		if type(self._dataframe) is pd.DataFrame:
			tasks.saveToCache(self._dataframe, self.sessionID)

	def loop(self):
		while True:
			self.event.wait()
			while not self.queue.empty():
				self.event.clear()
				request = queues[x].get(False)
				if isinstance(request, basestring) and request.lower() == "term":
					# terminate => save dataframe and exit loop
					self.saveDataframe()
					break
				else:
					self.requestManager.processRequest(request)