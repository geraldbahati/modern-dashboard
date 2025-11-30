#!/bin/bash

# Docker Build Script for Hono Server
# Usage: ./scripts/docker-build-server.sh [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
IMAGE_NAME="modern-dashboard-server"
TAG="latest"
DOCKERFILE="apps/server/Dockerfile.standard"
CONTEXT="."
BUILD_TYPE="standard"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --tag|-t)
      TAG="$2"
      shift 2
      ;;
    --binary|-b)
      BUILD_TYPE="binary"
      DOCKERFILE="apps/server/Dockerfile"
      shift
      ;;
    --standard|-s)
      BUILD_TYPE="standard"
      DOCKERFILE="apps/server/Dockerfile.standard"
      shift
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
      echo "  -b, --binary         Use binary compilation Dockerfile (smaller, may have compatibility issues)"
      echo "  -s, --standard       Use standard Bun runtime Dockerfile (default, recommended)"
      echo "  --no-cache           Build without using cache"
      echo "  -h, --help           Show this help message"
      echo ""
      echo "Examples:"
      echo "  $0                          # Build with standard Dockerfile"
      echo "  $0 --binary                 # Build with binary compilation"
      echo "  $0 --tag v1.0.0             # Build with specific tag"
      echo "  $0 --binary --no-cache      # Build binary without cache"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}  ${GREEN}Hono Server Docker Build${NC}                              ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Build Type:${NC} ${BUILD_TYPE}"
echo -e "${YELLOW}Image:${NC} ${IMAGE_NAME}:${TAG}"
echo -e "${YELLOW}Dockerfile:${NC} ${DOCKERFILE}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}✗ Error: Docker is not running${NC}"
  echo "Please start Docker Desktop and try again"
  exit 1
fi

# Check if we're in the project root
if [ ! -f "package.json" ] || [ ! -d "apps/server" ]; then
  echo -e "${RED}✗ Error: Must run from project root${NC}"
  echo "Current directory: $(pwd)"
  exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
  echo -e "${YELLOW}⚠ Warning: .env file not found${NC}"
  echo "The server will need environment variables at runtime"
fi

# Show build info
echo -e "${GREEN}Building Docker image...${NC}"
echo ""

if [ "$BUILD_TYPE" = "binary" ]; then
  echo -e "${BLUE}ℹ Info: Using binary compilation${NC}"
  echo "  - Smaller image size (~50-80 MB)"
  echo "  - Single executable with all dependencies"
  echo "  - May have compatibility issues with some packages"
  echo ""
fi

# Build the image
START_TIME=$(date +%s)

docker build \
  $NO_CACHE \
  -f $DOCKERFILE \
  -t $IMAGE_NAME:$TAG \
  $CONTEXT

END_TIME=$(date +%s)
BUILD_TIME=$((END_TIME - START_TIME))

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║${NC}  ${GREEN}✓ Build completed successfully!${NC}                         ${GREEN}║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Build Information:${NC}"
echo -e "  Image: ${GREEN}${IMAGE_NAME}:${TAG}${NC}"
echo -e "  Build Time: ${YELLOW}${BUILD_TIME}s${NC}"
echo -e "  Build Type: ${YELLOW}${BUILD_TYPE}${NC}"
echo ""

# Get image size
IMAGE_SIZE=$(docker images ${IMAGE_NAME}:${TAG} --format "{{.Size}}")
echo -e "  Image Size: ${YELLOW}${IMAGE_SIZE}${NC}"
echo ""

echo -e "${BLUE}Next steps:${NC}"
echo ""
echo "  ${GREEN}1.${NC} Run the container:"
echo "     ${YELLOW}docker run -p 3001:3001 --env-file .env ${IMAGE_NAME}:${TAG}${NC}"
echo ""
echo "  ${GREEN}2.${NC} Or use Docker Compose:"
echo "     ${YELLOW}docker compose up -d${NC}"
echo ""
echo "  ${GREEN}3.${NC} Check server health:"
echo "     ${YELLOW}curl http://localhost:3001/health${NC}"
echo ""
echo "  ${GREEN}4.${NC} View logs:"
echo "     ${YELLOW}docker logs -f \$(docker ps -q --filter ancestor=${IMAGE_NAME}:${TAG})${NC}"
echo ""
