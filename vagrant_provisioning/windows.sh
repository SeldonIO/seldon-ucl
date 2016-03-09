#!/usr/bin/env bash
source /home/vagrant/venv/bin/activate
echo "Re-installing tables for Windows"
sudo apt-get update > /dev/null
sudo apt-get install -y dos2unix > /dev/null
dos2unix /vagrant/vagrant_provisioning/supervisor/celery.sh
dos2unix /vagrant/vagrant_provisioning/supervisor/gunicorn.sh
pip install pip --upgrade > /dev/null
pip uninstall -y tables > /dev/null
pip install tables --no-binary all > /dev/null
deactivate