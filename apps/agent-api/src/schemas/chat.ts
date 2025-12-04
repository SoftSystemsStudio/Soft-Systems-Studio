/**
 * Zod schemas for chat endpoints
 */
import { z } from 'zod';

/**
 * Chat request schema - validates incoming chat messages
 */
export const chatRequestSchema = z.object({
  message: z
    .string()
    .min(1, 'Message is required')
    .max(10000, 'Message must be at most 10000 characters')
    .trim(),
  conversationId: z.string().uuid('Invalid conversation ID format').optional(),
  context: z.record(z.unknown()).optional(),
});

/**
 * Chat response type
 */
export const chatResponseSchema = z.object({
  reply: z.string(),
  conversationId: z.string().uuid().optional(),
});

// Type exports
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatResponse = z.infer<typeof chatResponseSchema>;
