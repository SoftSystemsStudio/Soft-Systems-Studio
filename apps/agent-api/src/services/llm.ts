// Type definition for chat message
import type { ChatMessage } from '@softsystems/core-llm';
import { callChat, callEmbeddings } from '@softsystems/core-llm';

export async function chat(messages: ChatMessage[], model?: string) {
  return callChat(messages, { model });
}

export async function embed(text: string | string[], model?: string) {
  return callEmbeddings(text, { model });
}
