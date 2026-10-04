CREATE INDEX "conversation_participants_userId_conversationId_idx"
ON "conversation_participants"("userId", "conversationId");

CREATE INDEX "messages_conversationId_createdAt_idx"
ON "messages"("conversationId", "createdAt");
