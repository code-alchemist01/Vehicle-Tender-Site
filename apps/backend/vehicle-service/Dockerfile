# Multi-stage build for Vehicle Service
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY apps/backend/vehicle-service/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder

# Install OpenSSL for Prisma and PostgreSQL client
RUN apk add --no-cache openssl postgresql-client

WORKDIR /app

# Copy package files and install all dependencies (including dev)
COPY apps/backend/vehicle-service/package*.json ./
RUN npm ci --include=dev

# Copy source code
COPY apps/backend/vehicle-service/ .

# Generate Prisma client for Alpine Linux
ENV PRISMA_CLI_BINARY_TARGETS="linux-musl-openssl-3.0.x"
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner

# Install OpenSSL for Prisma and PostgreSQL client
RUN apk add --no-cache openssl postgresql-client

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

# Copy entrypoint script
COPY apps/backend/vehicle-service/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

USER nestjs

EXPOSE 4002

ENV PORT=4002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4002/api/v1/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

CMD ["./entrypoint.sh"]