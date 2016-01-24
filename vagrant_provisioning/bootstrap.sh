#!/usr/bin/env bash

# Set up logging
mkdir -p /vagrant/logs
rm -rf /vagrant/logs/*

# Set up Flask app required directories
mkdir -p /vagrant/flaskApp/cache
mkdir -p /vagrant/flaskApp/temp

echo "Provisioning Seldon UCL data cleaning server"
echo "Installing all Python dependencies..."
source /home/vagrant/venv/bin/activate
for line in $(cat /vagrant/requirements.txt)
do
	echo -en "Installing" $line "\r"
	pip install $line > /dev/null
done
deactivate

echo "Setting up nginx..."
service nginx stop > /dev/null
rm /etc/nginx/nginx.conf > /dev/null
ln -s /vagrant/vagrant_provisioning/nginx/nginx.conf /etc/nginx/nginx.conf > /dev/null

echo "Setting up Supervisor daemons..."
ln -s /vagrant/vagrant_provisioning/supervisor/celery.conf /etc/supervisor/conf.d/celery.conf > /dev/null 2>&1
ln -s /vagrant/vagrant_provisioning/supervisor/gunicorn.conf /etc/supervisor/conf.d/gunicorn.conf > /dev/null 2>&1