# Public launch rollout

## Current status

- [x] Feature implementation is complete in the working tree.
- [x] Database migrations, CI validation, health monitoring, load testing, restore drill and image-copy tools are included.
- [x] Local preflight passes: production builds, repository lint, 89 backend tests and ten HTTP/pagination/load-harness tests.
- [x] Public club-login and privacy pages pass browser checks without JavaScript errors.
- [ ] Production database snapshot and provider retention window recorded.
- [x] Changes reviewed, committed and deployed to backend and frontend.
- [x] Cloudinary credentials configured; new-image round trip and legacy-image migration verified (the production database contained zero legacy image rows).
- [ ] Production health secret, GitHub failure notifications and Sentry alert delivery verified.
- [ ] Staging load test and production-representative restore drill completed with evidence.
- [ ] Deployed student, owner and permanent-club flows verified with separate accounts.

Run `npm run launch:preflight` from the repository root before each release. It checks every local launch gate and reports only whether external variables are present; it never prints secret values. The unchecked items require access to the hosting, database, Cloudinary, GitHub and Sentry accounts and must be completed on the live environment.

## Production evidence — 2026-10-03

- Backend: `https://compus-production.up.railway.app`, deployed from `0192d89`; the migration baseline was repaired after a fresh ledger attempted to recreate the existing schema, all four additive migrations applied, and three post-recovery health checks returned 200 with the database up.
- Frontend: `https://compus-ashy.vercel.app`; the public privacy and permanent-community-login pages were verified in the deployed application.
- Cloudinary: signed upload, HTTPS delivery and cleanup passed with the production credentials. The production migration status reported zero legacy database images, so no byte rows required migration.
- Observability: Railway startup logs confirm Sentry initialized. The exact GitHub health-check script passes against recovered production. A successful manual GitHub run and Sentry notification delivery are still required.
- CI: the frontend and backend validation jobs passed, including migrations, 89 backend unit tests, the database-backed authentication lifecycle, persisted product-flow checks and the production container build.
- Recovery: the fixture backup/restore workflow passed on [run 37107818769](https://github.com/Usertharun/compus/actions/runs/37107818769). A production snapshot and provider-retention record remain required.
- Email: the rotated Brevo key was installed in Railway and validated through Brevo's read-only account endpoint without exposing the credential.

## Implemented in this change

Discovery, saved opportunities, saved posts, personal registrations and hosted events have pagination. Personal lists use their own endpoints and server totals. Organizers can edit events, change their lifecycle, cancel with notifications, and page through attendance. The owner can search/filter accounts, suspend/reactivate/delete them and revoke sessions.

The owner approves a permanent external club mailbox against an existing community in the owner panel. The club then verifies that mailbox at `/community-login`. Registration transfers community ownership to the permanent account. Each incoming team changes the account password; this revokes every existing session and requires a fresh sign-in. The club must also transfer control of its email mailbox each year. Existing student members retain their own accounts.

The public policy is served at `/privacy`. Deletion requests enter owner feedback as `DELETION_REQUEST`. Account deletion is currently a soft deletion, not permanent erasure. The policy discloses this; the owner must process requests and determine retention before promising an erasure deadline.

## Deployment order

1. Take a recoverable database snapshot and record the deployment revision. Verify the provider's actual restore retention window.
2. From `server`, run `npm ci`, `npm run prisma:deploy`, `npm run prisma:generate` and `npm run build`. The two new migrations add permanent community login registration and secure Cloudinary image URLs. Production containers also run `prisma migrate deploy` before starting the API so later additive migrations are not silently skipped.
3. Deploy backend, then frontend. Verify student, owner and approved-club login, personal pages beyond 50 records, event cancellation notifications, and attendance with separate accounts.
4. Confirm `/privacy` is publicly accessible on the deployed domain. Confirm the listed support address is monitored.

Record the deployed commit, snapshot timestamp, database retention window, backend URL, frontend URL and verification date in the release record. Do not mark the launch complete from a local build alone.

## Images: Cloudinary

Create a Cloudinary product environment and set backend-only `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`. Keep the API secret out of frontend settings and Git. New image uploads intentionally return a service-unavailable error when these credentials are absent; they never fall back to storing new image bytes in PostgreSQL.

[Cloudinary's Node SDK](https://cloudinary.com/documentation/node_image_and_video_upload) performs signed server-side uploads and returns a `secure_url`. Compus stores that HTTPS URL in `image_assets.secureUrl` and returns it to the frontend. Review the Cloudinary account's current usage and plan limits in its console before launch.

Uploads still require validated JPEG, PNG or WebP bytes up to 500,000 bytes after frontend resizing. The backend uploads the validated bytes directly to the `compus/images` Cloudinary folder. If the database write fails after upload, it attempts to remove the orphaned Cloudinary asset. New records contain metadata and the returned secure URL, with no image bytes. Existing `/uploads/images/:id` links continue working: migrated records redirect to Cloudinary and unmigrated records remain readable during rollout.

After confirming credentials and a successful new-image round trip, run `node -r ts-node/register -r tsconfig-paths/register scripts/migrate-images.ts` from `server`. It uploads each legacy database image using its stable asset ID, verifies that its secure URL serves an image, stores the URL and then clears that row's image bytes. The operation is resumable; any image that fails upload or delivery verification keeps its database bytes. Export or back up Cloudinary assets separately because a database backup contains URLs, not the migrated image data.

## Monitoring and alerts

Set GitHub Actions secret `COMPUS_HEALTH_URL` to the exact HTTPS `/api/v1/health` endpoint. Enable Actions and owner notifications for failed runs. `production-health.yml` checks every five minutes and fails on invalid/unhealthy responses or excessive latency. Verify delivery by running the workflow manually against a controlled failing staging endpoint. Scheduled Actions can be delayed and are not a strict availability SLA.

Set backend `SENTRY_DSN`, configure an error alert in the Sentry project, and send a staging test error. Server exceptions are captured with request/user/extra/breadcrumb data removed and exception values redacted. Do not declare alerts operational until receipt is verified. Review runtime logs for errors and latency during rollout.

## Capacity and recovery evidence

Run `server/scripts/load-test.cjs` with `TARGET_URL` (including `/api/v1`) and `LOAD_TEST_TOKEN` for an isolated staging student. Defaults are 200 requests per endpoint, concurrency 10, p95 at most 1,000 ms and error rate at most 1%. It writes `load-report.json` and exits unsuccessfully when thresholds fail. A 429 response counts as a failure. Production rate limits are intentionally active: use an isolated test deployment with a documented test-only rate-limit setting or enough separate test identities, never disable production throttling. Do not interpret a fixture benchmark as production capacity evidence.

The weekly/manual `restore-drill.yml` builds a fixture database, dumps/restores it and verifies every public table's row count and checksum. For a production-representative drill, follow [server/RECOVERY.md](server/RECOVERY.md), use an isolated frozen copy, and record elapsed time, recovery point, bucket recovery and application login/content checks. No production restore or load drill has been executed by this patch.

## Local verification

Both production builds, repository lint, 89 backend unit tests and ten HTTP/pagination/load-harness tests pass. Browser checks verified public club-login and privacy controls without JavaScript errors. Authenticated feature tests cover pagination beyond 50, organizer authorization, attendance restrictions, cancellation notifications, approved club registration, password-change session revocation and Cloudinary URL-only persistence. A deployed end-to-end pass remains required.
