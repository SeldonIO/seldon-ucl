Celery *service*
================

*Language: Python 2.7*

Celery is a distributed task queue, and is used in the Willow backend to perform all requested data operations asynchronously. 


Dependencies
------------
*	**redis** as a message broker and result backend
*	**requests** for notifying Flask app of completed operation through ``POST`` 

Tasks
-----

Celery tasks must be defined as Python functions using the special Celery task decorator. In Willow, Celery tasks are always invoked by the :doc:`Flask application </flask/index>` in response to HTTP and WebSocket requests made by connected clients. 

Because the Celery service and Flask application run as different processes, an interprocess communication (IPC) mechanism was needed to alert the Flask application whenever a Celery task was completed. Since Flask inherently supports HTTP requests, we decided to employ notify the results of completed Celery operations through HTTP, using an internal :ref:`POST /celeryTaskCompleted <flask-celery-task-completed>` endpoint. 

Task Function Structure
-----------------------

A single Celery task function is defined for each :ref:`HTTP <flask-http>` and :doc:`WebSocket <socketAPI/index>` request. Most task functions will have the following structure:

.. code-block:: python

	@celery.task()
	def request(sessionID, requestID, ...):
		# Celery operation results are always JSON dictionaries
		result = {'success' : False, 'requestID': requestID, 'sessionID': sessionID, 'operation': "standardize"}

		# Load data frame from HDF file store using helper function
		df = loadDataFrameFromCache(sessionID)

		try:
			# call appropriate function from dcs library
			result['success'] = True
		except Exception as e:
			# include error information in result
			toReturn['error'] = str(e)
			toReturn['errorDescription'] = traceback.format_exc()

	try:
		# POST result to Flask application using requests library
		requests.post("http://localhost:5000/celeryTaskCompleted/", json=toReturn, timeout=0.001)
	except:
		pass 

.. _celery-list-of-tasks:

List of Tasks
-------------

.. automodule:: flaskApp.tasks
	:members: