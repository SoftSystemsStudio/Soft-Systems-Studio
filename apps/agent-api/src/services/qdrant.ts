import fetch, { Response, FetchError, RequestInit } from 'node-fetch';
import { embed } from './llm';
import { logger } from '../logger';
import env from '../env';

// Use validated environment configuration
const QDRANT_COLLECTION = env.QDRANT_COLLECTION;
const QDRANT_HOST = env.QDRANT_HOST;
const QDRANT_PORT = env.QDRANT_PORT;
const QDRANT_USE_HTTPS = env.QDRANT_USE_HTTPS;
const QDRANT_API_KEY = env.QDRANT_API_KEY || '';

// Network configuration (configurable via env)
const REQUEST_TIMEOUT_MS = Number((env as any).QDRANT_TIMEOUT_MS ?? 30000); // default 30s
// connect timeout intentionally not used directly; keep for future if needed
const MAX_RETRIES = Number((env as any).QDRANT_RETRY_MAX ?? 3);
const RETRY_BASE_MS = Number((env as any).QDRANT_RETRY_BASE_MS ?? 250); // base backoff
const RETRY_JITTER_MS = Number((env as any).QDRANT_RETRY_JITTER_MS ?? 100);

// Error taxonomy for clearer handling
class QdrantError extends Error {
  public meta: Record<string, unknown>;
  constructor(message: string, meta: Record<string, unknown> = {}) {
    super(message);
    this.name = 'QdrantError';
    this.meta = meta;
  }
}

class QdrantTimeout extends QdrantError {
  constructor(message: string, meta: Record<string, unknown> = {}) {
    super(message, meta);
    this.name = 'QdrantTimeout';
  }
}

class QdrantUnavailable extends QdrantError {
  constructor(message: string, meta: Record<string, unknown> = {}) {
    super(message, meta);
    this.name = 'QdrantUnavailable';
  }
}

class QdrantBadRequest extends QdrantError {
  constructor(message: string, meta: Record<string, unknown> = {}) {
    super(message, meta);
    this.name = 'QdrantBadRequest';
  }
}

/**
 * Build Qdrant URL from validated config
 */
function buildUrl(path: string): string {
  const proto = QDRANT_USE_HTTPS ? 'https' : 'http';
  return `${proto}://${QDRANT_HOST}:${QDRANT_PORT}${path}`;
}

/**
 * Get headers for Qdrant requests
 */
function getHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...(QDRANT_API_KEY ? { 'api-key': QDRANT_API_KEY } : {}),
  };
}

/**
 * Sleep helper for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch with timeout wrapper
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number } = {},
): Promise<Response> {
  const { timeout = REQUEST_TIMEOUT_MS, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal as RequestInit['signal'],
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch with retry logic for transient failures
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = MAX_RETRIES,
  operation = 'qdrant',
): Promise<Response> {
  let lastError: Error | null = null;
  const start = Date.now();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options as any);

      // Retryable: 429, 408, 5xx
      if (response.ok) return response;

      if (response.status >= 400 && response.status < 500) {
        // Bad request - don't retry
        const body = await response.text();
        logger.warn({ url, status: response.status, operation }, 'Qdrant bad request');
        throw new QdrantBadRequest(`Bad request ${response.status}: ${body}`, {
          url,
          status: response.status,
          operation,
        });
      }

      // Server errors - retryable
      logger.warn({ url, status: response.status, attempt, maxRetries, operation }, 'Qdrant server error, retrying');
      lastError = new QdrantUnavailable(`Qdrant returned ${response.status}`, {
        url,
        status: response.status,
        attempt,
        operation,
      });
    } catch (err) {
      const error = err as any;
      lastError = error;

      // Timeout / abort
      if (error && error.name === 'AbortError') {
        logger.warn({ url, attempt, maxRetries, operation }, 'Qdrant request timed out');
        lastError = new QdrantTimeout('Qdrant request timed out', { url, attempt, operation });
      } else if (error instanceof FetchError || (error && (error.code || error.errno))) {
        // network issue
        logger.warn({ url, attempt, maxRetries, code: (error && error.code) || undefined, operation }, 'Qdrant network error');
        lastError = new QdrantUnavailable('Qdrant network error', { url, attempt, operation });
      } else if (error instanceof QdrantError) {
        // rethrow typed qdrant errors
        throw error;
      } else {
        // Unknown - wrap and throw
        logger.error({ url, attempt, error, operation }, 'Unexpected Qdrant error');
        throw new QdrantError(String(error?.message ?? error), { url, attempt, operation });
      }
    }

    // Exponential backoff + jitter before retry
    if (attempt < maxRetries) {
      const exp = RETRY_BASE_MS * Math.pow(2, attempt - 1);
      const jitter = Math.floor(Math.random() * RETRY_JITTER_MS);
      const delay = exp + jitter;
      await sleep(delay);
    }
  }

  const elapsed = Date.now() - start;
  logger.error({ url, maxRetries, elapsed }, 'Qdrant request failed after retries');
  throw lastError || new QdrantUnavailable('Qdrant request failed after retries', { url, operation });
}

/**
 * Ensure collection exists, create if not
 */
