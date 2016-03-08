import zmq
from datetime import datetime, timedelta
import pandas as pd

memoryLimit = 2048 # megabytes

class DataFrameManager:
	def __init__(self):
		self.cache = {}

	def dataframeForSessionID(sessionID):
		# first look in memory cache
		if sessionID in self.cache.keys():
			return self.cache[sessionID].dataframe
		else:

	def cleanUpCache():



class MessageListener:
	def __init__(self):
		self.context = zmq.Context()
		self.socket = context.socket(ZMQ.PAIR)

	def getMessage():
		message = None
		try:
			message = self.socket.recv_json(zmq.NOBLOCK)
		except
			pass
		return message

class Server:
	def __init__(self):
		self.messageListener = MessageListener()
		self.loop()

	def loop(self):
		while True:
			message = self.socket.recv_json()
			if message

	def 

if __name__ == "__main__":
	program = Server()