import { z } from 'zod';

export const ingestDocumentSchema = z
  .object({
    text: z
      .string()
      .trim()
      .min(1, 'Document text cannot be empty')
      .max(20000, 'Document text is too long')
      .optional(),
    content: z
      .string()
      .trim()
      .min(1, 'Document content cannot be empty')
      .max(20000, 'Document content is too long')
      .optional(),
    title: z.string().trim().max(512, 'Title is too long').optional(),
  })
  .refine((val) => Boolean((val.text ?? val.content)?.trim()), {
    message: 'Either text or content is required',
    path: ['text'],
  });

export const ingestRequestSchema = z.object({
  documents: z
    .array(ingestDocumentSchema)
    .min(1, 'At least one document is required')
    .max(100, 'Too many documents in a single ingest request'),
});

export type IngestRequest = z.infer<typeof ingestRequestSchema>;
export type IngestDocument = z.infer<typeof ingestDocumentSchema>;