async function ensureCollection(): Promise<void> {
  const collectionUrl = buildUrl(`/collections/${QDRANT_COLLECTION}`);

  try {
    // Quick existence check (no retries) so we can react to 404
    const checkRes = await fetchWithTimeout(collectionUrl, {
      method: 'GET',
      headers: getHeaders(),
      timeout: Number((env as any).QDRANT_COLLECTION_CHECK_TIMEOUT_MS ?? 5000),
    });

    if (checkRes.ok) {
      return; // Collection exists
    }

    if (checkRes.status === 404) {
      // Collection doesn't exist - create it
      logger.info({ collection: QDRANT_COLLECTION }, 'Creating Qdrant collection');

      const createResponse = await fetchWithRetry(
        buildUrl('/collections'),
        {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({
            name: QDRANT_COLLECTION,
            vectors: { size: 1536, distance: 'Cosine' },
          }),
        },
        MAX_RETRIES,
        'ensureCollection:create',
      );

      if (!createResponse.ok) {
        const errorBody = await createResponse.text();
        throw new QdrantError(`Failed to create collection: ${createResponse.status} ${errorBody}`, {
          status: createResponse.status,
        });
      }

      logger.info({ collection: QDRANT_COLLECTION }, 'Qdrant collection created');

      // Create payload index for workspaceId filtering
      logger.info({ collection: QDRANT_COLLECTION }, 'Creating payload index for workspaceId');
      const indexResponse = await fetchWithRetry(
        buildUrl(`/collections/${QDRANT_COLLECTION}/index`),
        {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({
            field_name: 'workspaceId',
            field_schema: 'keyword',
          }),
        },
        MAX_RETRIES,
        'ensureCollection:createIndex',
      );

      if (!indexResponse.ok) {
        // Log but don't fail - index may already exist
        const errorBody = await indexResponse.text();
        logger.warn(
          { status: indexResponse.status, error: errorBody },
          'Failed to create payload index (may already exist)',
        );
      } else {
        logger.info({ collection: QDRANT_COLLECTION }, 'Payload index created');
      }
    }
  } catch (error) {
    logger.error({ error, collection: QDRANT_COLLECTION }, 'Failed to ensure Qdrant collection');
    // wrap unknown errors for callers
    if (error instanceof QdrantError) throw error;
    throw new QdrantError('Failed to ensure Qdrant collection', { collection: QDRANT_COLLECTION, original: String(error) });
  }
}

/**
 * Lightweight ping for health checks - returns true if Qdrant is reachable
 */
export async function pingQdrant(timeoutMs = Number((env as any).QDRANT_TIMEOUT_MS ?? 3000)) {
  try {
    const res = await fetchWithTimeout(buildUrl('/collections'), {
      method: 'GET',
      headers: getHeaders(),
      timeout: timeoutMs,
    });
    if (res.ok) return true;
    throw new QdrantUnavailable(`Qdrant ping returned ${res.status}`, { status: res.status });
  } catch (err) {
    logger.error({ err }, 'Qdrant ping failed');
    return false;
  }
}

/**
 * Upsert documents into Qdrant with workspace isolation
 * @param workspaceId - Required workspace ID for tenant isolation
 * @param docs - Documents to upsert
 */
export async function upsertDocuments(
  workspaceId: string,
  docs: { id: string; text: string; metadata?: Record<string, unknown> }[],
) {
  if (!workspaceId) {
    throw new Error('workspaceId is required for vector operations');
  }
  if (!docs.length) return;

  await ensureCollection();
  const texts = docs.map((d) => d.text);
  const embeddings = await embed(texts);

  const points = docs.map((d, i) => ({
    id: d.id,
    // eslint-disable-next-line security/detect-object-injection -- index is from map iteration, safe
    vector: embeddings[i],
    payload: {
      text: d.text,
      workspaceId, // Include workspaceId for tenant filtering
      metadata: d.metadata,
    },
  }));

  const response = await fetchWithRetry(buildUrl(`/collections/${QDRANT_COLLECTION}/points`), {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ points }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to upsert documents: ${response.status} ${errorBody}`);
  }

  logger.info('Upserted documents to Qdrant', {
    workspaceId,
    count: docs.length,
  });
}

/**
 * Query similar documents with workspace isolation
 * @param workspaceId - Required workspace ID for tenant filtering
 * @param text - Query text
 * @param topK - Number of results to return
 */
export async function querySimilar(workspaceId: string, text: string, topK = 4) {
  if (!workspaceId) {
    throw new Error('workspaceId is required for vector operations');
  }

  await ensureCollection();
  const [embedding] = await embed(text);

  const res = await fetchWithRetry(buildUrl(`/collections/${QDRANT_COLLECTION}/points/search`), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      vector: embedding,
      limit: topK,
      with_payload: true,
      with_points: false,
      // Filter by workspaceId to enforce tenant isolation
      filter: {
        must: [
          {
            key: 'workspaceId',
            match: { value: workspaceId },
          },
        ],
      },
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Failed to query similar documents: ${res.status} ${errorBody}`);
  }

  const payload = (await res.json()) as { result?: unknown[] };
  const results = (payload.result ?? []) as Array<{
    id: string;
    score: number;
    payload?: { text?: string; workspaceId?: string; metadata?: unknown };
  }>;

  logger.debug('Qdrant query completed', {
    workspaceId,
    resultsCount: results.length,
  });

  return results.map((r) => {
    return { id: r.id, score: r.score, payload: r.payload };
  });
}
