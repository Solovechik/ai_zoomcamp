# Multi-stage Dockerfile for Habit Tracker

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/client

# Copy frontend package files
COPY client/package*.json ./

# Install ALL dependencies (including devDependencies like vite) for build
RUN npm ci

# Copy frontend source
COPY client/ ./

# Build frontend for production
RUN npm run build

# Stage 2: Build Backend and Final Image
FROM node:20-alpine

WORKDIR /app

# Install production dependencies for backend
COPY server/package*.json ./
RUN npm ci --only=production

# Copy backend source
COPY server/ ./

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/client/dist ./public

# Expose port
EXPOSE 3001

# Set environment to production
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "server.js"]
