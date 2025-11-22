# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
pnpm install          # Install all dependencies
pnpm dev              # Start development (Next.js on port 3000)
pnpm build            # Build all packages via Turbo
pnpm lint             # Lint all packages
pnpm format           # Format all TS/TSX/MD files with Prettier
pnpm auth:generate    # Generate auth database schema from better-auth config
```

### Package-specific commands

```bash
# From apps/web
pnpm run dev          # Next.js dev server only
pnpm run build        # Build web app only

# Type checking individual packages
cd packages/auth && pnpm run type-check
cd packages/db && pnpm run type-check
```

## Architecture Overview

This is a **pnpm monorepo** using **Turbo** for build orchestration.

### Workspace Structure

- **apps/web** - Next.js 16 frontend with React 19 and React Compiler
- **packages/ui** - Shared shadcn/ui component library (Radix UI primitives + Tailwind)
- **packages/auth** - Authentication module using better-auth (email/password, 2FA, passkeys, RBAC)
- **packages/db** - Drizzle ORM setup with Neon serverless PostgreSQL
- **packages/eslint-config** - Shared ESLint configurations
- **packages/typescript-config** - Shared TypeScript base configs

### Import Patterns

```typescript
import { Button } from "@workspace/ui/components/button"
import { authClient } from "@workspace/auth/client"
import { db } from "@workspace/db/auth-db"
```

### Key Dependencies

- **Next.js 16** with App Router and React Compiler enabled
- **React 19** with experimental features
- **better-auth** for authentication (supports email verification, 2FA, passkeys, organizations, RBAC)
- **Drizzle ORM** with Neon serverless PostgreSQL
- **Resend** for transactional emails
- **Tailwind CSS 4** with shadcn/ui components

## Environment Variables

Required for full functionality:
- `AUTH_DATABASE_URL` - Neon PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Authentication secret
- `BETTER_AUTH_URL` - Base URL (defaults to http://localhost:3000)
- `RESEND_API_KEY` - Email service API key

## Auth Configuration

The auth system in `packages/auth/src/config.ts` includes:
- Email/password with verification
- Two-factor authentication
- Passkey/WebAuthn support
- Multi-session management (max 10)
- Organization/team management
- RBAC with roles: admin, moderator, editor, user

## UI Component Library

Components in `packages/ui/src/components/` follow shadcn/ui patterns:
- Built on Radix UI primitives
- Styled with Tailwind CSS and class-variance-authority
- Export via `@workspace/ui/components/*`
