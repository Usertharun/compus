import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { CloudinaryStorageService } from '../src/modules/uploads/cloudinary-storage.service';

const storage = new CloudinaryStorageService(new ConfigService());
const id = `smoke-${randomUUID()}`;
const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');

async function main() {
  if (!storage.enabled) throw new Error('Cloudinary credentials are missing');
  try {
    const secureUrl = await storage.upload(id, image);
    const response = await fetch(secureUrl, { method: 'HEAD', redirect: 'error', signal: AbortSignal.timeout(15000) });
    if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error('Cloudinary delivery verification failed');
    console.log(JSON.stringify({ passed: true, secureHttps: secureUrl.startsWith('https://'), deliveredAsImage: true }));
  } finally {
    await storage.destroy(id);
  }
}

void main().catch(() => { console.error('Cloudinary smoke test failed; credentials were not printed.'); process.exitCode = 1; });
