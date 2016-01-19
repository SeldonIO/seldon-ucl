#!/usr/bin/env bash
pkill celery
source /vagrant/venv/bin/activate
celery -A flaskApp:celery worker