#!/usr/bin/env bash
source /home/vagrant/venv/bin/activate
echo "Re-installing tables for Windows"
pip install pip --upgrade > /dev/null
pip uninstall -y tables > /dev/null
pip install tables --no-binary all > /dev/null
deactivate