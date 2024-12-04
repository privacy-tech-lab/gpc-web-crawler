#!/bin/bash


host="rest_api"
port=8080

echo "REST API is up. Starting the web crawler..."

# https://github.com/privacy-tech-lab/gpc-web-crawler/blob/main/README.md
cd /srv/analysis/selenium-optmeowt-crawler
npm install
node local-crawler.tsx
