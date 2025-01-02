.PHONY: clean start stop help start-debug test

stop:
	docker-compose down

start:
	for i in 1 2 3 4 5 6 7 8; \
	do \
		DEBUG_MODE=true TEST_CRAWL=false CRAWL_ID=$$i docker-compose up --build -d ; \
	done


start-debug:
	for i in 1 2 3 4 5 6 7 8; \
	do \
		DEBUG_MODE=true CRAWL_ID=$$i docker-compose up --build -d ; \
	done


clean:
	rm -rf ./crawl_results
	docker system prune

test:
	DEBUG_MODE=true TEST_CRAWL=true docker-compose up --build -d

help:
	@echo "Available commands:"
	@echo "  make start        - Starts crawler on all 8 batches of sites with debug mode turned off"
	@echo "  make start-debug  - Starts crawler on all 8 batches of sites with debug mode turned on"
	@echo "  make test  	   - Starts crawler on test batch of sites with debug mode turned on"
	@echo "  make stop         - Stops crawler"
	@echo "  make clean        - Removes crawl_results and cleans up docker artifacts related to crawler"

