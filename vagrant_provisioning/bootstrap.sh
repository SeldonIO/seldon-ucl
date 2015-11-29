#!/usr/bin/env bash

apt-get update

# Install Supervisor
apt-get install -y supervisor

# Install & setup nginx
apt-get install -y nginx
rm /etc/nginx/nginx.conf
ln -s /vagrant/vagrant_provisioning/nginx/nginx.conf /etc/nginx/nginx.conf
nginx -s stop

# Install Celery Dependencies
apt-get install -y rabbitmq-server

# Install & set-up Python virtual environment
apt-get install -y python-pip
pip install virtualenv
virtualenv /vagrant/venv --system-site-packages

# Install Python Dependencies
apt-get install -y python-pandas
source /vagrant/venv/bin/activate
pip install -r /vagrant/vagrant_provisioning/python/requirements.txt
deactivate

# Run Web server & Dependencies
ln -s /vagrant/vagrant_provisioning/supervisor/celery.conf /etc/supervisor/conf.d/celery.conf
ln -s /vagrant/vagrant_provisioning/supervisor/gunicorn.conf /etc/supervisor/conf.d/gunicorn.conf
supervisorctl reread
supervisorctl update
nginx start