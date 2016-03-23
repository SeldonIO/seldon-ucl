from datetime import datetime, timedelta
import pandas as pd
from flaskApp import tasks
import multiprocessing, logging
import zmq

class DataFrameManager:
	def __init__(self, sessionID):
		self.sessionID = sessionID

	@property
	def dataFrame(self):
	    if type(self._dataframe) is not pd.DataFrame:
	    	self._dataframe = tasks.loadDataFrameFromCache(self.sessionID)
	    return self._dataframe

	@dataFrame.setter
	def dataFrame(self, value):
		self._dataframe = value

	def saveDataFrame(self):
		if type(self._dataframe) is pd.DataFrame:
			tasks.saveToCache(self._dataframe, self.sessionID)

class RequestCacher:
	def __init__(self):
		pass

class RequestManager:
	def __init__(self, dataFrameManager):
		self.cache = {}
		self.dataFrameManager = dataFrameManager

	def processRequest(self, request):
		if type(request) is dict and "requestID" in request and "sessionID" in request and "operation" in request:
			if request["operation"] == "metadata":
				tasks.metadata(self.dataFrameManager.dataFrame, request)
			elif request["operation"] == "data":
				tasks.data(self.dataFrameManager.dataFrame, request)
			elif request["operation"] == "analyze":
				tasks.analyze(self.dataFrameManager.dataFrame, request["sessionID"], request["requestID"], request["column"])
			elif request["operation"] == "visualize":
				tasks.visualize(self.dataFrameManager.dataFrame, request)

class SessionServer:
	def __init__(self, sessionID, event, queue):
		self.sessionID = sessionID
		self.dataFrameManager = DataFrameManager(sessionID)
		self.requestManager = RequestManager(self.dataFrameManager)
		self.event = event
		self.queue = queue	

	def loop(self):
		while True:
			multiprocessing.get_logger().info("%s server: Waiting for signal" % self.sessionID)
			self.event.wait()
			while not self.queue.empty():
				print("%s server: Got request signal", self.sessionID)
				self.event.clear()
				request = queues[x].get(False)
				if isinstance(request, basestring) and request.lower() == "terminate":
					# terminate signal received => save dataframe and exit event loop => process gets terminated
					self.dataFrameManager.saveDataFrame()
					break
				else:
					self.requestManager.processRequest(request)

class Server:
	def __init__(self):
		context = zmq.Context()
		self.socket = context.socket(zmq.REP)
		self.socket.bind("ipc:///home/vagrant/comm.sock")

		self.dataFrameManager = DataFrameManager(sessionID)
		self.requestManager = RequestManager(self.dataFrameManager)

		self.loop()

	def loop(self):
		while True:
			message = self.socket.recv_json(zmq.NOBLOCK)

			if "sessionID" in message and "operation" in message:
				if message["operation"] == "disconnect":
					
			else:
				print(message)