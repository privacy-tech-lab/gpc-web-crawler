echo "Starting crawler"

TIMESTAMP=$(date +"%Y%m%d%H%M%S")

mkdir -p ./crawl_results/"$TIMESTAMP"/error-logging
touch ./crawl_results/"$TIMESTAMP"/error-logging/error-logging.json


if [ "$TEST_CRAWL" = "true" ]; then
  node local-crawler.js $TIMESTAMP 1 -1
else
  node local-crawler.js $TIMESTAMP 0 $CRAWL_ID
fi

curl -o ./crawl_results/"$TIMESTAMP"/analysis.json "http://rest_api:8080/analysis"
curl -o ./crawl_results/"$TIMESTAMP"/debug.json "http://rest_api:8080/debug"
