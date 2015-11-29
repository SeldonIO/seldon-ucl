#!/usr/bin/env bash
source /vagrant/venv/bin/activate
celery -A flaskApp:celery worker