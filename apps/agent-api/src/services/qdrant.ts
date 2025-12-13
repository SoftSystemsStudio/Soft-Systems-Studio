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

// Network configuration
const REQUEST_TIMEOUT_MS = 30000; // 30 second timeout
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // 1 second base delay

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
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options);

      // Don't retry on client errors (4xx), only server errors (5xx)
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }

      // Server error - log and retry
      logger.warn(
        { url, status: response.status, attempt, maxRetries },
        'Qdrant request failed, retrying',
      );
      lastError = new Error(`Qdrant returned ${response.status}`);
    } catch (err) {
      const error = err as Error;
      lastError = error;

      // Check if it's a timeout or network error
      if (error.name === 'AbortError') {
        logger.warn({ url, attempt, maxRetries }, 'Qdrant request timed out, retrying');
      } else if (error instanceof FetchError) {
        logger.warn(
          { url, attempt, maxRetries, code: error.code },
          'Qdrant network error, retrying',
        );
      } else {
        // Unknown error - don't retry
        throw error;
      }
    }

    // Exponential backoff before retry
    if (attempt < maxRetries) {
      const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
      await sleep(delay);
    }
  }

  // All retries exhausted
  logger.error({ url, maxRetries }, 'Qdrant request failed after all retries');
  throw lastError || new Error('Qdrant request failed after all retries');
}

/**
 * Ensure collection exists, create if not
 */
async function ensureCollection(): Promise<void> {
  const collectionUrl = buildUrl(`/collections/${QDRANT_COLLECTION}`);

  try {
    const response = await fetchWithRetry(collectionUrl, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (response.ok) {
      return; // Collection exists
    }

    if (response.status === 404) {
      // Collection doesn't exist - create it
      logger.info({ collection: QDRANT_COLLECTION }, 'Creating Qdrant collection');

      const createResponse = await fetchWithRetry(buildUrl('/collections'), {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          name: QDRANT_COLLECTION,
          vectors: { size: 1536, distance: 'Cosine' },
        }),
      });

      if (!createResponse.ok) {
        const errorBody = await createResponse.text();
        throw new Error(`Failed to create collection: ${createResponse.status} ${errorBody}`);
      }

      logger.info({ collection: QDRANT_COLLECTION }, 'Qdrant collection created');

      // Create payload index for workspaceId filtering
      logger.info({ collection: QDRANT_COLLECTION }, 'Creating payload index for workspaceId');
      const indexResponse = await fetchWithRetry(buildUrl(`/collections/${QDRANT_COLLECTION}/index`), {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          field_name: 'workspaceId',
          field_schema: 'keyword',
        }),
      });

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
    throw error;
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
