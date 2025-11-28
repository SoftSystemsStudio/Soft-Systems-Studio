import fetch from 'node-fetch';
import { embed } from './llm';

const QDRANT_COLLECTION = process.env.QDRANT_COLLECTION || 'kb';
const QDRANT_HOST = process.env.QDRANT_HOST || 'localhost';
const QDRANT_PORT = process.env.QDRANT_PORT || '6333';
const QDRANT_USE_HTTPS = (process.env.QDRANT_USE_HTTPS || 'false') === 'true';
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || '';

function url(path: string) {
  const proto = QDRANT_USE_HTTPS ? 'https' : 'http';
  return `${proto}://${QDRANT_HOST}:${QDRANT_PORT}${path}`;
}

async function ensureCollection() {
  // create collection if not exists with default vector size 1536
  try {
    await fetch(url(`/collections/${QDRANT_COLLECTION}`)).then((r) => r.json());
  } catch (e) {
    // Try to create it
    await fetch(url('/collections'), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(QDRANT_API_KEY ? { 'api-key': QDRANT_API_KEY } : {})
      },
      body: JSON.stringify({
        name: QDRANT_COLLECTION,
        vectors: { size: 1536, distance: 'Cosine' }
      })
    });
  }
}

export async function upsertDocuments(docs: { id: string; text: string; metadata?: any }[]) {
  if (!docs.length) return;
  await ensureCollection();
  const texts = docs.map((d) => d.text);
  const embeddings = await embed(texts);

  const points = docs.map((d, i) => ({
    id: d.id,
    vector: embeddings[i],
    payload: { text: d.text, metadata: d.metadata }
  }));

  await fetch(url(`/collections/${QDRANT_COLLECTION}/points`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(QDRANT_API_KEY ? { 'api-key': QDRANT_API_KEY } : {})
    },
    body: JSON.stringify({ points })
  });
}

export async function querySimilar(text: string, topK = 4) {
  await ensureCollection();
  const [embedding] = await embed(text);

  const res = await fetch(url(`/collections/${QDRANT_COLLECTION}/points/search`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(QDRANT_API_KEY ? { 'api-key': QDRANT_API_KEY } : {})
    },
    body: JSON.stringify({
      vector: embedding,
      limit: topK,
      with_payload: true,
      with_points: false
    })
  });

  const payload = await res.json();
  const results = (payload.result || payload) as any[];
  return results.map((r) => ({ id: r.id, score: r.score, payload: r.payload }));
}
