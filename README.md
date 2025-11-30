# Modern Dashboard

A production-ready monorepo featuring Next.js 16, Hono API with Bun, and shadcn/ui components.

## Tech Stack

- **Frontend**: Next.js 16 with Turbopack, React 19, React Compiler
- **Backend**: Hono API with Bun runtime
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Auth**: better-auth with OAuth support
- **UI**: shadcn/ui components with Tailwind CSS
- **Security**: Arcjet for rate limiting and protection
- **Deployment**: Docker-ready with Vercel support

## Quick Start

### Using Makefile (Recommended)

```bash
# Complete setup
make setup

# Start development
make dev

# Or with Docker
make docker-up-build
```

### Using pnpm

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev
```

## Available Commands

Run `make help` to see all available commands. Key commands:

```bash
make dev                # Start development servers
make build              # Build all packages
make docker-up-build    # Build and start Docker containers
make db-push            # Push database schemas
make status             # Check project status
```

See [MAKEFILE.md](./MAKEFILE.md) for complete command reference.

## Adding components

To add components to your app, run the following command at the root of your `web` app:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

This will place the ui components in the `packages/ui/src/components` directory.

## Tailwind

Your `tailwind.config.ts` and `globals.css` are already set up to use the components from the `ui` package.

## Using components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from "@workspace/ui/components/button"
```
