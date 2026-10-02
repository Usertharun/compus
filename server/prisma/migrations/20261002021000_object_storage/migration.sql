ALTER TABLE "image_assets" ALTER COLUMN "content" DROP NOT NULL;
ALTER TABLE "image_assets" ADD COLUMN "secureUrl" TEXT;
CREATE UNIQUE INDEX "image_assets_secureUrl_key" ON "image_assets"("secureUrl");
