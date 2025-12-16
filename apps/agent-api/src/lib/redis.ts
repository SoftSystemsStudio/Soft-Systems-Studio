import IORedis, { Redis } from 'ioredis';
import env from '../env';
import logger from '../logger';

/**
 * Redis client singleton for the application
 * Used for caching, rate limiting, and general key-value storage
 *
 * Uses IORedis client with native Redis protocol
 * Works with both local Redis and Upstash Redis native endpoint (rediss://)
 */

let redisClient: Redis | null = null;

/**
 * Get or create the Redis client singleton
 * Returns IORedis client (works with both local and Upstash native endpoints)
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    // Always use IORedis for native Redis protocol (required for BullMQ)
    // Supports both local Redis and Upstash native endpoint (rediss://)
    logger.info('Initializing Redis client');
    // If running tests locally and no REDIS_URL was provided, avoid connecting
    // to a real Redis instance to prevent ECONNREFUSED during unit tests.
    const redisEnvVar = process.env.REDIS_URL;
    if (process.env.NODE_ENV === 'test' && !redisEnvVar) {
      logger.info('Test environment without REDIS_URL: using stub Redis client');
      // Minimal stub implementing methods used by the app tests
      // Minimal typed stub implementing a small Redis surface used in tests
      const stubObj = {
        on: (_event: string, _cb?: any) => stubObj as unknown as Redis,
        ping: async () => 'PONG',
        get: async () => null,
        set: async () => 'OK',
        setex: async () => 'OK',
        del: async () => 0,
        exists: async () => 0,
        incr: async () => 1,
        quit: async () => 'OK',
      } as unknown as Redis;
      redisClient = stubObj;
      return redisClient as Redis;
    }

    const redisUrl = env.REDIS_URL;
    const options: any = {
      maxRetriesPerRequest: null, // Required for BullMQ
      enableReadyCheck: true,
      lazyConnect: true,
      connectTimeout: 10000, // 10 second timeout
      retryStrategy(times: number) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    };

    redisClient = new IORedis(redisUrl, options);

    redisClient.on('connect', () => {
      logger.info('Redis connected');
    });

    redisClient.on('error', (err) => {
      logger.error({ err }, 'Redis connection error');
    });

    redisClient.on('close', () => {
      logger.warn('Redis connection closed');
    });
  }

  return redisClient as Redis;
}

/**
 * Return true when Redis is configured (used to gate BullMQ / QueueEvents creation)
 */
export function hasRedis(): boolean {
  return Boolean(process.env.REDIS_URL || env.REDIS_URL);
}

/**
 * Create or return a Redis connection suitable for BullMQ/Bull usage.
 * In test environments this will return the stubbed client when REDIS_URL is not provided.
 */
export function createRedisConnection(): Redis {
  return getRedisClient();
}

/**
 * Close the Redis connection gracefully
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis connection closed');
  }
}

/**
 * Check if Redis is connected and healthy
 */
export async function isRedisHealthy(): Promise<boolean> {
  try {
    const client = getRedisClient();
    const result = await client.ping();
    return result === 'PONG';
  } catch {
    return false;
  }
}

/**
 * Simple cache helpers
 */
export const cache = {
  /**
   * Get a cached value
   */
  async get<T>(key: string): Promise<T | null> {
    const client = getRedisClient();
    const value = await client.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  },

  /**
   * Set a cached value with optional TTL (in seconds)
   */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const client = getRedisClient();
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttlSeconds) {
      await client.setex(key, ttlSeconds, serialized);
    } else {
      await client.set(key, serialized);
    }
  },

  /**
   * Delete a cached value
   */
  async del(key: string): Promise<void> {
    const client = getRedisClient();
    await client.del(key);
  },

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    const client = getRedisClient();
    const result = await client.exists(key);
    return result === 1;
  },

  /**
   * Increment a counter (useful for rate limiting)
   */
  async incr(key: string, ttlSeconds?: number): Promise<number> {
    const client = getRedisClient();
    const value = await client.incr(key);
    if (ttlSeconds && value === 1) {
      await client.expire(key, ttlSeconds);
    }
    return value;
  },
};

export default getRedisClient;
