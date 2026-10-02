CREATE TABLE "feedback" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "category" TEXT NOT NULL, "message" TEXT NOT NULL, "page" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "feedback_pkey" PRIMARY KEY ("id"));
CREATE INDEX "feedback_createdAt_idx" ON "feedback"("createdAt");
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
