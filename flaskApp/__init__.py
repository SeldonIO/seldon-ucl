from flask import Flask
from flask_socketio import SocketIO
from celery import Celery
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.debug = False
app.config['MAX_CONTENT_LENGTH'] = 1000 ** 3

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///cache/flask.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

import flaskApp.models

db.create_all()

app.config['CELERY_BROKER_URL']='amqp://guest@localhost//'
app.config['CELERY_RESULT_BACKEND']='amqp://'
celery = Celery(app.import_name, backend=app.config['CELERY_RESULT_BACKEND'], broker=app.config['CELERY_BROKER_URL'])
celery.conf.update(app.config)
TaskBase = celery.Task
class ContextTask(TaskBase):
	abstract = True
	def __call__(self, *args, **kwargs):
		with app.app_context():
			return TaskBase.__call__(self, *args, **kwargs)
celery.Task = ContextTask

app.debug=True
socketio=SocketIO(app, logger=False, engineio_logger=False)

import flaskApp.views