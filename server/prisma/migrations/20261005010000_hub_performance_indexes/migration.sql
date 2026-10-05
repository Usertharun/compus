CREATE INDEX IF NOT EXISTS "events_status_start_time_idx"
  ON "events"("status", "startTime");

CREATE INDEX IF NOT EXISTS "event_rsvps_user_status_created_idx"
  ON "event_rsvps"("userId", "status", "createdAt");

CREATE INDEX IF NOT EXISTS "opportunities_status_deadline_idx"
  ON "opportunities"("status", "deadline");

CREATE INDEX IF NOT EXISTS "opportunity_applications_user_status_applied_idx"
  ON "opportunity_applications"("userId", "status", "appliedAt");

CREATE INDEX IF NOT EXISTS "notifications_user_unread_created_idx"
  ON "notifications"("userId", "isRead", "isArchived", "createdAt");

CREATE INDEX IF NOT EXISTS "bookmarks_user_type_created_idx"
  ON "bookmarks"("userId", "targetType", "createdAt");
