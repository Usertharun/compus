import 'dotenv/config';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../src/database/prisma.service';
import { CloudinaryStorageService } from '../src/modules/uploads/cloudinary-storage.service';

// Uploads legacy database images to Cloudinary, verifies delivery, then removes database bytes.
// Run with: node -r ts-node/register -r tsconfig-paths/register scripts/migrate-images.ts
const prisma = new PrismaService();
const storage = new CloudinaryStorageService(new ConfigService());
async function main() {
  if (!storage.enabled) throw new Error('Configure Cloudinary credentials before migrating images');
  let migrated = 0;
  for (;;) {
    const assets = await prisma.imageAsset.findMany({ where: { secureUrl: null, content: { not: null } }, take: 25, orderBy: { id: 'asc' } });
    if (!assets.length) break;
    for (const asset of assets) {
      const bytes = Buffer.from(asset.content!);
      const secureUrl = await storage.upload(asset.id, bytes);
      const delivered = await fetch(secureUrl, { method: 'HEAD', redirect: 'error', signal: AbortSignal.timeout(15000) });
      if (!delivered.ok || !delivered.headers.get('content-type')?.startsWith('image/')) throw new Error('Cloudinary delivery verification failed');
      await prisma.imageAsset.updateMany({ where: { id: asset.id, secureUrl: null }, data: { secureUrl, content: null } });
      migrated++;
    }
    console.log(JSON.stringify({ migrated, databaseBytesRemovedAfterVerification: true }));
  }
}
void main().catch(() => { console.error('Migration failed; unverified database images were retained.'); process.exitCode = 1; }).finally(() => prisma.$disconnect());
