FROM oven/bun:1 AS base

# Set working directory
WORKDIR /app

# Prune the workspace for the server app
FROM base AS pruner
COPY . .
RUN bun add -g turbo
RUN turbo prune --scope=server --docker

# Install dependencies and build
FROM base AS builder
WORKDIR /app

# Copy lockfile and package.json's of isolated subworkspace
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code of isolated subworkspace
COPY --from=pruner /app/out/full/ .

# Build the project
RUN bun run build --filter=server...

# Final runner image
FROM base AS runner
WORKDIR /app

# Copy built artifacts and dependencies
COPY --from=builder /app .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Expose the port
EXPOSE 3001

# Start the server
CMD ["bun", "run", "apps/server/dist/index.js"]
