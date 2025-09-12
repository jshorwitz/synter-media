.PHONY: up down migrate seed dbinit dev up-init

up:
	docker-compose up -d --build

down:
	docker-compose down -v

migrate:
	bash ./scripts/migrate.sh

seed:
	node ./scripts/seed.js

# Bring up services, run migrations, then seed demo data
up-init: up
	pnpm migrate
	pnpm seed

dev:
	pnpm -C packages/api dev & pnpm -C packages/workers dev
