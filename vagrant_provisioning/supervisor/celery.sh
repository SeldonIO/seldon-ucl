#!/usr/bin/env bash
ps -ef | grep celery | grep -v grep | grep -v supervisor | awk '{print $2}' | xargs kill -9
rm -rf /vagrant/logs/celery.err.log
rm -rf /vagrant/logs/celery.out.log
source /home/vagrant/venv/bin/activate
export PYTHONUNBUFFERED=TRUE
celery -A flaskApp:celery worker
deactivate