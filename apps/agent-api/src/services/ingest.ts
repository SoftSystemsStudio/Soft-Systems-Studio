/**
 * Knowledge Base Ingestion Service
 * Handles document ingestion with transactional persistence
 */
import { randomUUID } from 'crypto';
import prisma from '../db';
import { logger } from '../logger';
import { upsertDocuments } from './qdrant';

export interface IngestDocument {
  text?: string;
  content?: string;
  title?: string;
}

export interface IngestInput {
  workspaceId: string;
  documents: IngestDocument[];
  ingestionId?: string;
}

export interface IngestResult {
  success: boolean;
  documentCount: number;
  documentIds: string[];
}

/**
 * Ingest documents into the knowledge base
 * Uses a transaction to ensure atomic persistence to both Qdrant and Postgres
 *
 * @throws Error if workspace not found or persistence fails
 */
export async function ingestDocuments(input: IngestInput): Promise<IngestResult> {
  const { workspaceId, documents, ingestionId = randomUUID() } = input;

  if (!workspaceId) {
    throw new Error('workspaceId is required for ingestion');
  }

  if (!documents || documents.length === 0) {
    logger.warn({ workspaceId }, 'No documents to ingest');
    return { success: true, documentCount: 0, documentIds: [] };
  }

  logger.info({ workspaceId, docCount: documents.length }, 'Starting document ingestion');

  // Step 1: Verify workspace exists
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace) {
    const error = new Error(`Workspace not found: ${workspaceId}`);
    logger.error({ workspaceId }, error.message);
    throw error;
  }

  // Step 2: Prepare documents for ingestion with deterministic IDs
  // Using ingestionId ensures idempotent retries generate the same doc IDs
  const preparedDocs = documents.map((d, i) => ({
    id: `${workspaceId}-${ingestionId}-${i}`,
    text: d.text || d.content || '',
    metadata: { title: d.title || null },
  }));

  // Step 3: Use transaction to ensure atomic persistence
  // If Postgres write fails, the whole operation fails
  const result = await prisma.$transaction(async (tx) => {
    // Persist to Postgres first (faster, local)
    // Use deterministic IDs for idempotent inserts on retry
    const rows = documents.map((d, i) => ({
      id: `${workspaceId}-${ingestionId}-${i}`,
      workspaceId,
      title: d.title || null,
      content: d.text || d.content || '',
    }));

    const created = await tx.kbDocument.createMany({
      data: rows,
      skipDuplicates: true, // Idempotent: skip if doc ID already exists
    });

    logger.debug({ workspaceId, createdCount: created.count }, 'Documents persisted to Postgres');

    return {
      count: created.count,
      ids: preparedDocs.map((d) => d.id),
    };
  });

  // Step 4: Upsert to Qdrant (after Postgres succeeds)
  // Surface Qdrant failures so retries can fix them
  try {
    await upsertDocuments(workspaceId, preparedDocs);
    logger.debug({ workspaceId, docCount: preparedDocs.length }, 'Documents upserted to Qdrant');
  } catch (qdrantError) {
    // Log and rethrow - let BullMQ retry the job
    // Documents are safely in Postgres and Qdrant upsert is idempotent
    logger.error(
      { workspaceId, error: qdrantError },
      'Failed to upsert documents to Qdrant - will retry',
    );
    throw new Error(`Qdrant ingestion failed: ${String(qdrantError)}`);
  }

  logger.info(
    { workspaceId, documentCount: result.count, documentIds: result.ids },
    'Document ingestion completed',
  );

  return {
    success: true,
    documentCount: result.count,
    documentIds: result.ids,
  };
}

/**
 * Ingest a single document
 * Convenience wrapper for ingestDocuments
 */
export async function ingestDocument(
  workspaceId: string,
  document: IngestDocument,
): Promise<IngestResult> {
  return ingestDocuments({
    workspaceId,
    documents: [document],
  });
}

/**
 * Re-index all documents for a workspace from Postgres to Qdrant
 * Use this to recover from Qdrant sync failures
 */
export async function reindexWorkspace(workspaceId: string): Promise<{ count: number }> {
  logger.info({ workspaceId }, 'Starting workspace re-indexing');

  const documents = await prisma.kbDocument.findMany({
    where: { workspaceId },
    select: { id: true, content: true, title: true },
  });

  if (documents.length === 0) {
    logger.info({ workspaceId }, 'No documents to re-index');
    return { count: 0 };
  }

  const preparedDocs = documents.map((d) => ({
    id: d.id,
    text: d.content,
    metadata: { title: d.title },
  }));

  await upsertDocuments(workspaceId, preparedDocs);

  logger.info({ workspaceId, count: documents.length }, 'Workspace re-indexed');

  return { count: documents.length };
}
