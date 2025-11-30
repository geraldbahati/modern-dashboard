# Makefile Quick Reference

This project includes a comprehensive Makefile to simplify common development tasks.

## Getting Started

```bash
# Show all available commands
make help

# Complete project setup
make setup

# Start development servers
make dev
```

## Most Useful Commands

### Quick Start
```bash
make setup              # Install dependencies + create .env
make dev                # Start development servers
make status             # Check project status
```

### Development
```bash
make install            # Install dependencies
make dev                # Start web + server
make dev-web            # Start Next.js only
make dev-server         # Start Hono server only
make build              # Build all packages
make clean              # Clean all build artifacts
```

### Docker
```bash
make docker-up-build    # Build and start containers
make docker-up          # Start containers
make docker-down        # Stop containers
make docker-logs        # View all logs
make docker-logs-web    # View web logs only
make docker-logs-server # View server logs only
make docker-ps          # Show running containers
make docker-restart     # Restart all containers
make docker-clean       # Remove all Docker resources
```

### Database
```bash
make db-push            # Push all schemas
make db-push-auth       # Push auth schema
make db-push-app        # Push app schema
make db-studio-auth     # Open auth DB studio
make db-studio-app      # Open app DB studio
make auth-generate      # Generate auth schema
```

### Code Quality
```bash
make lint               # Lint all code
make format             # Format all code
make type-check         # Run TypeScript checks
make test               # Run tests
```

### Environment
```bash
make env-copy           # Copy .env.docker.example to .env
make env-check          # Verify environment variables
```

### Utilities
```bash
make check-all          # Check all prerequisites
make check-docker       # Check if Docker is running
make check-pnpm         # Check if pnpm is installed
make check-bun          # Check if Bun is installed
```

## Common Workflows

### Fresh Start (Local Development)
```bash
make clean
make install
make dev
```

### Fresh Start (Docker)
```bash
make docker-fresh       # Clean, rebuild, and start
```

### Complete Reset
```bash
make full-reset         # Nuclear option - removes everything
make setup              # Start fresh
```

### Deploy
```bash
make build              # Build for production
make deploy-vercel      # Deploy web to Vercel
```

## Tips

1. **Use `make help`** to see all available commands with descriptions
2. **Chain commands** for complex workflows (e.g., `make clean install build`)
3. **Check status** with `make status` to see what's running
4. **Colored output** makes it easy to spot errors and warnings

## Comparison: Make vs Direct Commands

| Task | Makefile | Direct Command |
|------|----------|---------------|
| Start dev | `make dev` | `pnpm dev` |
| Docker up | `make docker-up-build` | `docker compose up --build -d` |
| Push schemas | `make db-push` | `pnpm db:push:auth && pnpm db:push:app` |
| Clean all | `make clean` | `rm -rf node_modules apps/*/node_modules...` |
| Check status | `make status` | Multiple commands |

## Requirements

- GNU Make (comes with macOS/Linux)
- All project dependencies (pnpm, bun, docker)

Run `make check-all` to verify all prerequisites are installed.

## Customization

The Makefile is located at the project root. You can:
- Add custom targets for your workflow
- Modify existing targets
- Chain multiple targets together

Example custom workflow:
```makefile
my-workflow: clean install build test
	@echo "Custom workflow complete!"
```

Then run: `make my-workflow`

## Help

For detailed help on any command, run:
```bash
make help
```

This displays all available commands organized by category.
