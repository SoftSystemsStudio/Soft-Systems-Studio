// Type definition for chat message
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Import from workspace package
// eslint-disable-next-line @typescript-eslint/no-require-imports
const coreLlm = require('@softsystems/core-llm') as {
  callChat: (messages: ChatMessage[], model?: string) => Promise<string>;
  callEmbeddings: (text: string | string[], model?: string) => Promise<number[][]>;
};

export async function chat(messages: ChatMessage[], model?: string) {
  return coreLlm.callChat(messages, model);
}

export async function embed(text: string | string[], model?: string) {
  return coreLlm.callEmbeddings(text, model);
}
