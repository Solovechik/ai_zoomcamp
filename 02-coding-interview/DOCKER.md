# Docker Deployment Guide

This guide explains how to build and deploy the coding interview platform using Docker.

## Overview

The application is containerized in a single Docker image containing both the frontend and backend:
- **Frontend**: Built React app served as static files
- **Backend**: Express.js server + Socket.io
- **Image Size**: ~217 MB (optimized with Alpine Linux)
- **Port**: 3001 (single port for entire application)

## Architecture

### Multi-Stage Build
```
Stage 1: Frontend Builder (node:20-alpine)
  ├─ Install all dependencies (including devDependencies)
  ├─ Build React app with Vite
  └─ Output: /app/client/dist

Stage 2: Final Image (node:20-alpine)
  ├─ Install only production dependencies
  ├─ Copy backend source
  ├─ Copy built frontend from Stage 1
  └─ Serve frontend from Express at /app/public
```

## Quick Start

### Build the Image

```bash
docker build -t coding-interview:latest .
```

### Run with Docker

**Standalone (with external database):**
```bash
docker run -d \
  --name coding-interview-app \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e DB_HOST=your-db-host \
  -e DB_PORT=5432 \
  -e DB_NAME=coding_interview \
  -e DB_USER=your-db-user \
  -e DB_PASSWORD=your-db-password \
  coding-interview:latest
```

**With Docker Compose (includes PostgreSQL):**
```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down
```

## Environment Variables

Required environment variables:

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `NODE_ENV` | Environment | `production` | `production` |
| `PORT` | Server port | `3001` | `3001` |
| `DB_HOST` | PostgreSQL host | `localhost` | `postgres` |
| `DB_PORT` | PostgreSQL port | `5432` | `5432` |
| `DB_NAME` | Database name | `coding_interview` | `coding_interview` |
| `DB_USER` | Database user | `devuser` | `devuser` |
| `DB_PASSWORD` | Database password | - | `your-password` |
| `CORS_ORIGIN` | CORS origin | `*` | `https://example.com` |

## Docker Compose Configuration

The `docker-compose.yml` includes two services:

### 1. PostgreSQL Database
```yaml
services:
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/migrations:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U devuser"]
      interval: 10s
```

### 2. Application
```yaml
services:
  app:
    build: .
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      NODE_ENV: production
      DB_HOST: postgres
```

## Testing the Deployment

### 1. Health Check
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-04T11:17:09.711Z",
  "uptime": 28.18
}
```

### 2. Frontend Access
Open your browser to: `http://localhost:3001`

### 3. API Test
```bash
curl http://localhost:3001/api/sessions
```

### 4. Container Logs
```bash
# View all logs
docker logs coding-interview-app

# Follow logs in real-time
docker logs -f coding-interview-app

# With docker-compose
docker-compose logs -f app
```

## Production Deployment

### 1. Cloud Platform Deployment (Railway, Render, etc.)

**Dockerfile-based deployment:**
```bash
# 1. Push code to GitHub
git push origin main

# 2. Connect repository to platform
# - Railway: New Project → Deploy from GitHub
# - Render: New Web Service → Connect Repository

# 3. Set environment variables in platform UI
NODE_ENV=production
DB_HOST=your-cloud-db-host
DB_PASSWORD=secure-password
CORS_ORIGIN=https://your-app.example.com

# 4. Platform automatically builds and deploys using Dockerfile
```

### 2. Manual Docker Deployment

**On your server:**
```bash
# 1. Clone repository
git clone <your-repo>
cd 02-coding-interview

# 2. Build image
docker build -t coding-interview:latest .

# 3. Run with production environment
docker run -d \
  --name coding-interview-app \
  --restart unless-stopped \
  -p 80:3001 \
  -e NODE_ENV=production \
  -e DB_HOST=your-db-host \
  -e DB_PASSWORD=secure-password \
  coding-interview:latest

# 4. Set up reverse proxy (nginx/caddy) for HTTPS
```

