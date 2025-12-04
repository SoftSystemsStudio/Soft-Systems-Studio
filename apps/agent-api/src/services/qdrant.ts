import fetch, { Response } from 'node-fetch';
import { embed } from './llm';
import { logger } from '../logger';

const QDRANT_COLLECTION = process.env.QDRANT_COLLECTION || 'kb';
const QDRANT_HOST = process.env.QDRANT_HOST || 'localhost';
const QDRANT_PORT = process.env.QDRANT_PORT || '6333';
const QDRANT_USE_HTTPS = (process.env.QDRANT_USE_HTTPS || 'false') === 'true';
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || '';

function url(path: string) {
  const proto = QDRANT_USE_HTTPS ? 'https' : 'http';
  return `${proto}://${QDRANT_HOST}:${QDRANT_PORT}${path}`;
}

function getHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...(QDRANT_API_KEY ? { 'api-key': QDRANT_API_KEY } : {}),
  };
}

async function ensureCollection() {
  // create collection if not exists with default vector size 1536
  try {
    await fetch(url(`/collections/${QDRANT_COLLECTION}`), {
      headers: getHeaders(),
    }).then((r: Response) => r.json());
  } catch {
    // Try to create it
    await fetch(url('/collections'), {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        name: QDRANT_COLLECTION,
        vectors: { size: 1536, distance: 'Cosine' },
      }),
    });
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

  await fetch(url(`/collections/${QDRANT_COLLECTION}/points`), {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ points }),
  });

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

  const res = await fetch(url(`/collections/${QDRANT_COLLECTION}/points/search`), {
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
