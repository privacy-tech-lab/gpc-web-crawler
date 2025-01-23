#!/bin/bash

# Default value for DEBUG_MODE if not provided
DEBUG_MODE=${DEBUG_MODE:-true}

run_crawler_batch() {
    local batch_id=$1

    # Start the containers for this batch
    DEBUG_MODE=$DEBUG_MODE TEST_CRAWL=false CRAWL_ID=$batch_id docker compose up --build -d

    crawler_service="crawl_driver"
    container_name=$(docker-compose ps -q $crawler_service)

    echo "Started batch $batch_id with container $container_name (DEBUG_MODE=$DEBUG_MODE)"

    # Wait for the crawler container to finish
    while docker ps -q --no-trunc | grep -q "$container_name"; do
        echo "Batch $batch_id still running..."
        sleep 30
    done

    echo "Batch $batch_id completed"
}

run_crawler_custom() {
    # Start the containers for this batch
    DEBUG_MODE=true TEST_CRAWL=true docker compose up --build -d

    crawler_service="crawl_driver"
    container_name=$(docker-compose ps -q $crawler_service)

    echo "Started custom batch with container $container_name (DEBUG_MODE=$DEBUG_MODE)"

    # Wait for the crawler container to finish
    while docker ps -q --no-trunc | grep -q "$container_name"; do
        echo "Custom batch still running..."
        sleep 30
    done

    echo "Custom batch completed"
}

if [ "$CUSTOM_CRAWL" = "true" ]; then
    run_crawler_custom
else
    # Ask user for batch number
    read -p "Enter a batch number (1-8): " batch_number

    # Validate input is a number between 1 and 8
    if [ "$batch_number" -ge 1 ] && [ "$batch_number" -le 8 ]; then
        run_crawler_batch $batch_number
    else
        echo "Invalid input. Please enter a number between 1 and 8."
    fi
fi
