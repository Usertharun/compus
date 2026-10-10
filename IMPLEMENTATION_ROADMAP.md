# Compus product implementation roadmap

This document converts the Campus Operating System plan into release-sized work. A phase advances only after its exit criteria pass in production. Product analytics excludes message and post content; it records only the completed action type, user, timestamp and relevant record identifier.

## Delivery status

| Phase | Status | Production exit criteria |
| --- | --- | --- |
| 0. Measurement foundation | In progress | Server-confirmed activation events, daily/weekly/monthly activity, onboarding conversion, retention cohorts and owner dashboard are deployed and collecting data. |
| 1. Reliability | Next | P95 reads below 2 seconds, writes below 3 seconds, at least 99% successful requests, tested 500-user load, alerts and rollback verified. |
| 2. Onboarding | Planned | 75% onboarding completion, 60% first-session activation and no empty first experience. |
| 3. Events and opportunities | Planned | Organizers can operate without external forms or attendance sheets; students can track registration and application status. |
| 4. People and projects | Planned | Students can form a project team, explain matches and control their availability. |
| 5. Feed and Action Center | Planned | Personalized feeds and one ordered action inbox connect all major product areas. |
| 6. Moderation and trust | Planned | Reports, appeals, verification, audit trails, ownership recovery and deletion/export workflows meet published policies. |
| 7. Revenue experiments | Planned | At least five customer interviews and two willing pilots validate a paid operational feature before billing is built. |

## Current release: measurement foundation

- Record account registration, onboarding completion and one authenticated active session per UTC day.
- Record community joins, event registrations, saved/applied opportunities, student follows, posts and messages after the operation succeeds.
- Keep analytics failures isolated so posting, messaging and other student actions continue normally.
- Show the owner total students, onboarding rate, daily/weekly/monthly activity, activation funnel, meaningful actions, 14-day trend and cohort-collection state.
- Add database indexes for time-window and per-user activity queries.
- Disclose first-party product measurement in the privacy page.
- Verify schema generation, builds, lint and automated tests before production deployment.

## Reliability work queue

1. Add request-duration summaries by route and status without storing request bodies.
2. Establish production baselines for feed, messages, events, opportunities and the action hub.
3. Optimize any route exceeding its latency budget using query plans, indexes and bounded responses.
4. Run staged 100-, 250- and 500-user load profiles against read and write journeys.
5. Verify alerts for API failure, database failure, elevated latency and error spikes.
6. Record rollback time and restore results in the release record.

## Decision rules

- Student safety, privacy, reliability and data portability remain free.
- New experiences ship behind existing feature flags when they change navigation or ranking.
- Recommendations must explain their source and allow students to hide or unfollow it.
- Revenue work begins only after retention and repeated organizer usage are measurable.
