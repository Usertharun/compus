CREATE TABLE "image_assets" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "content" BYTEA NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "image_assets_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "image_assets_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "image_assets_ownerId_idx" ON "image_assets"("ownerId");
ALTER TABLE "profiles" ADD COLUMN "allowDirectMessages" BOOLEAN NOT NULL DEFAULT true, ADD COLUMN "showLocation" BOOLEAN NOT NULL DEFAULT true;
