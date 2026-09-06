# Multi-Stage Dockerfile for LibraHub Production Deployment
# -------------------------------------------------------------
# Stage 1: Build the React 19 Frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# -------------------------------------------------------------
# Stage 2: Production Node.js Server
FROM node:22-alpine AS production
WORKDIR /app

# Install production dependencies for backend
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --only=production

# Copy backend source code
COPY backend/ /app/backend/

# Copy built frontend assets from stage 1 into backend public directory
COPY --from=frontend-builder /app/frontend/dist /app/backend/public

# Create data directory for SQLite persistence
RUN mkdir -p /app/backend/data

# Environment configuration
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start production server
CMD ["node", "src/server.js"]
