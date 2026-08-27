# Stage 1: Build & Dependencies
FROM node:20-slim AS builder

# Install system build dependencies required for native node modules (argon2, bcrypt, node-gyp) & Prisma
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency definitions and Prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Clean install dependencies including devDependencies
RUN npm ci

# Copy source files
COPY . .

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
