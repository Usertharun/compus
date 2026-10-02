# Compus beta release

Student accounts require verified `@srmist.edu.in` email addresses. The configured owner email is `tharunrajr2007@gmail.com`; the owner must register at `/owner-login` and verify the emailed code before receiving administrator access. Other external email addresses are rejected. Owner tools are at `/admin`.

## Working product flows

- Persistent campus posts, categories/search, likes, comments, bookmarks, reports and owner deletion.
- Real community creation, memberships, approval requests, community posts and owner management.
- Event creation/publication, registration, cancellation and capacity-based waitlists.
- Opportunity publishing, saving, applications and creator review of applicants.
- Direct messaging with persistent history, image attachments, unread counts and read receipts.
- Profile editing, images, skills, projects, privacy preferences and password changes.
- Tester feedback stored in the database and available to the owner, alongside content reports.
- Loading, failure/retry and empty states, accessible creation dialogs and mobile layouts.

Original seed accounts and their matching sample content were archived without deleting real student data. Production seeding now creates system permissions only.

## Verification

Both production builds passed. 75 backend tests and six HTTP/session tests passed. Real-database checks passed for posts, community approvals, simultaneous event registration, waitlist promotion, applications, privacy, uploads, feedback and simultaneous direct-chat creation. Temporary test records were cleaned up.

Production browser checks covered two separate students, desktop/mobile login and navigation, publishing a post, saving another student's post, community creation, feedback submission and message delivery. A clean browser session reported no JavaScript errors; error-level backend log inspection returned no errors at the time of verification. Student access to owner feedback and moderation endpoints was denied.

## Follow-up work before a broad public launch

- Add complete pagination to discovery, saved opportunities and personal event registrations. Several initial dashboard lists currently load the first 50 records, so dashboard totals describe that loaded set.
- Add organizer editing/cancellation and attendance management to event UI, and full student-account administration to owner UI.
- Add production monitoring/alerts, load tests, backup/restore drills and a published privacy/deletion policy.
- Move image bytes to managed object storage as usage grows; current uploads persist in Postgres with image validation and a 500 KB limit after resizing.
- Complete the remaining repository lint cleanup. Builds and automated tests pass, but the existing global lint command also scans generated backend files and still reports legacy and hook-style findings.

This release is a functional beta for initial student testing and feedback. It does not claim that all requirements for a large public launch are complete.
