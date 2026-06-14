import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

/**
 * CacheService
 *
 * Thin wrapper around Redis for cache-aside pattern.
 * Used by MeetingsService to cache hot query paths.
 *
 * Key patterns:
 *   meetings:user:{userId}        → user's meeting list (TTL 30s)
 *   meeting:{meetingId}           → single meeting detail (TTL 60s)
 *   participants:{meetingId}      → participant list (TTL 15s)
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@InjectRedis() private readonly redis: Redis) {}

  /**
   * Get a cached value. Returns null on miss or error.
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (err) {
      this.logger.warn(`Cache GET error for key "${key}": ${err}`);
      return null;
    }
  }

  /**
   * Set a cache value with TTL in seconds.
   */
  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
      this.logger.warn(`Cache SET error for key "${key}": ${err}`);
    }
  }

  /**
   * Delete a specific key (used after mutations).
   */
  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (err) {
      this.logger.warn(`Cache DEL error for key "${key}": ${err}`);
    }
  }

  /**
   * Invalidate all keys matching a pattern.
   * Uses SCAN (non-blocking) instead of KEYS (blocking).
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      let cursor = '0';
      do {
        const [nextCursor, keys] = await this.redis.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          100,
        );
        cursor = nextCursor;
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } while (cursor !== '0');
    } catch (err) {
      this.logger.warn(`Cache invalidatePattern error for "${pattern}": ${err}`);
    }
  }
}
