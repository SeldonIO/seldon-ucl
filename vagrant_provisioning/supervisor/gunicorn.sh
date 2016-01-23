#!/usr/bin/env bash
ps -ef | grep gunicorn | grep -v grep | grep -v supervisor | awk '{print $2}' | xargs kill -9
rm -rf /vagrant/logs/gunicorn.err.log
rm -rf /vagrant/logs/gunicorn.out.log
source /home/vagrant/venv/bin/activate
export PYTHONUNBUFFERED=TRUE
gunicorn --worker-class geventwebsocket.gunicorn.workers.GeventWebSocketWorker flaskApp:app --bind=127.0.0.1:5000 --log-level=critical
deactivate