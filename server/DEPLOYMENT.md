# Compus deployment

Frontend: Vercel React/Vite. Backend: Railway NestJS. Database: Neon PostgreSQL. Redis: configured deployment service. Images: Cloudinary.

Use `server/.env.example` as the configuration reference. The access-token secret is `JWT_SECRET`; configure a separate `JWT_REFRESH_SECRET`. Supply the pooled `DATABASE_URL` and direct `DATABASE_URL_UNPOOLED`, Redis, CORS origin, owner mailbox, SMTP delivery and optional `SENTRY_DSN`. Keep server secrets out of frontend variables.

Before deploying, take a verified recoverable database snapshot. From `server`, run `npm ci`, `npm run prisma:deploy`, `npm run prisma:generate` and `npm run build`. Deploy backend before frontend. Verify `/api/v1/health` and authentication. Frontend requires `VITE_API_BASE_URL` with the `/api/v1` prefix and the configured websocket URL.

The new migrations add `COMMUNITY_ACCOUNT`, owner-approved community mailboxes and secure Cloudinary image URLs. Add backend-only `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` before deploying; image uploads intentionally fail when storage is not configured. The migration script uploads each legacy database image, verifies HTTPS delivery and removes its database bytes only after verification.

Follow [../LAUNCH_OPERATIONS.md](../LAUNCH_OPERATIONS.md) for exact storage, monitoring, policy and launch validation steps. Configuration existing in code does not establish that a production service or alert is active.
