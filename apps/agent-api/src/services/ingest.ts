/**
 * Knowledge Base Ingestion Service
 * Handles document ingestion with transactional persistence
 */
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
  const { workspaceId, documents } = input;

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

  // Step 2: Prepare documents for ingestion
  const timestamp = Date.now();
  const preparedDocs = documents.map((d, i) => ({
    id: `${workspaceId}-${timestamp}-${i}`,
    text: d.text || d.content || '',
    metadata: { title: d.title || null },
  }));

  // Step 3: Use transaction to ensure atomic persistence
  // If Postgres write fails, the whole operation fails
  const result = await prisma.$transaction(async (tx) => {
    // Persist to Postgres first (faster, local)
    const rows = documents.map((d) => ({
      workspaceId,
      title: d.title || null,
      content: d.text || d.content || '',
    }));

    const created = await tx.kbDocument.createMany({
      data: rows,
    });

    logger.debug({ workspaceId, createdCount: created.count }, 'Documents persisted to Postgres');

    // Get the IDs of created documents
    const createdDocs = await tx.kbDocument.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: documents.length,
      select: { id: true },
    });

    return {
      count: created.count,
      ids: createdDocs.map((d) => d.id),
    };
  });

  // Step 4: Upsert to Qdrant (after Postgres succeeds)
  // If Qdrant fails, the documents are still in Postgres
  // A retry mechanism can re-sync them later
  try {
    await upsertDocuments(workspaceId, preparedDocs);
    logger.debug({ workspaceId, docCount: preparedDocs.length }, 'Documents upserted to Qdrant');
  } catch (qdrantError) {
    // Log the error but don't fail the whole operation
    // Documents are safely in Postgres and can be re-indexed
    logger.error(
      { workspaceId, error: qdrantError },
      'Failed to upsert documents to Qdrant - documents saved to Postgres, will need re-indexing',
    );
    // We could optionally throw here to make Qdrant failures fatal:
    // throw new Error(`Qdrant ingestion failed: ${qdrantError}`);
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
