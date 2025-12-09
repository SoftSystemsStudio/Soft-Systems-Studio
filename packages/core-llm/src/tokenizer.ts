/**
 * Tokenizer abstraction: attempts to load a high-fidelity tokenizer
 * (e.g. tiktoken) and falls back to a cheap character-based estimate.
 */
export type TokenCount = {
  tokens: number;
  method: 'exact' | 'estimate' | 'unknown';
};

let hasTiktoken = false;
let tiktoken: any = null;
try {
  // Optional dependency; may not be present in all environments
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
  tiktoken = require('@dqbd/tiktoken');
  hasTiktoken = !!tiktoken;
} catch (e) {
  hasTiktoken = false;
}

export function countTokensFromText(text: string): TokenCount {
  if (!text) return { tokens: 0, method: 'unknown' };
  try {
    if (hasTiktoken && tiktoken && typeof tiktoken.encoding_for_model === 'function') {
      const enc = tiktoken.encoding_for_model('gpt-4o-mini');
      const tokens = enc.encode(text).length;
      try {
        enc.free();
      } catch (e) {
        // ignore
      }
      return { tokens, method: 'exact' };
    }
  } catch (err) {
    // fallthrough to estimate
  }

  // Fallback estimate: heuristic chars/4
  const tokens = Math.max(1, Math.ceil(text.length / 4));
  return { tokens, method: 'estimate' };
}

export function countTokensFromMessages(messages: { role: string; content: string }[]): TokenCount {
  let total = 0;
  let method: TokenCount['method'] = 'unknown';
  for (const m of messages) {
    const res = countTokensFromText(m.content || '');
    total += res.tokens;
    if (res.method === 'exact') method = 'exact';
    else if (method !== 'exact' && res.method === 'estimate') method = 'estimate';
  }
  return { tokens: total, method };
}
