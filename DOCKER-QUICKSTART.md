# Docker Quick Start Guide

Get the Modern Dashboard (Next.js 16 + Hono/Bun) running in Docker containers in 5 minutes.

## What You'll Get

- **Web App**: Next.js 16 frontend with Turbopack on port 3000
- **API Server**: Hono API with Bun runtime on port 3001
- Both services communicating seamlessly
- Production-ready configuration

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Environment variables configured

## Step 1: Configure Environment

Copy the example environment file and fill in your values:

```bash
cp .env.docker.example .env
```

**Minimum required variables:**
```bash
AUTH_DATABASE_URL=postgresql://...
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=your-32-char-secret
```

> Generate a secure secret: `openssl rand -base64 32`

## Step 2: Start with Docker Compose (Recommended)

```bash
# Build and start all services
docker compose up -d

# View logs
docker compose logs -f web

# Check status
docker compose ps
```

Your app will be available at:
- **Web App**: http://localhost:3000
- **API Server**: http://localhost:3001

## Step 3: Stop Services

```bash
docker compose down
```

## Alternative: Manual Docker Build

If you prefer building manually:

```bash
# Build the image
./scripts/docker-build.sh

# Run the container
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  --name modern-dashboard \
  modern-dashboard-web:latest
```

## Verify Installation

1. Open http://localhost:3000
2. Check health endpoint: http://localhost:3000/api/health
3. View logs: `docker compose logs -f`

## Troubleshooting

### Issue: Cannot connect to Docker daemon

**Solution**: Start Docker Desktop application

### Issue: Port already in use

**Solution**: Stop existing services or change ports in `docker-compose.yml`:
```yaml
ports:
  - "3002:3000"  # Use port 3002 instead
```

### Issue: Build fails with "Module not found"

**Solution**: Ensure you're building from the monorepo root:
```bash
cd /path/to/modern-dashboard
docker build -f apps/web/Dockerfile .
```

### Issue: Container exits immediately

**Solution**: Check environment variables:
```bash
docker compose logs web
```

## Next Steps

- Read the full [DOCKER.md](./DOCKER.md) guide for production deployment
- Configure health checks
- Set up monitoring
- Deploy to cloud platforms (AWS, GCP, DigitalOcean, etc.)

## Production Deployment

For production deployments, see the platform-specific guides in [DOCKER.md](./DOCKER.md):
- Google Cloud Run
- AWS ECS/Fargate
- DigitalOcean App Platform
- Kubernetes
- Fly.io
- Render

## Support

- Issues: Check [DOCKER.md](./DOCKER.md) troubleshooting section
- Next.js Docs: https://nextjs.org/docs
- Docker Docs: https://docs.docker.com
