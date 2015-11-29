#!/usr/bin/env bash
source /vagrant/venv/bin/activate
gunicorn --worker-class geventwebsocket.gunicorn.workers.GeventWebSocketWorker flaskApp:app --bind=0.0.0.0:5000