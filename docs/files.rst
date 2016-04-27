Project File Structure
======================

.. code-block:: none

	├── dcs 			<=== dcs package
	│   ├── analyze.py
	│   ├── clean.py
	│   ├── load.py
	│   ├── view.py
	│   └── testing			<=== dcs unit tests (py.test)
	│       └── ...
	│   
	├── flaskApp			<=== Willow backend (Flask application & Celery tasks)
	│   ├── cache			<=== HDF file store
	│   │   └── flask.db		<=== SQLite database
	│   ├── models.py 		<=== Flask-SQLAlchemy models
	│   ├── tasks.py 			
	│   ├── views.py
	│   └── static			<=== Willow frontend (Angular application)
	│       ├── index.html 		
	│       ├── app.js 		<=== Angular app entry point
	│       ├── controllers 	<=== Angular controllers
	│       │   └── ...
	│       ├── directives		<=== Angular directives
	│       │   └── ...
	│       ├── partials  		<=== Angular views (*.HTML)
	│       │   └── ... 
	│       ├── services 		<=== Angular providers
	│       │   └── ...
	│       ├── filters.js 		<=== Angular filters
	│       ├── images 		<=== Angular app assets
	│       │   └── ...
	│       ├── css 		<=== Angular app assets
	│       │   └── ... 		
	│       ├── karma.conf.js 	<=== Angular app unit testing (Jasmine with Karma) configuration
	│       ├── libraries 		<=== Angular app dependencies
	│       │   ├── bower.json
	│       │   └── bower_components
	│       │       ├── angular
	│       │       ├── angular-animate
	│       │       ├── angular-aria
	│       │       ├── angular-material
	│       │       ├── moment
	│       │       ├── ng-file-upload
	│       │       ├── pikaday
	│       │       └── zeroclipboard
	│       ├── node_modules 	<=== Angular app unit testing dependencies
	│       │   └── ...
	│       ├── package.json 	
	│       └── test 		<=== Angular unit tests
	│           └── ...
	│
	├── logs 			<=== Willow backend log files
	├── requirements.txt 		<=== Willow backend python dependencies
	│
	│  
	├── Vagrantfile  		<=== Vagrant deployment configuration
	└── vagrant_provisioning 	<=== Vagrant provisioning files
		├── bootstrap.sh
		├── nginx
		│   └── nginx.conf
		├── startup.sh
		└── supervisor
			├── celery.conf
			├── celery.sh
			├── gunicorn.conf
			└── gunicorn.sh