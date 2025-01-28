echo "Starting crawler"

TIMESTAMP=$(date +"%Y%m%d%H%M%S")



if [ "$TEST_CRAWL" = "true" ]; then
  SAVE_PATH=./crawl_results/CUSTOMCRAWL-"$TIMESTAMP"
  mkdir -p "$SAVE_PATH"/error-logging
  touch "$SAVE_PATH"/error-logging/error-logging.json
  
  node index.js $SAVE_PATH 1 -1 
  
  curl -o "$SAVE_PATH"/analysis.json "http://rest_api:8080/analysis"
  if [ "$DEBUG_MODE" = "true" ]; then
    curl -o "$SAVE_PATH"/debug.json "http://rest_api:8080/debug"
  fi
else
  SAVE_PATH=./crawl_results/CRAWLSET"$CRAWL_ID"-"$TIMESTAMP"
  mkdir -p "$SAVE_PATH"/error-logging
  touch "$SAVE_PATH"/error-logging/error-logging.json
  
  node index.js $SAVE_PATH 0 $CRAWL_ID

  curl -o "$SAVE_PATH"/analysis.json "http://rest_api:8080/analysis"
  if [ "$DEBUG_MODE" = "true" ]; then
    curl -o "$SAVE_PATH"/debug.json "http://rest_api:8080/debug"
  fi
fi