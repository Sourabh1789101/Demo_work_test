# ---------------------------------------------------------------------------
# Stage 1: Builder — compiles TypeScript to JavaScript
# ---------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy manifests first for better layer caching
COPY package*.json ./
RUN npm ci --ignore-scripts

# Copy source and compile
COPY tsconfig.json ./
COPY src ./src
RUN npm run build && \
    # Copy static data files into dist so they're available at runtime
    cp -r src/data dist/data 2>/dev/null || true

# Prune devDependencies so we only ship production packages
RUN npm prune --production

# ---------------------------------------------------------------------------
# Stage 2: Runtime — minimal production image
# ---------------------------------------------------------------------------
FROM node:20-alpine AS runtime

ENV NODE_ENV=production

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy compiled output and production node_modules from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Switch to non-root user
USER appuser

EXPOSE 4000

# Health check using built-in fetch (Node 18+)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://localhost:4000/health').then(r=>r.ok?process.exit(0):process.exit(1)).catch(()=>process.exit(1))"

CMD ["node", "dist/app.js"]
