#!/usr/bin/env bash

echo "Starting web server daemons..."
service nginx start > /dev/null
supervisorctl reread > /dev/null
supervisorctl restart all > /dev/null