#!/usr/bin/env bash
pkill gunicorn
source /vagrant/venv/bin/activate
gunicorn --worker-class geventwebsocket.gunicorn.workers.GeventWebSocketWorker flaskApp:app --bind=0.0.0.0:5000