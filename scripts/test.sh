#!/bin/bash

trap popd EXIT
pushd $PWD &> /dev/null
cd $(dirname "$0")
cd ..

dockerfail() {
	echo "Docker not found. Check that Docker is installed and running."
	exit 1
}
docker ps &> /dev/null || dockerfail

set -e
set -x

#clean logs
rm -r ./logs
mkdir -p ./logs

docker stop crawl_test || true
docker rm crawl_test || true
docker build --tag=crawl_test .  &> build.log
docker run -d --name crawl_test --privileged \
	-v /sys/fs/cgroup:/sys/fs/cgroup:ro \
	-v "$(pwd)":/srv/analysis \
	--env-file .env \
	-p 5901:5901 \
	-p 6901:6901 \
	-p 8080:8080 \
	--user 0 \
	crawl_test || true
