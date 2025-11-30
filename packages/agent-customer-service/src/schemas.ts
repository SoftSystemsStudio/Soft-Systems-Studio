import { z } from 'zod';

export const ChatRequest = z.object({
  workspaceId: z.string(),
  userId: z.string().optional(),
  message: z.string(),
  conversationId: z.string().optional(),
});

export type ChatRequestType = z.infer<typeof ChatRequest>;

export const ChatResponse = z.object({
  reply: z.string(),
  needsHuman: z.boolean().optional(),
});

export type ChatResponseType = z.infer<typeof ChatResponse>;
