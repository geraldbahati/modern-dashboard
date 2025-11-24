# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
pnpm install          # Install all dependencies
pnpm dev              # Start all apps (Next.js :3000, Hono :3001)
pnpm build            # Build all packages via Turbo
pnpm lint             # Lint all packages
pnpm format           # Format all TS/TSX/MD files with Prettier
```

### Database Commands

```bash
# Auth database (better-auth schema)
pnpm auth:generate    # Generate auth schema from better-auth config
pnpm db:push:auth     # Push auth schema to database
pnpm db:generate:auth # Generate auth migrations
pnpm db:migrate:auth  # Run auth migrations
pnpm db:studio:auth   # Open Drizzle Studio for auth DB

# App database (application data)
pnpm db:push:app      # Push app schema to database
pnpm db:generate:app  # Generate app migrations
pnpm db:migrate:app   # Run app migrations
pnpm db:studio:app    # Open Drizzle Studio for app DB
```

### Package-specific commands

```bash
# Hono server (uses Bun runtime)
cd apps/server && bun run dev     # Start server on port 3001

# Next.js web app
cd apps/web && pnpm run dev       # Start on port 3000
```

## Architecture Overview

This is a **pnpm monorepo** using **Turbo** for build orchestration.

### Workspace Structure

- **apps/web** - Next.js 16 frontend (React 19, React Compiler, port 3000)
- **apps/server** - Hono API server (Bun runtime, port 3001)
- **packages/api** - oRPC router definitions and typed client
- **packages/auth** - Authentication module (better-auth)
- **packages/db** - Drizzle ORM with dual databases (auth + app)
- **packages/ui** - shadcn/ui component library
- **packages/security** - Arcjet security middleware
- **packages/eslint-config** - Shared ESLint configurations
- **packages/typescript-config** - Shared TypeScript base configs

### Two-Server Architecture

The app uses separate frontend and backend servers:

1. **Next.js (port 3000)** - Handles UI rendering, uses `@workspace/auth/next` for server-side session verification
2. **Hono (port 3001)** - Handles API routes (`/api/rpc/*`) and auth endpoints (`/api/auth/*`)

**Important**: Both servers must share the same `BETTER_AUTH_SECRET` and `AUTH_DATABASE_URL` for session verification to work.

### API Layer (oRPC)

The API uses oRPC for type-safe RPC:

```typescript
// Define procedures in packages/api/src/routers/
import { publicProcedure, protectedProcedure } from "../middleware/auth";

// Client usage
import { createBrowserClient } from "@workspace/api/client";
const client = createBrowserClient("http://localhost:3001/api/rpc");
await client.users.list();
```

Procedure types: `publicProcedure`, `protectedProcedure`, `adminProcedure`, `moderatorProcedure`

### Dual Database Setup

Two separate Neon PostgreSQL databases:

1. **Auth DB** (`AUTH_DATABASE_URL`) - better-auth tables (users, sessions, etc.)
2. **App DB** (`DATABASE_URL`) - Application data (projects, etc.)

```typescript
import { authDb } from "@workspace/db/auth-db";
import { appDb } from "@workspace/db/app-db";
```

### Import Patterns

```typescript
import { Button } from "@workspace/ui/components/button"
import { authClient } from "@workspace/auth/client"
import { auth } from "@workspace/auth/next"           // Next.js server components
import { createAuth } from "@workspace/auth/server"   // Hono/non-Next.js
import { authDb } from "@workspace/db/auth-db"
import { appDb } from "@workspace/db/app-db"
import { createBrowserClient } from "@workspace/api/client"
```

## Next.js 16 with Cache Components

The app uses Next.js 16 with `cacheComponents: true` (Partial Prerendering). When accessing runtime data like `headers()` or `cookies()`:

```typescript
import { connection } from "next/server";
import { headers } from "next/headers";

async function MyComponent() {
  await connection(); // Defer to request time
  const headersList = await headers();
  // ...
}
```

Always wrap components using runtime APIs in `<Suspense>`.

## Environment Variables

### apps/server/.env
```
AUTH_DATABASE_URL=     # Neon PostgreSQL for auth
DATABASE_URL=          # Neon PostgreSQL for app data
BETTER_AUTH_SECRET=    # Auth secret (must match web app)
BETTER_AUTH_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000  # Frontend URL for email links
RESEND_API_KEY=        # Email service
ARCJET_KEY=            # Security/rate limiting
```

### apps/web/.env.local
```
NEXT_PUBLIC_AUTH_URL=http://localhost:3001/api/auth  # Client-side auth URL
BETTER_AUTH_URL=http://localhost:3001                # Server-side auth URL
BETTER_AUTH_SECRET=                                   # Must match server
AUTH_DATABASE_URL=                                    # Must match server
```

## Auth Configuration

The auth system (`packages/auth/src/config.ts`) includes:
- Email/password with verification
- Two-factor authentication
- Passkey/WebAuthn support
- Multi-session management (max 10)
- Organization/team management
- RBAC with roles: admin, moderator, editor, user

## Adding UI Components

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

Components are placed in `packages/ui/src/components/` and exported via `@workspace/ui/components/*`.
