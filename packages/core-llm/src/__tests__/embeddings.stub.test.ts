import { describe, it, expect, beforeAll } from 'vitest';
import { callEmbeddings } from '../adapter';

beforeAll(() => {
  process.env.EMBEDDINGS_PROVIDER = 'stub';
});

describe('Embedding stub - determinism & contract', () => {
  it('returns deterministic vectors for same input', async () => {
    const a = await callEmbeddings('hello world');
    const b = await callEmbeddings('hello world');
    expect(a).toEqual(b);
  });

  it('returns different vectors for different inputs', async () => {
    const a = await callEmbeddings('hello world');
    const b = await callEmbeddings('goodbye world');
    // at least one element differs
    const identical = a[0].every((v: number, i: number) => v === b[0][i]);
    expect(identical).toBe(false);
  });

  it('has correct dimension and finite numbers', async () => {
    const v = await callEmbeddings(['one', 'two']);
    expect(v.length).toBe(2);
    for (const vec of v) {
      expect(vec.length).toBe(1536);
      for (const el of vec) {
        expect(Number.isFinite(el)).toBe(true);
        expect(el).toBeGreaterThanOrEqual(-1);
        expect(el).toBeLessThanOrEqual(1);
      }
    }
  });
});
