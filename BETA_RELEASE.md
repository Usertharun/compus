# Compus launch changes

Student accounts require verified `@srmist.edu.in` email. The configured owner uses `/owner-login`. Approved permanent community mailboxes use `/community-login`; owner approval is required before external club registration.

The public-launch follow-up now includes complete collection pagination and server totals, organizer editing/lifecycle/cancellation/attendance, owner account administration, permanent club ownership, privacy/deletion requests, optional private R2 image storage, monitoring and recovery workflows, and global lint cleanup.

Both production builds, repository lint, 89 backend tests and ten HTTP/pagination/load-harness tests pass. Public club-login and privacy pages were checked in the browser without JavaScript errors. Previous beta database/browser evidence remains historical; it does not verify these new changes in production.

Read [LAUNCH_OPERATIONS.md](LAUNCH_OPERATIONS.md) for deployment order, storage setup, alert delivery checks, capacity testing and recovery evidence still required. This patch has not configured R2 credentials, deployed the policy, enabled production alert delivery or executed production load/restore drills.
