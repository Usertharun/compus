# Recovery and incident response

## Recovery readiness

Record the actual database provider restore window, latest recoverable timestamp, backup location and responsible owner. Do not assume the free plan provides a particular retention window. Keep a protected offsite logical backup according to the agreed retention policy; restrict access because it contains personal data. Cloudinary image assets require their own recovery/export plan because PostgreSQL stores only their secure URLs after migration.

Run the weekly/manual `restore-drill.yml` to verify dump/restore tooling against a fixture. This is not a production recovery test.

For a representative drill, create a frozen isolated copy of production and an empty database whose name ends `_restore_drill`. Use a PostgreSQL client version compatible with the source server. Set `BACKUP_DATABASE_URL` to the frozen source and `RESTORE_DATABASE_URL` to the isolated target, then run `node scripts/restore-drill.cjs` from `server`. The script refuses the same source/target and nonempty targets, restores without deleting existing tables, compares every public table's row counts/checksums, prints elapsed time and removes its temporary dump. Do not use an actively changing source: its rows can differ from the dump snapshot.

Afterward start a staging backend against the restored database. Verify separate-account login, feed, community ownership, registrations/waitlist, saved opportunities, chat history and image reads. Test bucket restoration separately. Record recovery point and total recovery time, including application checks. Remove the isolated copy through your provider after recording evidence.

## Incident recovery

Capture the incident time and affected deployment revision. Stop writes if corruption is suspected. Restore into a separate database/branch using the provider's verified recovery controls or protected dump; validate it before switching connections. Avoid restoring destructively over production. Restore required image objects and reapply deletion requests made after the recovery point. Revoke restored sessions when appropriate before reopening access.

Change backend database settings only after the restored instance passes checks, restart the backend and verify health plus real product flows. Record downtime and data loss. Keep the original instance available for investigation according to retention/access rules.

For Redis or queue incidents, inspect affected keys and failed jobs first. Do not flush all Redis data or queues: that can remove revocations and pending work. Use a targeted recovery procedure for the affected subsystem.

## Alert response

Health failure: check runtime logs, database and Redis connectivity, deployment changes, and capacity. Sentry error: use the redacted event and internal logs to isolate the failing operation. Verify recovery through health and a product flow; acknowledge the alert and document cause/action. Alert receipt must be tested before launch.
