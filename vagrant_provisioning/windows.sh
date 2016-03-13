#!/usr/bin/env bash
source /home/vagrant/venv/bin/activate
echo "Re-installing tables for Windows"
dos2unix /vagrant/vagrant_provisioning/supervisor/celery.sh
dos2unix /vagrant/vagrant_provisioning/supervisor/gunicorn.sh
pip uninstall -y tables > /dev/null
pip install tables --no-binary all > /dev/null
deactivate