# Compus launch changes

Student accounts require verified `@srmist.edu.in` email. The configured owner uses `/owner-login`. Approved permanent community mailboxes use `/community-login`; owner approval is required before external club registration.

The public-launch follow-up now includes complete collection pagination and server totals, organizer editing/lifecycle/cancellation/attendance, owner account administration, permanent club ownership, privacy/deletion requests, Cloudinary image storage, monitoring and recovery workflows, and global lint cleanup. Later work adds club-page accounts and themes, messaging/feed performance improvements, and an optimized My Campus home hub.

As of 2026-10-10, both production builds, repository lint, 95 backend tests and ten HTTP/pagination/load-harness tests pass for the release-metadata change based on `281ac37`. Vercel reports the production frontend READY at `281ac37`, and the public root and privacy routes return HTTP 200. The Railway health endpoint is healthy but does not yet expose a revision, so the later backend changes and migrations are not fully verified.

Read [LAUNCH_OPERATIONS.md](LAUNCH_OPERATIONS.md) for deployment order, the recorded Cloudinary setup, alert delivery checks, capacity testing and recovery evidence still required. Backend revision confirmation, deployed multi-account verification, production alert delivery and production-representative load/restore drills remain open.
