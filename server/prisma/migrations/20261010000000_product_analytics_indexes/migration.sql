CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs"("createdAt");
CREATE INDEX "activity_logs_user_created_idx" ON "activity_logs"("userId", "createdAt");
CREATE INDEX "activity_logs_event_created_idx" ON "activity_logs"("eventType", "createdAt");
