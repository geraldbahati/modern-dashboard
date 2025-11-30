# Hono + Bun Production Dockerfile for Monorepo
# Optimized multi-stage build with binary compilation

# Use specific Bun version for reproducible builds
FROM oven/bun:1.1.44-alpine AS base

# Install dependencies stage
FROM base AS deps
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache libc6-compat

# Copy workspace configuration files
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./

# Copy production dependency packages
COPY packages/api ./packages/api
COPY packages/auth ./packages/auth
COPY packages/db ./packages/db
COPY packages/security ./packages/security
COPY apps/server ./apps/server

# Copy devDependency packages (needed for workspace resolution)
COPY packages/eslint-config ./packages/eslint-config
COPY packages/typescript-config ./packages/typescript-config
COPY packages/ai ./packages/ai
COPY packages/ui ./packages/ui

# Install all dependencies (Bun doesn't have good --production support with workspaces)
RUN bun install --frozen-lockfile

# Build stage - compile to optimized binary
FROM base AS builder
WORKDIR /app

# Copy everything from deps (includes dependencies and source)
COPY --from=deps /app ./

# Build optimized binary for production
# This creates a standalone executable with all dependencies bundled
WORKDIR /app/apps/server
RUN bun build src/index.ts \
    --compile \
    --minify \
    --target=bun \
    --outfile=server

# Production runtime stage
FROM gcr.io/distroless/base:latest AS runner

# Copy the compiled binary from builder
COPY --from=builder /app/apps/server/server /usr/local/bin/server

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD ["/usr/local/bin/server", "--version"]

# Run the compiled binary
CMD ["/usr/local/bin/server"]
