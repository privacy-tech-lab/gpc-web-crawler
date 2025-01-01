.PHONY: clean start stop help

stop:
	docker-compose down

start:
	DEBUG_MODE=false docker-compose up --build -d

start-debug:
	DEBUG_MODE=true docker-compose up --build -d

clean:
	docker builder prune --all

help:
	@echo "Available commands:"
	@echo "  make start        - Start services in normal mode"
	@echo "  make start-debug  - Start services in debug mode"
	@echo "  make stop         - Stop services"
	@echo "  make clean        - Clean up Docker resources"
