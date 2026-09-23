.DEFAULT_GOAL := help
.PHONY: help install dev dev-down lint format typecheck check build up down logs ps tail-logs deploy deploy-check vault-edit

# Pass the root .env to compose when it exists (compose would otherwise look in ops/)
COMPOSE_ENV := $(if $(wildcard .env),--env-file .env)
COMPOSE     := docker compose $(COMPOSE_ENV) -f ops/docker-compose.yml
COMPOSE_DEV := docker compose $(COMPOSE_ENV) -f ops/docker-compose.dev.yml

# Git ref to deploy: make deploy VERSION=v1.1.0
VERSION ?= main

help: ## Show this help
	@awk 'BEGIN { FS = ":.*## " } \
		/^## / { printf "\n\033[1m%s\033[0m\n", substr($$0, 4); next } \
		/^[a-z-]+:.*## / { printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

## ── Development ──

install: ## Install web and server dependencies
	cd web && bun install
	cd server && bun install

dev: ## Start the dev stack (hot reload)
	$(COMPOSE_DEV) up

dev-down: ## Stop the dev stack
	$(COMPOSE_DEV) down

## ── Quality ──

lint: ## Lint the web app (Biome)
	cd web && bun run lint

format: ## Format the web app (Biome)
	cd web && bun run format

typecheck: ## Type-check the web app
	cd web && bunx tsc --noEmit

check: lint typecheck ## Lint + type-check

build: ## Build the web app
	cd web && bun run build

## ── Production stack (local) ──

up: ## Build and start the production stack
	$(COMPOSE) up -d --build

down: ## Stop the production stack
	$(COMPOSE) down

logs: ## Follow container output
	$(COMPOSE) logs -f

ps: ## Show container status
	$(COMPOSE) ps

tail-logs: ## Follow the endpoint log files (server + web)
	$(COMPOSE) exec server tail -f /data/logs/server.log & \
	$(COMPOSE) exec web tail -f /app/logs/web.log; \
	kill $$! 2>/dev/null

## ── Deployment ──

deploy: ## Deploy VERSION (default: main) to production with Ansible
	ops/deploy.sh -e spotosh_version=$(VERSION)

deploy-check: ## Dry run of the deploy, showing what would change
	ops/deploy.sh -e spotosh_version=$(VERSION) --check --diff

vault-edit: ## Edit the encrypted production secrets
	cd ops/ansible && ansible-vault edit group_vars/all/vault.yml
