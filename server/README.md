# Compus Enterprise Production Backend

Compus is a modern, high-performance campus communication platform backend built using NestJS, Prisma 6, PostgreSQL, Redis, Socket.IO, BullMQ, and Pino Logger.

---

## 🚀 Completed Production Architecture & Modules

1. **Phase 1: Foundation Architecture**: Enterprise NestJS setup with Pino Logging, Global Exception Filters, Swagger at `/api/docs`, Docker, BullMQ, Redis, and Health checks.
2. **Phase 2: Auth & PBAC Authorization**: Argon2id hashing, OTP email verification, 2-role account model (`SUPER_ADMIN`, `VERIFIED_USER`), PBAC granular permissions (`user_permissions`), and device session tracking.
3. **Phase 3: Student Profile & Social Graph**: Campus identity with `@username` routing, skills, interests, projects, achievements, follower social graph, and profile view analytics.
4. **Phase 4: Campus Feed Engine**: LinkedIn/Twitter-style feed supporting text, images, videos, PDF documents, post categories, cursor-based pagination streams (`Home`, `Latest`, `Trending`, `Following`, `UserPosts`), Likes, Comments with nested replies, Bookmarks, Hashtags, `@username` mentions, and moderation reporting.
5. **Phase 5: Campus Communities & Clubs**: Organizations with unique `@slug`, categories, join policies (`OPEN`, `APPROVAL_REQUIRED`, `INVITE_ONLY`), join request queues, local roles (`OWNER`, `MODERATOR`, `MEMBER`), role promotion/demotion, ownership transfer, and community feeds.
6. **Phase 6: Event Management System**: Campus events with categories (`Workshop`, `Hackathon`, etc.), venue/room/meetingUrl, start/end dates, registration deadlines, capacity limits with automatic waitlist assignment (`WAITLISTED` -> auto-promotion to `GOING` on cancellation), validated lifecycle state machine (`DRAFT` -> `PUBLISHED` -> `REGISTRATION_OPEN` -> `REGISTRATION_CLOSED` -> `ONGOING` -> `COMPLETED` / `CANCELLED`), status history audit logging (`EventStatusHistory`), event comments, and bookmarks.
7. **Phase 7: Opportunities Hub**: Career & academic hub for Internships, Hackathons, Scholarships, and Competitions, with organization metadata, personal pipeline tracking (`INTERESTED`, `APPLIED`, `COMPLETED`), expiring-soon streams, comments, and bookmarks.
8. **Phase 8: Real-Time Messaging System**: Socket.IO gateway (`/ws/messaging`) with JWT connection handshake, room management, 1-to-1 direct chats, group chats (`COMMUNITY`, `EVENT`, `GROUP`), cursor-based message history, typing indicators, emoji reactions, read receipts, and online status.
9. **Phase 9: Centralized Event-Driven Notification System**: `EventEmitter2` event bus publishing, per-user notification preferences (`NotificationPreference`), priority levels, smart notification grouping, live Socket.IO alerts (`user_notification:<userId>`), and unread badges.
10. **Phase 10: Global Search & Discovery Engine**: Strategy-pattern search abstraction (`ISearchProvider`), PostgreSQL parallel multi-domain search (Profiles, Posts, Communities, Events, Opportunities, User Direct Messages, Hashtags, Organizations), instant autocomplete, trending keywords (`TrendingSearch`), search history, and recommendation feeds.
11. **Phase 11: Platform Administration & Moderation**: Isolated administrative platform for `SUPER_ADMIN` with real-time dashboard metrics, user suspension/reactivation, content moderation queues (`PostReport` review & resolution), System Settings key-value storage (`SystemSetting`), Feature Flag toggling (`FeatureFlag`), Global System Announcements (`SystemAnnouncement`), and immutable audit logging (`AuditLog`).
12. **Phase 12: Production Readiness & Infrastructure**: Multi-stage `Dockerfile`, `docker-compose.yml`, GitHub Actions CI/CD (`.github/workflows/ci.yml`), load testing script (`test/load-test.js`), `DEPLOYMENT.md`, and `RECOVERY.md`.

---

## 🛠️ Quickstart Commands

```bash
# Install dependencies
npm ci

# Generate Prisma Client
npx prisma generate

# Run in Development Mode
npm run start:dev

# Run Linter
npm run lint

# Build for Production
npm run build

# Run Unit & Integration Test Suite (12 test suites, 34 tests)
npm run test
```
