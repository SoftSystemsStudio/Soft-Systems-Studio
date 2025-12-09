import { countTokensFromMessages } from './tokenizer';
import { emitMetric } from './metrics';
import { estimateCost } from './pricing';
import { ProviderError, ValidationError } from './errors';

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export type CallOptions = {
  model?: string;
  timeoutMs?: number;
  retries?: number;
  streaming?: boolean;
};

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

function validateMessages(messages: ChatMessage[]) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new ValidationError('messages must be a non-empty array');
  }
  for (const m of messages) {
    if (!m || typeof m.content !== 'string' || !m.content.trim()) {
      throw new ValidationError('each message must have a non-empty content string');
    }
  }
}

export async function callChat(
  messages: ChatMessage[],
  modelOrOpts?: string | CallOptions,
): Promise<string> {
  validateMessages(messages);

  const opts: CallOptions =
    typeof modelOrOpts === 'string' ? { model: modelOrOpts } : modelOrOpts ?? {};

  const model = opts.model ?? process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
  const timeoutMs = opts.timeoutMs ?? Number(process.env.LLM_TIMEOUT_MS ?? 15000);
  const retries = opts.retries ?? 2;

  // token counting & emit metric (visible even if we fallback to estimate)
  const tc = countTokensFromMessages(messages as any);
  emitMetric('llm_tokens_in', tc.tokens, { model, method: tc.method });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new ProviderError('OPENAI_API_KEY not configured');

  const body = { model, messages };

  let lastErr: any = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(body),
      }, timeoutMs);

      if (!res.ok) {
        const txt = await res.text();
        throw new ProviderError(`provider returned ${res.status}: ${txt}`);
      }

      const payload = await res.json();
      const reply = payload.choices?.[0]?.message?.content ?? '';

      // output tokens are not always provided by all providers; best-effort
      const outTokens = (payload.usage && (payload.usage.total_tokens || 0)) || 0;
      emitMetric('llm_tokens_out', outTokens, { model });

      // price estimate emit
      const est = estimateCost(tc.tokens, outTokens, model);
      emitMetric('llm_cost_estimate_usd', Math.round(est.cost * 1000000) / 1000000, { model });

      return String(reply);
    } catch (err) {
      lastErr = err;
      // simple retry/backoff
      const backoff = 200 * Math.pow(2, attempt);
      // eslint-disable-next-line no-console
      console.warn(`LLM call attempt ${attempt} failed, retry in ${backoff}ms:`, (err as any)?.message ?? err);
      await new Promise((r) => setTimeout(r, backoff));
    }
  }

  throw new ProviderError('LLM provider failed after retries', lastErr);
}

export async function callEmbeddings(
  input: string | string[],
  optsOrModel: { model?: string; timeoutMs?: number } | string = {},
) {
  const opts = typeof optsOrModel === 'string' ? { model: optsOrModel } : optsOrModel;
  const model = opts.model ?? process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small';
  const timeoutMs = opts.timeoutMs ?? Number(process.env.LLM_TIMEOUT_MS ?? 15000);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new ProviderError('OPENAI_API_KEY not configured');

  const body = { model, input: Array.isArray(input) ? input : [input] };
  const res = await fetchWithTimeout('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  }, timeoutMs);

  if (!res.ok) {
    const txt = await res.text();
    throw new ProviderError(`embeddings provider returned ${res.status}: ${txt}`);
  }

  const payload = await res.json();
  const embeddings = payload.data?.map((d: any) => d.embedding) ?? [];
  return embeddings;
}
