import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    // Redis connection initialization - connecting to Redis server
    const redisUrl =
      this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';

    // Check if Redis should be disabled for testing
    const disableRedis = this.configService.get<string>('DISABLE_REDIS') === 'true';

    if (disableRedis) {
      console.log('⚠️ Redis disabled via DISABLE_REDIS environment variable');
      return;
    }

    this.client = new Redis(redisUrl, {
      enableReadyCheck: false,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      connectTimeout: 10000,
      commandTimeout: 5000,
    });

    this.client.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    this.client.on('error', (error) => {
      console.error('❌ Redis connection error:', error);
    });

    // Attempt to connect with lazy loading
    try {
      await this.client.connect();
    } catch (error) {
      console.warn('⚠️ Redis connection failed, will retry automatically:', error.message);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      console.log('❌ Redis disconnected');
    }
  }

  getClient(): Redis {
    return this.client;
  }

  // Common cache operations
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setex(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async deleteKey(key: string): Promise<void> {
    try {
      if (!this.isRedisAvailable()) {
        console.warn('Redis not available, skipping key deletion');
        return;
      }
      await this.client.del(key);
    } catch (error) {
      console.error('Failed to delete key from Redis:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  private isRedisAvailable(): boolean {
    return this.client && this.client.status === 'ready';
  }

  // Session operations
  async setSession(
    sessionId: string,
    data: object,
    ttl: number = 3600,
  ): Promise<void> {
    try {
      if (!this.isRedisAvailable()) {
        console.warn('Redis not available, skipping session storage');
        return;
      }
      const sessionKey = `session:${sessionId}`;
      await this.client.setex(sessionKey, ttl, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to set session in Redis:', error);
    }
  }

  async getSession(sessionId: string): Promise<object | null> {
    try {
      if (!this.isRedisAvailable()) {
        console.warn('Redis not available, returning null for session');
        return null;
      }
      const sessionKey = `session:${sessionId}`;
      const data = await this.client.get(sessionKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get session from Redis:', error);
      return null;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      if (!this.isRedisAvailable()) {
        console.warn('Redis not available, skipping session deletion');
        return;
      }
      const sessionKey = `session:${sessionId}`;
      await this.client.del(sessionKey);
    } catch (error) {
      console.error('Failed to delete session from Redis:', error);
    }
  }

  // Cache for frequently accessed data
  async cachePatients(patients: any[], ttl: number = 300): Promise<void> {
    await this.client.setex('cache:patients', ttl, JSON.stringify(patients));
  }

  async getCachedPatients(): Promise<any[] | null> {
    const data = await this.client.get('cache:patients');
    return data ? JSON.parse(data) : null;
  }

  async cacheDoctors(doctors: any[], ttl: number = 300): Promise<void> {
    await this.client.setex('cache:doctors', ttl, JSON.stringify(doctors));
  }

  async getCachedDoctors(): Promise<any[] | null> {
    const data = await this.client.get('cache:doctors');
    return data ? JSON.parse(data) : null;
  }

  // Rate limiting operations
  async incrementRateLimit(key: string, ttl: number): Promise<number> {
    const multi = this.client.multi();
    multi.incr(key);
    multi.expire(key, ttl);
    const results = await multi.exec();
    return results[0][1] as number;
  }

  // Health check operations
  async ping(): Promise<string> {
    return this.client.ping();
  }

  async getInfo(): Promise<string> {
    return this.client.info();
  }
}
