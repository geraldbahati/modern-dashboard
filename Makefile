# Modern Dashboard Makefile
# Common commands for development, Docker, and deployment

.PHONY: help install dev build clean docker docker-build docker-up docker-down docker-logs db-push db-migrate db-studio lint format test

# Default target - show help
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

##@ Help

help: ## Display this help message
	@echo "$(BLUE)Modern Dashboard - Available Commands$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "Usage:\n  make $(YELLOW)<target>$(NC)\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(BLUE)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Development

install: ## Install all dependencies
	@echo "$(GREEN)Installing dependencies...$(NC)"
	pnpm install

dev: ## Start development servers (web + server)
	@echo "$(GREEN)Starting development servers...$(NC)"
	pnpm dev

dev-web: ## Start Next.js web app only (port 3000)
	@echo "$(GREEN)Starting Next.js web app...$(NC)"
	cd apps/web && pnpm run dev

dev-server: ## Start Hono server only (port 3001)
	@echo "$(GREEN)Starting Hono server...$(NC)"
	cd apps/server && bun run dev

build: ## Build all packages
	@echo "$(GREEN)Building all packages...$(NC)"
	pnpm build

build-web: ## Build Next.js web app
	@echo "$(GREEN)Building Next.js web app...$(NC)"
	cd apps/web && pnpm run build

build-server: ## Build Hono server
	@echo "$(GREEN)Building Hono server...$(NC)"
	cd apps/server && bun run build:local

