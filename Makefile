.PHONY: clean start stop help

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
	docker system prune --all

test:
	DEBUG_MODE=true TEST_CRAWL=true docker-compose up --build -d

help:
	@echo "Available commands:"
	@echo "  make start        - Start services in normal mode"
	@echo "  make start-debug  - Start services in debug mode"
	@echo "  make stop         - Stop services"
	@echo "  make clean        - Clean up Docker resources"
