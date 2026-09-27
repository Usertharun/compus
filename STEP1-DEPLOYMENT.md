# Step 1: deployment and authentication

## Implemented

- Vercel SPA routing; protected routes wait for a validated server session.
- Exact @srmist.edu.in account restriction (including restored sessions), six-digit email verification, real registration, resend, sign-in, session restoration and one shared refresh for concurrent requests.
- Server-backed onboarding saves the profile, selected goals and completion flag in one transaction.
- Server-side logout revokes all sessions; password reset revokes access and refresh tokens.
- Session tokens are kept in sessionStorage for this tab, not the old persistent localStorage flag. Closing the tab ends normal persistence. This is a bearer-token design, not an HttpOnly-cookie design.
- Account-specific prototype caches are separated. Other product modules remain prototypes and are outside Step 1.
- SMTP failures never expose OTPs in logs or claim that an email was sent.
- Initial Prisma migration and CI with a dedicated Postgres/Redis authentication lifecycle test.

## Required before deploying

1. Rotate the database credentials and JWT secrets previously committed to Git. The local server/.env file remains on disk, but is removed from tracking. Removing it from future commits does not erase old Git history. Do not paste credentials into chat or commit them.
2. Use the existing Railway backend service. No Railway/Vercel credentials or CLI connection were available during implementation; its public domain and deployment still need recovery in the service dashboard.
3. Set Railway environment variables from server/.env.example. Production requires NODE_ENV=production, pooled DATABASE_URL, direct DATABASE_URL_UNPOOLED, two different random JWT secrets (32+ characters), APP_URL=https://compus-ashy.vercel.app and CORS_ORIGINS=https://compus-ashy.vercel.app. Add specific preview origins deliberately if needed.
4. Connect Redis with REDIS_URL (redis:// or rediss://) or REDIS_HOST/REDIS_PORT/REDIS_PASSWORD. Authentication revocation uses database sessions, but queues and other modules still use Redis.
5. Initial beta email provider: Gmail SMTP, because no sender domain is owned yet. Use a dedicated Google account with 2-Step Verification and an app password. Set SMTP_HOST=smtp.gmail.com, SMTP_PORT=465, SMTP_USER to that Gmail address, SMTP_PASS privately to the app password, and SMTP_FROM to the same address with display name Compus. Do not use your normal Google password or impersonate an SRM sender. The recipient restriction remains exactly @srmist.edu.in. Signup/recovery stay unavailable until configured. Google account/organization policy may disable app passwords; if unavailable, use an OAuth-capable sender or verify a domain with a transactional provider instead. Verify delivery to a real SRM inbox before opening signup. This is a small-beta setup subject to Gmail sending limits, not a bulk mail service. The existing SMTP abstraction can later use Resend with a verified domain. See https://support.google.com/mail/answer/185833 and https://support.google.com/a/answer/176600.
6. Resolve database migration history BEFORE enabling the new migration start command (see below).
7. Deploy the backend from the repository root using its Dockerfile and railway.json, or from server using its matching files. The Prisma CLI is now a runtime dependency because startup runs migrate deploy before the server starts.
8. Confirm GET /api/v1/health succeeds, and verify the browser's Vercel origin is permitted by CORS.
9. Set Vercel VITE_API_BASE_URL to the working backend URL ending in /api/v1, then rebuild/redeploy the frontend. There is no production fallback to the old broken hostname. Local .env still contains your previous configured URL and must be adjusted explicitly for local testing.
10. Verify direct navigation and refresh at /login, /onboarding, /campus, /forgot-password and /reset-password.

## Existing database: baseline safely

The initial migration was generated offline from the current Prisma 6 schema. It has NOT been applied to the existing database. It does not prove the existing database matches the schema.

For an empty staging database, run `npm --prefix server run prisma:deploy`.

For a populated database created previously with db push, first test on an isolated branch/copy and compare its schema to server/prisma/schema.prisma. Resolve any drift and confirm backups. Only if the schema matches, run from server:

```
npx prisma migrate resolve --applied 20260927000000_initial
npx prisma migrate deploy
```

Never run the initial CREATE TABLE migration against existing tables or use migrate reset on production. These commands must use the direct database connection. The deployment start command intentionally fails instead of silently guessing a baseline.

References: [Prisma baselining](https://www.prisma.io/docs/orm/prisma-migrate/workflows/baselining), [Vite routing on Vercel](https://vercel.com/docs/frameworks/frontend/vite).

## Verification

Run `npm test`, `npm run build`, `npm --prefix server test -- --runInBand`, and `npm --prefix server run build`.

The CI end-to-end test requires NODE_ENV=test and a dedicated database named compus_test, with both Prisma database URLs set and Redis running. It captures email in a test double, creates one uniquely named test account, exercises signup/onboarding/refresh/logout/reset through HTTP and deletes only its own account. It never uses the production database or sends real email. CI also provisions that database from the migration.

Release acceptance still requires real SMTP delivery, backend health/CORS and two-browser manual testing on the deployed versions. Do not label Step 1 deployed or complete until those checks pass. Step 2 privacy/authorization findings remain release blockers for a public beta.
