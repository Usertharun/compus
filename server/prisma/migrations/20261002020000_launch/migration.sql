ALTER TYPE "UserRole" ADD VALUE 'COMMUNITY_ACCOUNT';
CREATE TABLE "community_logins" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "communityId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "community_logins_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "community_logins_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "communities"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "community_logins_email_key" ON "community_logins"("email");
CREATE UNIQUE INDEX "community_logins_communityId_key" ON "community_logins"("communityId");
