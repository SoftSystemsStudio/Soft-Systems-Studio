import type { IStateManager } from './stateManager';

let stateManager: IStateManager | null = null;
let stats: { client?: any } = {};

export async function initState(opts?: { redisUrl?: string; requireRedis?: boolean }) {
  if (stateManager) return stateManager;
  const redisUrl = opts?.redisUrl ?? process.env.REDIS_URL;
  if (redisUrl) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const IORedis = require('ioredis');
      const client = new IORedis(redisUrl);
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { RedisStateManager } = require('./stateManager.redis');
      // perform a lightweight health-check (ping) with retry/backoff so callers can opt-in to fail-fast
      const attempts = (opts as any)?.redisConnectAttempts ?? 3;
      const baseDelayMs = (opts as any)?.redisConnectBaseDelayMs ?? 200;
      let lastErr: any = null;
      for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
          if (typeof client.ping === 'function') {
            // eslint-disable-next-line no-await-in-loop
            const pong = await client.ping();
            if (!pong || (typeof pong === 'string' && pong.toUpperCase() !== 'PONG')) {
              throw new Error(`redis ping unexpected response: ${String(pong)}`);
            }
          }
          // success
          // eslint-disable-next-line no-console
          console.info('Redis connected', { redisUrl });
          stateManager = new RedisStateManager(client as any);
          try {
            (stateManager as any)._client = client;
          } catch (_) {}
          return stateManager;
        } catch (pingErr) {
          lastErr = pingErr;
          if (attempt >= attempts) break;
          // exponential backoff with jitter
          const backoff = baseDelayMs * Math.pow(2, attempt - 1);
          const jitter = Math.floor(Math.random() * 100);
          // eslint-disable-next-line no-await-in-loop
          await new Promise((res) => setTimeout(res, backoff + jitter));
        }
      }

      // exhausted attempts
      if (opts?.requireRedis) {
        throw lastErr || new Error('redis connection failed');
      }
      // otherwise warn and fall through to in-memory fallback
      // eslint-disable-next-line no-console
      console.warn(
        'Redis health-check failed (continuing with in-memory state):',
        lastErr?.message || lastErr,
      );
      try {
        if (typeof client.quit === 'function') await client.quit();
      } catch (_) {
        // ignore
      }
      // fallthrough to in-memory
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { InMemoryStateManager } = require('./stateManager');
      stateManager = new InMemoryStateManager();
      return stateManager;
    } catch (e) {
      if (opts?.requireRedis) throw e;
      // fallthrough to in-memory
    }
  }

  // fallback
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { InMemoryStateManager } = require('./stateManager');
  stateManager = new InMemoryStateManager();
  return stateManager;
}

export function getStateManager() {
  if (!stateManager) throw new Error('state manager not initialized; call initState() first');
  return stateManager;
}

export async function closeStateManager() {
  // If using a Redis client, attempt to quit
  try {
    if (
      (stateManager as any)?._client &&
      typeof (stateManager as any)._client.quit === 'function'
    ) {
      await (stateManager as any)._client.quit();
    }
  } catch (e) {
    // ignore
  }
  stateManager = null;
}
