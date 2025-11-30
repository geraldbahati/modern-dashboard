#!/bin/bash

# Docker Build Script for Modern Dashboard
# Usage: ./scripts/docker-build.sh [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
IMAGE_NAME="modern-dashboard-web"
TAG="latest"
DOCKERFILE="apps/web/Dockerfile"
CONTEXT="."

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --tag|-t)
      TAG="$2"
      shift 2
      ;;
    --no-cache)
      NO_CACHE="--no-cache"
      shift
      ;;
    --help|-h)
      echo "Usage: $0 [options]"
      echo ""
      echo "Options:"
      echo "  -t, --tag TAG        Set image tag (default: latest)"
      echo "  --no-cache           Build without using cache"
      echo "  -h, --help           Show this help message"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

echo -e "${GREEN}Starting Docker build for Modern Dashboard${NC}"
echo -e "${YELLOW}Image: ${IMAGE_NAME}:${TAG}${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}Error: Docker is not running${NC}"
  echo "Please start Docker Desktop and try again"
  exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
  echo -e "${YELLOW}Warning: .env file not found${NC}"
  echo "Create a .env file with required environment variables"
  echo "See DOCKER.md for details"
fi

# Build the image
echo -e "${GREEN}Building Docker image...${NC}"
docker build \
  $NO_CACHE \
  -f $DOCKERFILE \
  -t $IMAGE_NAME:$TAG \
  $CONTEXT

echo ""
echo -e "${GREEN}✓ Build completed successfully!${NC}"
echo ""
echo "Image: ${IMAGE_NAME}:${TAG}"
echo ""
echo "Next steps:"
echo "  1. Run the container:"
echo "     docker run -p 3000:3000 --env-file .env $IMAGE_NAME:$TAG"
echo ""
echo "  2. Or use Docker Compose:"
echo "     docker compose up -d"
echo ""
echo "  3. Check running containers:"
echo "     docker ps"
