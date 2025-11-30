/*
  Minimal LLM wrapper for OpenAI-compatible APIs.
  - Uses global `process.env.OPENAI_API_KEY`.
  - Uses native fetch (Node 18+ / 22).
  - Keeps interface small: `callChat(messages, options)`.
*/

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export async function callChat(messages: ChatMessage[], model = 'gpt-4o-mini') {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${body}`);
  }

  const payload = await res.json();
  const reply = payload.choices?.[0]?.message?.content;
  return reply ?? '';
}

export type { ChatMessage };

export async function callEmbeddings(input: string | string[], model = 'text-embedding-3-small') {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');

  const body: any = { model };
  if (Array.isArray(input)) body.input = input;
  else body.input = [input];

  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`OpenAI embeddings error ${res.status}: ${txt}`);
  }

  const payload = await res.json();
  const embeddings = payload.data.map((d: any) => d.embedding as number[]);
  return embeddings;
}
