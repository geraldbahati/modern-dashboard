# Docker Deployment Guide

This guide covers deploying the Modern Dashboard application using Docker with full Next.js 16 and Hono + Bun support.

## Architecture

The application consists of two services:

1. **Web App** (apps/web) - Next.js 16 frontend with Turbopack
2. **API Server** (apps/server) - Hono API with Bun runtime

## Features

### Web App (Next.js 16)
- **Turbopack**: Optimized production builds (2-5x faster)
- **Standalone Output**: Minimal Docker image size using output file tracing
- **React Compiler**: Automatic optimization without manual memoization
- **Cache Components**: Partial Prerendering support
- **All Next.js Features**: SSR, ISR, API routes, middleware

### API Server (Hono + Bun)
- **Bun Runtime**: Ultra-fast JavaScript runtime (3x faster than Node.js)
- **Hono Framework**: Lightweight web framework optimized for edge
- **Binary Compilation**: Optional minimal image size (~50MB)
- **Standard Build**: Full compatibility with all packages (~150MB)

### Common
- **Multi-stage Builds**: Separate build and runtime stages
- **pnpm Monorepo**: Full workspace support
- **Security**: Non-root user execution
- **Production-ready**: All features supported

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Environment variables configured (see `.env.example`)

## Quick Start

### Using Docker Compose (Recommended)

Start both web and server services:

```bash
# Make sure you have a .env file with required variables
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

The application will be available at:
- **Web App**: http://localhost:3000
- **API Server**: http://localhost:3001

### Manual Builds

#### Build Web App

```bash
# Using the build script (recommended)
./scripts/docker-build.sh

# Or manually
docker build -f apps/web/Dockerfile -t modern-dashboard-web .
```

#### Build API Server

```bash
# Using the build script (recommended)
./scripts/docker-build-server.sh

# Standard build (recommended)
./scripts/docker-build-server.sh --standard

# Binary compilation (smaller image)
./scripts/docker-build-server.sh --binary

# Or manually
docker build -f apps/server/Dockerfile.standard -t modern-dashboard-server .
```

### Run Individual Services

```bash
# Run web app
docker run -p 3000:3000 --env-file .env modern-dashboard-web

# Run API server
docker run -p 3001:3001 --env-file .env modern-dashboard-server
```

## Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Auth Database (Neon PostgreSQL)
AUTH_DATABASE_URL=postgresql://user:password@host:5432/auth_db

# App Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/app_db

# Auth Configuration (must match between web and server)
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=http://localhost:3001
NEXT_PUBLIC_AUTH_URL=http://localhost:3001/api/auth

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# Email Service (Resend)
RESEND_API_KEY=re_your_api_key

# Security (Arcjet)
ARCJET_KEY=your_arcjet_key
```

## Build Arguments

The Dockerfile supports build-time arguments for embedding public environment variables:

```bash
docker build \
  --build-arg NEXT_PUBLIC_AUTH_URL=https://api.yourdomain.com/api/auth \
  -f apps/web/Dockerfile \
  -t modern-dashboard-web \
  .
```

**Note**: Only `NEXT_PUBLIC_*` variables should be passed as build args since they are embedded in the client bundle. Other variables should be provided at runtime.

## Docker Architecture

### Multi-Stage Build Process

1. **base**: Sets up Node.js 20 Alpine and pnpm
2. **deps**: Installs all workspace dependencies
3. **builder**: Builds the Next.js application with Turbopack
4. **runner**: Production image with minimal footprint

### Standalone Output

The Dockerfile leverages Next.js's `output: "standalone"` feature which:
- Traces required files automatically
- Includes only necessary dependencies
- Generates a minimal `server.js` file
- Reduces final image size by ~40-60%

### Image Size Optimization

Expected image sizes:
- Base dependencies layer: ~200-300 MB (cached)
- Build layer: ~500-800 MB (not in final image)
- Final production image: ~150-250 MB

## Production Deployment

### Single Container

```bash
# Build
docker build -f apps/web/Dockerfile -t modern-dashboard-web:latest .

# Run
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  --name modern-dashboard \
  modern-dashboard-web:latest
```

### Docker Compose (Recommended)

```bash
# Build and start all services
docker compose up -d --build

# View logs
docker compose logs -f

# Scale services
docker compose up -d --scale web=3

# Update services
docker compose pull
docker compose up -d
```

### Health Checks

Add health checks to your `docker-compose.yml`:

