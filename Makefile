.PHONY: up down migrate dev

up:
	docker-compose up -d --build

down:
	docker-compose down -v

migrate:
	bash ./scripts/migrate.sh

dev:
	pnpm -C packages/api dev & pnpm -C packages/workers dev
