#!/bin/bash


host="localhost"
port=8080

echo "Waiting for the REST API to be available on port $port..."

while ! nc -z $host $port; do
  sleep 1
  echo "Waiting..."
done

echo "REST API is up. Starting the web crawler..."

# https://github.com/privacy-tech-lab/gpc-web-crawler/blob/main/README.md
cd /srv/analysis/selenium-optmeowt-crawler
npm install
node local-crawler.js
