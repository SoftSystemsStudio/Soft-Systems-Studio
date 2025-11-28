import { ChatRequest, ChatResponse } from '../schemas';
import { callChat } from '@softsystems/core-llm';

export async function handleChat(body: unknown) {
  const parse = ChatRequest.safeParse(body);
  if (!parse.success) {
    return { status: 400, body: { error: 'invalid_payload' } };
  }

  const { message, workspaceId, userId } = parse.data;

  // Minimal prompt composition: load system prompt and user prompt from package
  const systemPrompt = await import('../prompts/system.md').then((m) => String(m.default || m));
  const userHint = await import('../prompts/user.md').then((m) => String(m.default || m));

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `${userHint}\n\nUser: ${message}` }
  ];

  // Call shared LLM wrapper
  const reply = await callChat(messages);

  // Rudimentary detection for escalation token
  const needsHuman = /NEEDS_HUMAN/.test(reply);

  const response = ChatResponse.parse({ reply, needsHuman });

  // TODO: persist to conversation store (Postgres) and log
  console.log('[handleChat] workspace', workspaceId, 'user', userId, 'reply', reply.slice(0, 120));

  return { status: 200, body: response };
}
