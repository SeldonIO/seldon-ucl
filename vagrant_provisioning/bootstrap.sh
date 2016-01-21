#!/usr/bin/env bash

# Set up logging
mkdir -p /vagrant/logs
rm -rf /vagrant/logs/*

# Set up Flask app required directories
mkdir -p /vagrant/flaskApp/cache
mkdir -p /vagrant/flaskApp/temp

echo "Provisioning Seldon UCL data cleaning server"
echo "Updating system package manager..."
apt-get update > /dev/null

# Install & set-up Python virtual environment
echo "Installing & setting up python virtual environment..."
apt-get install -y build-essential python-dev > /dev/null
apt-get install -y libhdf5-dev > /dev/null
apt-get install -y python-virtualenv > /dev/null
virtualenv /vagrant/venv > /dev/null 2>&1

echo "Installing all Python dependencies..."
source /vagrant/venv/bin/activate
for line in $(cat /vagrant/vagrant_provisioning/python/requirements.txt)
do
	echo -en "Installing" $line "\r"
	pip install $line > /dev/null
done
# pip install -r /vagrant/vagrant_provisioning/python/requirements.txt > /dev/null
deactivate

# Install Celery Dependencies
echo "Installing RabbitMQ Server (Celery Dependency)..."
apt-get install -y rabbitmq-server > /dev/null

# Install & setup nginx
echo "Installing nginx..."
apt-get install -y nginx > /dev/null
echo "Setting up nginx..."
service nginx stop > /dev/null
rm /etc/nginx/nginx.conf > /dev/null
ln -s /vagrant/vagrant_provisioning/nginx/nginx.conf /etc/nginx/nginx.conf > /dev/null

# Install & setup Supervisor
echo "Installing Supervisor..."
apt-get install -y supervisor > /dev/null 

echo "Setting up Supervisor daemons..."
ln -s /vagrant/vagrant_provisioning/supervisor/celery.conf /etc/supervisor/conf.d/celery.conf > /dev/null 2>&1
ln -s /vagrant/vagrant_provisioning/supervisor/gunicorn.conf /etc/supervisor/conf.d/gunicorn.conf > /dev/null 2>&1