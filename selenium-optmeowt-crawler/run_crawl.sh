#!/bin/bash


host="rest_api"
port=8080

echo "REST API is up. Starting the web crawler..."

# https://github.com/privacy-tech-lab/gpc-web-crawler/blob/main/README.md
cd /srv/analysis/selenium-optmeowt-crawler

echo "--- Ensuring a clean installation of npm dependencies ---"
rm -rf node_modules
rm package-lock.json  # Or yarn.lock if you're using Yarn
npm install

echo "Starting the web crawler..."
node local-crawler.js