clean: ## Clean build artifacts and dependencies
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	rm -rf node_modules
	rm -rf apps/*/node_modules
	rm -rf packages/*/node_modules
	rm -rf apps/*/.next
	rm -rf apps/*/dist
	rm -rf apps/*/build
	@echo "$(GREEN)Clean complete!$(NC)"

##@ Docker

docker-build: ## Build Docker images for web and server
	@echo "$(GREEN)Building Docker images...$(NC)"
	./scripts/docker-build.sh
	./scripts/docker-build-server.sh

docker-build-web: ## Build web Docker image only
	@echo "$(GREEN)Building web Docker image...$(NC)"
	./scripts/docker-build.sh

docker-build-web-turbo: ## Build web with Turbo prune (optimized)
	@echo "$(GREEN)Building web Docker image with Turbo prune...$(NC)"
	docker build -f apps/web/Dockerfile.turbo -t modern-dashboard-web:latest .

docker-build-server: ## Build server Docker image only
	@echo "$(GREEN)Building server Docker image...$(NC)"
	./scripts/docker-build-server.sh

docker-build-server-turbo: ## Build server with Turbo prune (optimized)
	@echo "$(GREEN)Building server Docker image with Turbo prune...$(NC)"
	docker build -f apps/server/Dockerfile.turbo -t modern-dashboard-server:latest .

docker-build-server-binary: ## Build server with binary compilation
	@echo "$(GREEN)Building server Docker image (binary)...$(NC)"
	./scripts/docker-build-server.sh --binary

docker-build-turbo: docker-build-web-turbo docker-build-server-turbo ## Build both services with Turbo prune

docker-up: ## Start all Docker services
	@echo "$(GREEN)Starting Docker services...$(NC)"
	docker compose up -d

docker-up-build: ## Build and start all Docker services
	@echo "$(GREEN)Building and starting Docker services...$(NC)"
	docker compose up --build -d

docker-down: ## Stop all Docker services
	@echo "$(YELLOW)Stopping Docker services...$(NC)"
	docker compose down

docker-restart: ## Restart all Docker services
	@echo "$(YELLOW)Restarting Docker services...$(NC)"
	docker compose restart

docker-logs: ## View logs from all services
	docker compose logs -f

docker-logs-web: ## View web app logs
	docker compose logs -f web

docker-logs-server: ## View server logs
	docker compose logs -f server

docker-ps: ## Show running containers
	docker compose ps

docker-clean: ## Remove all containers, images, and volumes
	@echo "$(RED)Cleaning Docker resources...$(NC)"
	docker compose down -v --rmi all
	@echo "$(GREEN)Docker cleanup complete!$(NC)"

##@ Database

db-push-auth: ## Push auth schema to database
	@echo "$(GREEN)Pushing auth schema...$(NC)"
	pnpm db:push:auth

db-push-app: ## Push app schema to database
	@echo "$(GREEN)Pushing app schema...$(NC)"
	pnpm db:push:app

db-push: ## Push all schemas to database
	@echo "$(GREEN)Pushing all schemas...$(NC)"
	pnpm db:push:auth
	pnpm db:push:app

db-generate-auth: ## Generate auth migrations
	@echo "$(GREEN)Generating auth migrations...$(NC)"
	pnpm db:generate:auth

db-generate-app: ## Generate app migrations
	@echo "$(GREEN)Generating app migrations...$(NC)"
	pnpm db:generate:app

db-migrate-auth: ## Run auth migrations
	@echo "$(GREEN)Running auth migrations...$(NC)"
	pnpm db:migrate:auth

db-migrate-app: ## Run app migrations
	@echo "$(GREEN)Running app migrations...$(NC)"
	pnpm db:migrate:app

db-studio-auth: ## Open Drizzle Studio for auth DB
	@echo "$(GREEN)Opening Drizzle Studio (auth)...$(NC)"
	pnpm db:studio:auth

db-studio-app: ## Open Drizzle Studio for app DB
	@echo "$(GREEN)Opening Drizzle Studio (app)...$(NC)"
	pnpm db:studio:app

auth-generate: ## Generate auth schema from better-auth
	@echo "$(GREEN)Generating auth schema...$(NC)"
	pnpm auth:generate

##@ Code Quality

lint: ## Lint all packages
	@echo "$(GREEN)Linting code...$(NC)"
	pnpm lint

format: ## Format all code with Prettier
	@echo "$(GREEN)Formatting code...$(NC)"
	pnpm format

type-check: ## Run TypeScript type checking
	@echo "$(GREEN)Running type checks...$(NC)"
	pnpm type-check

##@ Testing

test: ## Run all tests
	@echo "$(GREEN)Running tests...$(NC)"
	pnpm test

test-watch: ## Run tests in watch mode
	@echo "$(GREEN)Running tests in watch mode...$(NC)"
	pnpm test:watch

##@ Environment

env-copy: ## Copy .env.docker.example to .env
	@if [ ! -f .env ]; then \
		echo "$(GREEN)Copying .env.docker.example to .env...$(NC)"; \
		cp .env.docker.example .env; \
		echo "$(YELLOW)Please update .env with your actual values$(NC)"; \
	else \
		echo "$(YELLOW).env already exists. Skipping...$(NC)"; \
	fi

env-check: ## Check if required environment variables are set
	@echo "$(GREEN)Checking environment variables...$(NC)"
	@if [ -f .env ]; then \
		echo "$(GREEN)✓ .env file found$(NC)"; \
		if grep -q "your-" .env || grep -q "placeholder" .env; then \
			echo "$(YELLOW)⚠ Warning: .env contains placeholder values$(NC)"; \
		else \
			echo "$(GREEN)✓ .env appears to be configured$(NC)"; \
		fi \
	else \
		echo "$(RED)✗ .env file not found$(NC)"; \
		echo "$(YELLOW)Run: make env-copy$(NC)"; \
	fi

##@ Deployment

deploy-vercel: ## Deploy to Vercel
	@echo "$(GREEN)Deploying to Vercel...$(NC)"
	cd apps/web && vercel deploy --prod

deploy-server: ## Deploy server (configure for your platform)
	@echo "$(YELLOW)Configure deployment for your platform$(NC)"
	@echo "See DOCKER.md for deployment guides"

##@ Utilities

check-docker: ## Check if Docker is running
	@if docker info > /dev/null 2>&1; then \
		echo "$(GREEN)✓ Docker is running$(NC)"; \
	else \
		echo "$(RED)✗ Docker is not running$(NC)"; \
		echo "$(YELLOW)Please start Docker Desktop$(NC)"; \
		exit 1; \
	fi

check-bun: ## Check if Bun is installed
	@if command -v bun > /dev/null 2>&1; then \
		echo "$(GREEN)✓ Bun is installed (version: $$(bun --version))$(NC)"; \
	else \
		echo "$(RED)✗ Bun is not installed$(NC)"; \
		echo "$(YELLOW)Install from: https://bun.sh$(NC)"; \
		exit 1; \
	fi

check-pnpm: ## Check if pnpm is installed
	@if command -v pnpm > /dev/null 2>&1; then \
		echo "$(GREEN)✓ pnpm is installed (version: $$(pnpm --version))$(NC)"; \
	else \
		echo "$(RED)✗ pnpm is not installed$(NC)"; \
		echo "$(YELLOW)Install with: npm install -g pnpm$(NC)"; \
		exit 1; \
	fi

check-all: check-pnpm check-bun check-docker ## Check all prerequisites

status: ## Show project status
	@echo "$(BLUE)Project Status$(NC)"
	@echo ""
	@echo "$(YELLOW)Environment:$(NC)"
	@make -s env-check
	@echo ""
	@echo "$(YELLOW)Docker:$(NC)"
	@if docker compose ps 2>/dev/null | grep -q "Up"; then \
		echo "$(GREEN)✓ Docker services are running$(NC)"; \
		docker compose ps; \
	else \
		echo "$(YELLOW)○ Docker services are not running$(NC)"; \
	fi
	@echo ""
	@echo "$(YELLOW)Build Artifacts:$(NC)"
	@if [ -d "apps/web/.next" ]; then \
		echo "$(GREEN)✓ Web app built$(NC)"; \
	else \
		echo "$(YELLOW)○ Web app not built$(NC)"; \
	fi
	@if [ -d "apps/server/dist" ]; then \
		echo "$(GREEN)✓ Server built$(NC)"; \
	else \
		echo "$(YELLOW)○ Server not built$(NC)"; \
	fi

##@ Quick Start

setup: check-all install env-copy ## Complete project setup (install + env)
	@echo ""
	@echo "$(GREEN)✓ Setup complete!$(NC)"
	@echo ""
	@echo "$(YELLOW)Next steps:$(NC)"
	@echo "  1. Update .env with your database credentials"
	@echo "  2. Run: make dev (for local development)"
	@echo "  3. Or: make docker-up-build (for Docker)"

quick-start: setup dev ## Setup and start development servers
	@echo "$(GREEN)Development servers started!$(NC)"

##@ Common Workflows

fresh-start: clean install build ## Clean install and build
	@echo "$(GREEN)Fresh build complete!$(NC)"

docker-fresh: docker-down docker-clean docker-up-build ## Fresh Docker build
	@echo "$(GREEN)Docker fresh start complete!$(NC)"

full-reset: clean docker-clean ## Nuclear option - reset everything
	@echo "$(RED)Full reset complete!$(NC)"
	@echo "$(YELLOW)Run 'make setup' to start fresh$(NC)"