### 3. Docker Registry Push

**Push to Docker Hub:**
```bash
# Tag image
docker tag coding-interview:latest your-username/coding-interview:latest

# Login to Docker Hub
docker login

# Push image
docker push your-username/coding-interview:latest

# Pull and run on any server
docker pull your-username/coding-interview:latest
docker run -d -p 3001:3001 your-username/coding-interview:latest
```

## Troubleshooting

### Build Issues

**Problem: npm ci fails**
```bash
# Clear Docker cache and rebuild
docker build --no-cache -t coding-interview:latest .
```

**Problem: Vite build fails**
```bash
# Check client dependencies
cd client
npm install
npm run build

# If successful, rebuild Docker image
cd ..
docker build -t coding-interview:latest .
```

### Docker Compose Issues

**Problem: `KeyError: 'ContainerConfig'`**
This is a compatibility issue with older docker-compose versions (< 2.0).

**Solution 1: Upgrade docker-compose**
```bash
# Install docker-compose v2 (recommended)
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Use 'docker compose' instead of 'docker-compose'
docker compose up -d
```

**Solution 2: Use read-only volume mounts**
```yaml
volumes:
  - ./database/migrations:/docker-entrypoint-initdb.d:ro
```

**Solution 3: Change PostgreSQL port**
```yaml
ports:
  - "5433:5432"  # Avoid conflict with host PostgreSQL
```

### Runtime Issues

**Problem: Cannot connect to database**
```bash
# Check database connectivity
docker exec -it coding-interview-app ping postgres

# Check environment variables
docker exec coding-interview-app env | grep DB_

# View logs
docker logs coding-interview-app
```

**Problem: Port already in use**
```bash
# Use different port mapping
docker run -p 8080:3001 coding-interview:latest

# Or stop conflicting service
lsof -ti:3001 | xargs kill -9
```

**Problem: Static files not served**
```bash
# Check if dist directory exists in image
docker exec coding-interview-app ls -la /app/public

# Rebuild with verbose output
docker build --progress=plain -t coding-interview:latest .
```

### Container Management

```bash
# View running containers
docker ps

# Stop container
docker stop coding-interview-app

# Remove container
docker rm coding-interview-app

# View container resource usage
docker stats coding-interview-app

# Execute commands inside container
docker exec -it coding-interview-app sh

# Inspect container
docker inspect coding-interview-app
```

## Optimization

### Reduce Image Size

The image is already optimized with:
- ✅ Alpine Linux base (~5 MB vs Ubuntu ~70 MB)
- ✅ Multi-stage build (frontend builder discarded)
- ✅ Production-only dependencies in final image
- ✅ .dockerignore excludes unnecessary files

### Performance Tuning

**Health checks:**
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "require('http').get('http://localhost:3001/health')"
```

**Resource limits:**
```bash
docker run \
  --memory="512m" \
  --cpus="0.5" \
  coding-interview:latest
```

## Security Best Practices

1. **Use non-root user** (TODO):
```dockerfile
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs
```

2. **Scan for vulnerabilities:**
```bash
docker scan coding-interview:latest
```

3. **Use secrets for sensitive data:**
```bash
# Docker Swarm/Kubernetes secrets instead of env vars
docker secret create db_password ./password.txt
```

4. **Keep base image updated:**
```bash
# Regularly rebuild with latest alpine
docker build --pull -t coding-interview:latest .
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: docker build -t coding-interview:${{ github.sha }} .

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Push image
        run: |
          docker tag coding-interview:${{ github.sha }} username/coding-interview:latest
          docker push username/coding-interview:latest
```

## Summary

The Dockerized deployment provides:
- ✅ **Single image** containing frontend + backend
- ✅ **217 MB** optimized image size
- ✅ **Production-ready** with health checks
- ✅ **Easy deployment** to any cloud platform
- ✅ **Consistent environment** across dev/staging/prod
- ✅ **Zero external dependencies** (besides PostgreSQL)

Access the application at `http://localhost:3001` after running the container!
