import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { AppLoggerService } from '@logger/logger.service';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLoggerService,
  ) {}

  onModuleInit(): void {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    const password = this.configService.get<string>('REDIS_PASSWORD');

    this.client = new Redis({
      host,
      port,
      password: password || undefined,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    });

    this.client.on('connect', () => {
      this.logger.log('✅ Connected to Redis cluster successfully', 'RedisService');
    });

    this.client.on('error', (err) => {
      this.logger.error(`❌ Redis Client Error: ${err.message}`, err.stack, 'RedisService');
    });

    this.client.connect().catch((err) => {
      this.logger.warn(`⚠️ Initial Redis connection deferred: ${err.message}`, 'RedisService');
    });
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.quit();
    }
  }

  getClient(): Redis {
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<'OK'> {
    if (ttlSeconds) {
      return this.client.set(key, value, 'EX', ttlSeconds);
    }
    return this.client.set(key, value);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async exists(key: string): Promise<number> {
    return this.client.exists(key);
  }

  async blacklistToken(tokenHash: string, ttlSeconds: number): Promise<void> {
    await this.set(`blacklist:${tokenHash}`, 'revoked', ttlSeconds);
  }

  async isTokenBlacklisted(tokenHash: string): Promise<boolean> {
    const status = await this.get(`blacklist:${tokenHash}`);
    return status === 'revoked';
  }
}
