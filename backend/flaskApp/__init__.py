from flask import Flask
from flask_socketio import SocketIO
from celery import Celery

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024
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
socketio=SocketIO(app)

import flaskApp.views