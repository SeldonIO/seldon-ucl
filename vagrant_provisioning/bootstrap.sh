#!/usr/bin/env bash
echo "Provisioning Seldon UCL data cleaning server"
echo "Updating system package manager..."
apt-get update > /dev/null

# Install Supervisor
echo "Installing Supervisor..."
apt-get install -y supervisor > /dev/null

# Install & setup nginx
echo "Installing nginx..."
apt-get install -y nginx > /dev/null
echo "Setting up nginx..."
rm /etc/nginx/nginx.conf
ln -s /vagrant/vagrant_provisioning/nginx/nginx.conf /etc/nginx/nginx.conf
nginx -s stop > /dev/null

# Install Celery Dependencies
echo "Installing RabbitMQ Server (Celery Dependency)..."
apt-get install -y rabbitmq-server > /dev/null

# Install & set-up Python virtual environment
echo "Installing python-pip..."
apt-get install -y python-pip > /dev/null
echo "Installing virtualenv..."
pip install virtualenv > /dev/null
echo "Setting up Python virtualenv"
virtualenv /vagrant/venv --system-site-packages

# Install Python Dependencies
echo "Installing all Python dependencies..."
apt-get install -y python-pandas > /dev/null
source /vagrant/venv/bin/activate
pip install -r /vagrant/vagrant_provisioning/python/requirements.txt > /dev/null
deactivate

# Run Web server & Dependencies
echo "Starting web server daemons..."
ln -s /vagrant/vagrant_provisioning/supervisor/celery.conf /etc/supervisor/conf.d/celery.conf
ln -s /vagrant/vagrant_provisioning/supervisor/gunicorn.conf /etc/supervisor/conf.d/gunicorn.conf
supervisorctl reread > /dev/null
supervisorctl update > /dev/null
nginx > /dev/null