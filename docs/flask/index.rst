Flask *web application*
=======================

*Language: Python 2.7*

The externally facing component of the Willow backend which serves as the point of communication for the front-end (:doc:`Angular app </angular/index>` instances) and acts as a mediator, relaying data operation requests received from clients to :doc:`Celery workers </celery/index>`. The Flask application also handles importing and exporting of datasets.  


Dependencies
------------
*	`Flask <http://flask.pocoo.org/>`_ as the web application framework 
*	`Flask-SocketIO <https://github.com/miguelgrinberg/Flask-SocketIO>`_ for enabling support for WebSocket connections with SocketIO
*	`Flask-SQLAlchemy <http://flask-sqlalchemy.pocoo.org/2.1/>`_ for persistently associationg SocketIO client IDs with Willow sessionIDs using SQLite

WebSocket requests
------------------
The Flask web application supports all of the requests detailed in the :doc:`WebSocket API </socketAPI/index>`, and relays each requests to the appropriate :ref:`Celery task function <celery-list-of-tasks>`. 

.. _flask-http:

HTTP endpoints
--------------

.. _flask-upload:

``POST /upload``
""""""""""""""""
	Import a new dataset into Willow and initialize a session


	**Data Params**

	Content-Type: multipart/form-data

	*	|  ``file=[File]``
		|  CSV, JSON or Excel dataset (maximum size 1GB)
	*	|  ``initialSkip=[Integer]``, *optional* 
		|  specify first *n* lines to skip (for CSV and Excel files)
	*	|  ``sampleSize=[Float]``, *optional* 
		|  define the proportion of the dataset for random sampling (between 0 and 1) 
	*	|  ``seed=[Integer]``, *optional* 
		|  seed value for random sampling, use for replicable sampling
	

	**Response**

	Content-Type: application/json

	.. code-block:: none

		{
			'success': [boolean],
			'sessionID': [30 character long hexadecimal string]
		}

	.. note::

		*sessionID* outputted in response must be saved, as it is necessary for 
		referring to the uploaded dataset in future HTTP and WebSocket requests

.. _flask-download-JSON:

``GET downloadJSON/<sessionID>``
""""""""""""""""""""""""""""""""
	Initiate a dataset file download in JSON format. 

	e.g. ``GET downloadJSON/617646cb1e421f72b7e742dbdbd4cb``

	**Response**

	|	Content-Disposition: attachment
	|	Content-Type: application/json

.. _flask-download-CSV:

``GET downloadCSV/<sessionID>``
"""""""""""""""""""""""""""""""
	Initiate a dataset file download in CSV format. 

	e.g. ``GET downloadCSV/617646cb1e421f72b7e742dbdbd4cb``

	**Response**

	|	Content-Disposition: attachment
	|	Content-Type: text/csv

.. _flask-celery-task-completed:

``POST /celeryTaskCompleted``
"""""""""""""""""""""""""""""

	Notify a connected client over WebSocket that a requested operation has been completed. 
	
	.. caution::

		This endpoint is used internally for communication with Celery workers, and should not
		be considered part of the HTTP API. 

	**Data Params**

	Content-Type: application/json

	The JSON in the body of the POST request is forwarded as is to the corresponding 
	WebSocket client connected to the Flask application. 