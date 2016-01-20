#!/usr/bin/env bash
sed -i '/tty/!s/mesg n/tty -s \\&\\& mesg n/' /root/.profile
rmdir /vagrant/logs > /dev/null 2>&1
mkdir -p /vagrant/logs
mkdir -p /vagrant/flaskApp/cache
mkdir -p /vagrant/flaskApp/temp

echo "Provisioning Seldon UCL data cleaning server"
echo "Updating system package manager..."
apt-get update > /dev/null 2>&1

# Install Supervisor
echo "Installing Supervisor..."
apt-get install -y supervisor > /dev/null 2>&1

# Install & setup nginx
echo "Installing nginx..."
apt-get install -y nginx > /dev/null 2>&1
echo "Setting up nginx..."
rm /etc/nginx/nginx.conf > /dev/null 2>&1
ln -s /vagrant/vagrant_provisioning/nginx/nginx.conf /etc/nginx/nginx.conf
nginx -s stop > /dev/null 2>&1

# Install Celery Dependencies
echo "Installing RabbitMQ Server (Celery Dependency)..."
apt-get install -y rabbitmq-server > /dev/null 2>&1

# Install & set-up Python virtual environment
echo "Installing python-pip..."
apt-get install -y python-pip > /dev/null 2>&1
echo "Installing virtualenv..."
pip install virtualenv > /dev/null 2>&1
echo "Setting up Python virtualenv"
virtualenv /vagrant/venv --system-site-packages > /dev/null 2>&1

# Install Python Dependencies
echo "Installing all Python dependencies..."
apt-get install -y python-pandas > /dev/null 2>&1
source /vagrant/venv/bin/activate
pip install -r /vagrant/vagrant_provisioning/python/requirements.txt > /dev/null 2>&1
deactivate

# Run Web server & Dependencies
echo "Starting web server daemons..."
ln -s /vagrant/vagrant_provisioning/supervisor/celery.conf /etc/supervisor/conf.d/celery.conf
ln -s /vagrant/vagrant_provisioning/supervisor/gunicorn.conf /etc/supervisor/conf.d/gunicorn.conf
supervisorctl reread > /dev/null 2>&1
supervisorctl update > /dev/null 2>&1
nginx > /dev/null 2>&1