echo "Starting crawler"

mkdir ./crawl_results/error-logging
touch ./crawl_results/error-logging/error-logging.json

node local-crawler.js

curl -o ./crawl_results/analysis.json "http://rest_api:8080/analysis"
curl -o ./crawl_results/debug.json "http://rest_api:8080/debug"
