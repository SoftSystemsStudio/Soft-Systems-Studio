import type { RunRequest } from '../schemas/run';
import { runChat as legacyRunChat } from './chat';

export interface RunChatPrincipal {
  userId?: string;
  workspaceId: string;
  roles?: string[];
}

export interface RunChatInput extends RunRequest {
  principal: RunChatPrincipal;
  requestId?: string;
}

export interface RunChatResult {
  runId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  statusCode?: number;
  // Optional ergonomic fields for immediate responses
  reply?: string;
}

export async function runChat(input: RunChatInput): Promise<RunChatResult> {
  const { workspaceId, input: chatInput, principal } = input;

  // For now, adapt to the existing `runChat` service which expects a single
  // `message` string. We choose the last user message as the message content.
  const messages = chatInput?.messages ?? [];
  const lastUserMessage =
    [...messages].reverse().find((m) => m.role === 'user') ?? messages[messages.length - 1];
  const message = lastUserMessage?.content ?? '';

  // Call the legacy runChat which persists the conversation synchronously
  const legacyResult = await legacyRunChat({
    workspaceId,
    message,
    userId: principal?.userId,
    conversationId: (chatInput as any)?.metadata?.conversationId,
  });

  return {
    runId: legacyResult.conversationId,
    status: 'completed',
    statusCode: 200,
    reply: legacyResult.reply,
  };
}
