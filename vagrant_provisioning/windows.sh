#!/usr/bin/env bash
source /home/vagrant/venv/bin/activate
echo "Re-installing tables for Windows"
pip install pip --upgrade > /dev/null
pip uninstall tables > /dev/null
pip install tables --no-binary > /dev/null
deactivate