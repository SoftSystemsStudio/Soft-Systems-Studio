import { Redis } from '@upstash/redis';
import logger from '../logger';

/**
 * Upstash Redis client for serverless environments
 * Uses the REST API which works in edge runtimes and serverless functions
 */

let upstashClient: Redis | null = null;

/**
 * Check if Upstash REST credentials are configured
 */
export function isUpstashConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

/**
 * Get or create the Upstash Redis client
 */
export function getUpstashClient(): Redis {
  if (!upstashClient) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error('Upstash Redis REST credentials not configured');
    }

    upstashClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    logger.info('Upstash Redis client initialized');
  }

  return upstashClient;
}

/**
 * Check if Upstash is healthy
 */
export async function isUpstashHealthy(): Promise<boolean> {
  try {
    if (!isUpstashConfigured()) return false;
    const client = getUpstashClient();
    const result = await client.ping();
    return result === 'PONG';
  } catch {
    return false;
  }
}

/**
 * Upstash cache helpers (similar to ioredis helpers but for REST API)
 */
export const upstashCache = {
  /**
   * Get a cached value
   */
  async get<T>(key: string): Promise<T | null> {
    const client = getUpstashClient();
    return client.get<T>(key);
  },

  /**
   * Set a cached value with optional TTL (in seconds)
   */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const client = getUpstashClient();
    if (ttlSeconds) {
      await client.setex(key, ttlSeconds, JSON.stringify(value));
    } else {
      await client.set(key, JSON.stringify(value));
    }
  },

  /**
   * Delete a cached value
   */
  async del(key: string): Promise<void> {
    const client = getUpstashClient();
    await client.del(key);
  },

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    const client = getUpstashClient();
    const result = await client.exists(key);
    return result === 1;
  },

  /**
   * Increment a counter
   */
  async incr(key: string, ttlSeconds?: number): Promise<number> {
    const client = getUpstashClient();
    const value = await client.incr(key);
    if (ttlSeconds && value === 1) {
      await client.expire(key, ttlSeconds);
    }
    return value;
  },
};

export default getUpstashClient;
