dcs *package*
=============

*Language: Python 2.7*

``dcs`` is a standalone Python package that serves as a façade to the :mod:`pandas` data science library in the Willow backend. The :mod:`dcs` package is  used as a library in the Willow backend, performing all the data loading, processing, analysis and visualization operations. All requests to the Flask server in the backend ultimately call functions in the ``dcs`` package that perform data operations through Celery workers. 

Dependencies
------------
The ``dcs`` package has the following dependencies:

*	`pandas <http://pandas.pydata.org/>`_ for data representation & manipulation
*	`numpy <http://www.numpy.org/>`_ for data representation
*	`matplotlib <http://matplotlib.org/>`_ for visualizations
*	`scipy <http://scipy.org/scipylib/>`_ for statistical analysis
*	`chardet <https://github.com/chardet/chardet>`_ for file encoding detection
*	`dateutil <https://github.com/dateutil/dateutil/>`_ for date parsing
*	`py.test <http://pytest.org/latest/>`_ for unit testing

Modules
-------
The ``dcs`` package is composed of the following four modules:

.. toctree::
	load
	clean
	analyze
	view