#!/bin/bash

cd /srv/analysis/rest_api
echo "Running $0 in `pwd` with argument: $1"

set -e
set -x

# Use the first argument to determine which mode to start
echo "DEBUG_MODE is set to: '$DEBUG_MODE'"

if [ "$DEBUG_MODE" = "true" ]; then
  echo "Starting API in debug mode..."
  node index.js debug
else
  echo "Starting API in normal mode..."
  node index.js
fi

set +x
echo '--------------------------------------------------'
echo "REST API started at http://localhost:8080/analysis"
echo '--------------------------------------------------'