```yaml
services:
  web:
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## Platform-Specific Deployments

### Google Cloud Run

```bash
# Build for Cloud Run
gcloud builds submit --tag gcr.io/PROJECT_ID/modern-dashboard

# Deploy
gcloud run deploy modern-dashboard \
  --image gcr.io/PROJECT_ID/modern-dashboard \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### AWS ECS/Fargate

1. Push image to ECR:
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com
docker tag modern-dashboard-web:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/modern-dashboard:latest
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/modern-dashboard:latest
```

2. Create ECS task definition with the image

### DigitalOcean App Platform

```bash
# Push to DigitalOcean Container Registry
doctl registry login
docker tag modern-dashboard-web:latest registry.digitalocean.com/YOUR_REGISTRY/modern-dashboard:latest
docker push registry.digitalocean.com/YOUR_REGISTRY/modern-dashboard:latest
```

### Kubernetes

Example deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: modern-dashboard
spec:
  replicas: 3
  selector:
    matchLabels:
      app: modern-dashboard
  template:
    metadata:
      labels:
        app: modern-dashboard
    spec:
      containers:
      - name: web
        image: modern-dashboard-web:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        envFrom:
        - secretRef:
            name: app-secrets
```

## Troubleshooting

### Build Failures

**Issue**: `Module not found` errors during build

**Solution**: Ensure all workspace packages are copied in the Dockerfile:
```dockerfile
COPY packages/*/package.json ./packages/
```

**Issue**: Out of memory during build

**Solution**: Increase Docker memory limit or use build args:
```bash
docker build --memory=4g -f apps/web/Dockerfile .
```

### Runtime Issues

**Issue**: `Cannot find module` errors at runtime

**Solution**: The standalone output should include all dependencies. Check `next.config.ts`:
```typescript
output: "standalone"
```

**Issue**: Environment variables not working

**Solution**:
- Build-time: Use `--build-arg` for `NEXT_PUBLIC_*` vars
- Runtime: Pass via `-e` flag or `docker-compose.yml` environment section

### Performance Issues

**Issue**: Slow cold starts

**Solution**: Use health checks and increase `start_period` in Docker Compose

**Issue**: High memory usage

**Solution**: Set Node.js memory limits:
```dockerfile
ENV NODE_OPTIONS="--max-old-space-size=2048"
```

## Best Practices

1. **Use .dockerignore**: Exclude unnecessary files to speed up builds
2. **Layer Caching**: Order COPY commands from least to most frequently changed
3. **Security**: Always run as non-root user (already configured)
4. **Secrets**: Use Docker secrets or environment variables, never hardcode
5. **Multi-stage Builds**: Keep final image minimal
6. **Health Checks**: Implement proper health endpoints
7. **Logging**: Log to stdout/stderr for Docker log aggregation
8. **Monitoring**: Use container monitoring tools (Prometheus, Datadog, etc.)

## Next.js 16 Specific Considerations

### Turbopack Support

The Dockerfile is optimized for Turbopack builds. Next.js 16 uses Turbopack by default, providing:
- 2-5x faster production builds
- Improved tree-shaking
- Better code splitting

No additional configuration needed!

### React Compiler

The React Compiler is enabled in `next.config.ts`. This provides:
- Automatic memoization
- Optimized re-renders
- Better performance without manual optimization

Works seamlessly in Docker builds.

### Cache Components

The `cacheComponents: true` feature (Partial Prerendering) is fully supported. The Docker setup correctly handles:
- Static generation at build time
- Dynamic rendering at request time
- Streaming responses

## References

- [Next.js 16 Documentation](https://nextjs.org/blog/next-16)
- [Next.js Docker Deployment](https://nextjs.org/docs/app/guides/self-hosting)
- [Turbopack Documentation](https://nextjs.org/docs/app/api-reference/turbopack)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## Sources

Research and implementation based on:
- [Next.js 16 Release](https://nextjs.org/blog/next-16)
- [Turbopack Build Feedback](https://github.com/vercel/next.js/discussions/77721)
- [Next.js Docker Example](https://github.com/vercel/next.js/tree/canary/examples/with-docker)
- [How to Dockerize a Next.js App (2025)](https://dev.to/flrndml/how-to-dockerize-a-nextjs-app-2025-5dlh)
- [Turbopack in Next.js 16: Build Speed Optimization](https://medium.com/@mernstackdevbykevin/turbopack-builds-in-next-js-16-performance-gains-real-world-impact-ffa6dc447821)
