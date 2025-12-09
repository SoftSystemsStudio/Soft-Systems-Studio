import { z } from 'zod';

export const runRequestSchema = z.object({
  workspaceId: z.string().min(1, 'workspaceId is required'),
  agentId: z.string().min(1, 'agentId is required'),
  // Adjust these fields to match your actual payload
  input: z.object({
    messages: z
      .array(
        z.object({
          role: z.enum(['user', 'system', 'assistant']),
          content: z.string().min(1),
        }),
      )
      .min(1, 'At least one message is required'),
    // Optional metadata / context
    metadata: z.record(z.any()).optional(),
  }),
  // Optional flags
  stream: z.boolean().optional().default(false),
});

export type RunRequest = z.infer<typeof runRequestSchema>;
