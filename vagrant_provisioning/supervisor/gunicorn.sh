#!/usr/bin/env bash
ps -ef | grep gunicorn | grep -v grep | grep -v supervisor | awk '{print $2}' | xargs kill -9

# Set up Flask app required directories
mkdir -p /vagrant/flaskApp/cache
mkdir -p /vagrant/flaskApp/temp
# Set up logging
mkdir -p /vagrant/logs

source /home/vagrant/venv/bin/activate
export PYTHONUNBUFFERED=TRUE
gunicorn --worker-class eventlet --workers 1 flaskApp:app --bind=127.0.0.1:5000
deactivate