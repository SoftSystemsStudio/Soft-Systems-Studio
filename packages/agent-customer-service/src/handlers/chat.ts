import { ChatRequest, ChatResponse } from '../schemas';
import { callChat } from '@softsystems/core-llm';

export async function handleChat(body: unknown) {
  const parse = ChatRequest.safeParse(body);
  if (!parse.success) {
    return { status: 400, body: { error: 'invalid_payload' } };
  }

  const { message, workspaceId, userId } = parse.data;

  // Minimal prompt composition: load system prompt and user prompt from package files
  const fs = require('fs').promises;
  const path = require('path');
  const systemPath = path.join(__dirname, '../prompts/system.md');
  const userPath = path.join(__dirname, '../prompts/user.md');
  const systemPrompt = String(await fs.readFile(systemPath, 'utf-8'));
  const userHint = String(await fs.readFile(userPath, 'utf-8'));

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `${userHint}\n\nUser: ${message}` },
  ];

  // Call shared LLM wrapper
  const reply = await callChat(messages as any);

  // Rudimentary detection for escalation token
  const needsHuman = /NEEDS_HUMAN/.test(reply);

  const response = ChatResponse.parse({ reply, needsHuman });

  // TODO: persist to conversation store (Postgres) and log
  console.log('[handleChat] workspace', workspaceId, 'user', userId, 'reply', reply.slice(0, 120));

  return { status: 200, body: response };
}
