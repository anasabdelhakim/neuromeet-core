import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter } from 'events';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private cache = new Map<string, CacheEntry<unknown>>();
  public readonly events = new EventEmitter();

  /**
   * Get a cached value. Returns null on miss or expiration.
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const entry = this.cache.get(key);
      if (!entry) return null;

      // Check if expired
      if (Date.now() > entry.expiresAt) {
        this.cache.delete(key);
        return null;
      }

      return entry.value as T;
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
      const expiresAt = Date.now() + ttlSeconds * 1000;
      this.cache.set(key, { value, expiresAt });
    } catch (err) {
      this.logger.warn(`Cache SET error for key "${key}": ${err}`);
    }
  }

  /**
   * Delete a specific key.
   */
  async del(key: string): Promise<void> {
    try {
      this.cache.delete(key);
    } catch (err) {
      this.logger.warn(`Cache DEL error for key "${key}": ${err}`);
    }
  }

  /**
   * Invalidate all keys matching a pattern.
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      // Convert redis match pattern (e.g. 'meetings:*') to a regex
      const regexPattern = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      
      for (const key of this.cache.keys()) {
        if (regexPattern.test(key)) {
          this.cache.delete(key);
        }
      }
    } catch (err) {
      this.logger.warn(`Cache invalidatePattern error for "${pattern}": ${err}`);
    }
  }
}
