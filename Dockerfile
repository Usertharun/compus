# Stage 1: Build & Dependencies
FROM node:20-slim AS builder

# Force node-gyp & npm to use python3
ENV PYTHON=/usr/bin/python3

# Install system build dependencies required for native node modules (argon2, bcrypt, node-gyp) & Prisma
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    python-is-python3 \
    pkg-config \
    openssl \
    ca-certificates \
    && ln -sf /usr/bin/python3 /usr/bin/python \
    && rm -rf /var/lib/apt/lists/*

# Configure npm python path for node-gyp
RUN npm config set python /usr/bin/python3

WORKDIR /app

# Copy dependency definitions and Prisma schema from server directory
COPY server/package*.json ./
COPY server/prisma ./prisma/

# Clean install backend dependencies
RUN npm ci

# Copy full backend source files
COPY server/ ./

# Generate Prisma Client and compile NestJS application
RUN npx prisma generate
RUN npm run build

# Prune devDependencies to keep production bundle lean
RUN npm prune --production

# Stage 2: Production Minimal Runtime
FROM node:20-slim AS runner

# Install runtime dependencies (OpenSSL & CA certificates for Neon PostgreSQL SSL)
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production

# Copy built artifacts and production node_modules from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Expose server port (Railway dynamically injects PORT)
EXPOSE 3000

# Start production server
CMD ["node", "dist/src/main"]
