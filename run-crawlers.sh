#!/bin/bash

# Default value for DEBUG_MODE if not provided
DEBUG_MODE=${DEBUG_MODE:-true}

run_crawler_batch() {
    local batch_id=$1
    TIMESTAMP=$(date +"%Y%m%d%H%M%S")

    # Start the containers for this batch
    DEBUG_MODE=$DEBUG_MODE TEST_CRAWL=false CRAWL_ID=$batch_id TIMESTAMP=$TIMESTAMP docker compose up --build -d

    echo "Batch $batch_id completed"
}

run_crawler_custom() {
    TIMESTAMP=$(date +"%Y%m%d%H%M%S")
    # Start the containers for this batch
    DEBUG_MODE=true TEST_CRAWL=true TIMESTAMP=$TIMESTAMP docker compose up --build -d


    echo "Custom batch completed"
}

if [ "$CUSTOM_CRAWL" = "true" ]; then
    run_crawler_custom
else
    # Ask user for batch number
    read -p "Enter a batch number (0-8): " batch_number

    # Validate input is a number between 0 and 8
    if [ "$batch_number" -ge 0 ] && [ "$batch_number" -le 8 ]; then
        run_crawler_batch $batch_number
    else
        echo "Invalid input. Please enter a number between 0 and 8."
    fi
fi
