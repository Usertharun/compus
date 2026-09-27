import { ConfigService } from '@nestjs/config';
import { RedisOptions } from 'ioredis';

export function redisConnection(config: ConfigService): RedisOptions {
  const value = config.get<string>('REDIS_URL');
  if (value) {
    const url = new URL(value);
    if (!['redis:', 'rediss:'].includes(url.protocol)) throw new Error('REDIS_URL must use redis:// or rediss://');
    return {
      host: url.hostname, port: Number(url.port || 6379),
      username: url.username ? decodeURIComponent(url.username) : undefined,
      password: url.password ? decodeURIComponent(url.password) : undefined,
      db: url.pathname.length > 1 ? Number(url.pathname.slice(1)) : 0,
      ...(url.protocol === 'rediss:' ? { tls: {} } : {}),
    };
  }
  return { host: config.get<string>('REDIS_HOST', 'localhost'), port: config.get<number>('REDIS_PORT', 6379), password: config.get<string>('REDIS_PASSWORD') || undefined };
}
