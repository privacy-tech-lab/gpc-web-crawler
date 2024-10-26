#!/bin/bash

trap popd EXIT
pushd $PWD &> /dev/null
cd $(dirname "$0")
cd ..

# Check if Docker is installed and running
dockerfail() {
  echo "Docker not found. Check that Docker is installed and running."
  exit 1
}
docker ps &> /dev/null || dockerfail

set -e  # Exit on errors
set -x  # Print commands for debugging

# Clean logs
rm -r ./logs || true
mkdir -p ./logs

# Stop and remove the old container if it exists
docker stop crawl_test || true
docker rm crawl_test || true

# Build the Docker image
docker build --tag=crawl_test . &> build.log

# Check if the user provided the 'debug' argument
if [[ "$1" == "debug" ]]; then
  DEBUG_MODE="true"
  echo "Starting container with debugging enabled."
else
  DEBUG_MODE="false"
  echo "Starting container without debugging."
fi

# Run the Docker container with the DEBUG_MODE environment variable
docker run -d --name crawl_test --privileged \
  -v /sys/fs/cgroup:/sys/fs/cgroup:ro \
  -v "$(pwd)":/srv/analysis \
  -p 5901:5901 \
  -p 6901:6901 \
  -p 8080:8080 \
  -e DEBUG_MODE=$DEBUG_MODE \
  --user 0 \
  crawl_test || true
