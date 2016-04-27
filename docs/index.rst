Developer's Guide to Willow
===========================

Welcome to the Willow developer guide. This documentation is geared towards developers who wish to understand how Willow works behind the scenes. It contains information that will help you get started with modifying and extending the project as per your own needs. 


Overview
--------

On a high level, Willow operates on a client-server model, whereby an :doc:`Angular.js front end <angular/index>` communicates over :doc:`WebSockets <socketAPI/index>` to a :doc:`Flask backend <flask/index>`. The Flask backend serves the assets for the Angular app, and when requested, performs data cleaning and processing operations asynchronously through :doc:`Celery workers <celery/index>`. Willow is powered by the :mod:`pandas` data science library, with all user models being represented by a :class:`pandas.DataFrame` object in memory on the server. Data operations requested by the user are queued to be executed asynchronously by Celery workers. All Celery tasks eventually call functions in  our :doc:`dcs Python package<dcs/index>` which serves as a façade to the :mod:`pandas` library. 


Key Dependencies
----------------

*	`AngularJS <https://angularjs.org/>`_ as the frontend web application framework
*	`SocketIO <http://socket.io/>`_ for WebSocket connections
*	`Flask <http://flask.pocoo.org/>`_ as the back end web application framework
*	`Celery <http://www.celeryproject.org/>`_ for asynchronous data processing tasks
* 	`pandas <http://pandas.pydata.org/>`_ for data representation and manipulation
*	`matplotlib <http://matplotlib.org/>`_ for visualizations
*	`Vagrant <https://www.vagrantup.com/>`_ for deployment


Contents
--------

.. toctree::
	:maxdepth: 2

	architecture
	deployment
	angular/index
	socketAPI/index
	flask/index
	celery/index
	dcs/index
	issues
	files
	tutorial