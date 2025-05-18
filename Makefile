# Makefile for LangGraph Server

.PHONY: dev build down clean

# Development - hot-reload both services
dev:
	docker-compose up --build

# Production build
build:
	docker-compose -f docker-compose.yml build

# Stop all containers
down:
	docker-compose down

# Clean up containers, networks, and volumes
clean:
	docker-compose down -v
	docker system prune -f
