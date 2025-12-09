// Lightweight TokenCounter: tries to use tiktoken if available, otherwise falls back to char heuristic.
let tiktoken: any = null;
let hasTiktoken = false;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  tiktoken = require('@dqbd/tiktoken');
  hasTiktoken = !!tiktoken;
} catch (e) {
  hasTiktoken = false;
}

export class TokenCounter {
  countMessages(messages: { role: string; content: string }[]) {
    let total = 0;
    let method: 'exact' | 'estimate' | 'unknown' = 'unknown';
    for (const m of messages) {
      const text = m.content || '';
      if (hasTiktoken && tiktoken && typeof tiktoken.encoding_for_model === 'function') {
        try {
          const enc = tiktoken.encoding_for_model('gpt-4o-mini');
          const tokens = enc.encode(text).length;
          try {
            enc.free();
          } catch (e) {}
          total += tokens;
          method = 'exact';
          continue;
        } catch (err) {
          // fallthrough to estimate
        }
      }
      // estimate
      const est = Math.max(1, Math.ceil(text.length / 4));
      total += est;
      if (method !== 'exact') method = 'estimate';
    }
    return { tokens: total, method };
  }
}
