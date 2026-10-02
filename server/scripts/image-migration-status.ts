import 'dotenv/config';
import { PrismaService } from '../src/database/prisma.service';

const prisma = new PrismaService();

async function main() {
  const [legacy, cloudinary] = await Promise.all([
    prisma.$queryRaw<Array<{ count: bigint; bytes: bigint }>>`SELECT count(*)::bigint AS count, coalesce(sum(octet_length("content")), 0)::bigint AS bytes FROM "image_assets" WHERE "content" IS NOT NULL`,
    prisma.imageAsset.count({ where: { secureUrl: { not: null } } }),
  ]);
  console.log(JSON.stringify({ legacyCount: Number(legacy[0].count), legacyBytes: Number(legacy[0].bytes), cloudinaryCount: cloudinary }));
}

void main().catch(() => { console.error('Unable to read image migration status.'); process.exitCode = 1; }).finally(() => prisma.$disconnect());
