/*
  Minimal LLM wrapper for OpenAI-compatible APIs.
  - Uses global `process.env.OPENAI_API_KEY`.
  - Uses native fetch (Node 18+ / 22).
  - Keeps interface small: `callChat(messages, options)`.
*/

export * from './adapter';
export * from './errors';
export * from './pricing';
export * from './tokenizer';
export * from './metrics';
