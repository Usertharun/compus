# Compus Enterprise Production Deployment Guide

This document provides step-by-step instructions for deploying the **Compus** platform across the target infrastructure stack:
- **Backend Application**: Railway (NestJS Production Runtime)
- **Database**: Neon Serverless PostgreSQL
- **Caching & Queues**: Redis (Upstash / Railway Redis)
- **Object Storage**: Supabase Storage
- **Frontend App**: Vercel (React + Vite + TypeScript)

---

## 1. Database Provisioning (Neon PostgreSQL)

1. Create a PostgreSQL project on [Neon.tech](https://neon.tech).
2. Obtain the pooled connection string:
   ```env
   DATABASE_URL="postgresql://user:password@ep-compus-poolerer.neon.tech/compus?sslmode=require"
   ```
3. Run Prisma database migrations from local CLI:
   ```bash
   npx prisma migrate deploy
   ```

---

## 2. Storage Bucket Provisioning (Supabase Storage)

1. Access your [Supabase Dashboard](https://supabase.com).
2. Create a public bucket named `compus-media`.
3. Set Storage Policy to allow read access for public objects and restricted write access for verified API keys.
4. Copy `SUPABASE_URL` and `SUPABASE_KEY` for backend environment configuration.

---

## 3. NestJS Backend Deployment (Railway)

1. Log in to [Railway.app](https://railway.app) and create a new project connected to your GitHub repository (`/server` directory).
2. Set the Environment Variables in Railway Service Settings:
   ```env
   NODE_ENV=production
   PORT=4000
   DATABASE_URL=postgresql://user:password@ep-compus.neon.tech/compus?sslmode=require
   REDIS_HOST=your-redis-host.railway.app
   REDIS_PORT=6379
   JWT_ACCESS_SECRET=your-32-char-access-secret-key
   JWT_REFRESH_SECRET=your-32-char-refresh-secret-key
   SUPABASE_URL=https://xyz.supabase.co
   SUPABASE_KEY=your-supabase-key
   SENTRY_DSN=https://your-sentry-dsn.ingest.sentry.io/12345
   ```
3. Deployment will build using the multi-stage `Dockerfile`.
4. Railway will expose a public domain (e.g. `https://compus-api.up.railway.app`).
5. Verify health at `https://compus-api.up.railway.app/api/v1/health`.

---

## 4. Frontend Web App Deployment (Vercel)

1. Connect your frontend project root directory (`d:\compus`) to [Vercel](https://vercel.com).
2. Configure Vercel Project Environment Variables:
   ```env
   VITE_API_BASE_URL=https://compus-api.up.railway.app/api/v1
   VITE_WS_URL=https://compus-api.up.railway.app/ws/messaging
   ```
3. Vercel will automatically build and issue an SSL certificate for your frontend production URL.

---

## 5. Security Checklist & Monitoring
- [x] HTTPS enforced across Vercel and Railway domains.
- [x] CORS restricted to official Vercel domain.
- [x] Rate Limiting active (`ThrottlerGuard` 100 requests/minute).
- [x] Socket.IO JWT authentication active on `/ws/messaging`.
- [x] Pino structured logger active.
- [x] Sentry error tracking active.
