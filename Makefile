.PHONY: clean start stop help start-debug test

stop:
	docker compose down

start:
	DEBUG_MODE=false sh run-crawlers.sh

start-debug:
	DEBUG_MODE=true sh run-crawlers.sh

clean:
	docker system prune --volumes

custom:
	CUSTOM_CRAWL=true sh run-crawlers.sh

help:
	@echo "Available commands:"
	@echo "  make start        - Starts crawler on all 8 batches of sites with debug mode turned off"
	@echo "  make start-debug  - Starts crawler on all 8 batches of sites with debug mode turned on"
	@echo "  make test  	   - Starts crawler on test batch of sites with debug mode turned on"
	@echo "  make stop         - Stops crawler"
	@echo "  make clean        - Removes crawl_results and cleans up docker artifacts related to crawler"

