#!/bin/bash

# Default value for DEBUG_MODE if not provided
DEBUG_MODE=${DEBUG_MODE:-true}

run_crawler_batch() {
    local batch_id=$1
    
    # Start the containers for this batch
    DEBUG_MODE=$DEBUG_MODE TEST_CRAWL=false CRAWL_ID=$batch_id docker-compose up --build -d
    
    crawler_service="crawl_driver"
    container_name=$(docker-compose ps -q $crawler_service)
    
    echo "Started batch $batch_id with container $container_name (DEBUG_MODE=$DEBUG_MODE)"
    
    # Wait for the crawler container to finish
    while docker ps -q --no-trunc | grep -q "$container_name"; do
        echo "Batch $batch_id still running..."
        sleep 30
    done
    
    # Once crawler is done, shut down all services from this compose
    DEBUG_MODE=$DEBUG_MODE TEST_CRAWL=false CRAWL_ID=$batch_id docker-compose down
    
    echo "Batch $batch_id completed and cleaned up"
}

# Main execution
echo "Starting crawler batches with DEBUG_MODE=$DEBUG_MODE"

# Run batches sequentially
for batch in {1..8}; do
    echo "Starting batch $batch"
    run_crawler_batch $batch
done

echo "All crawler batches have completed"