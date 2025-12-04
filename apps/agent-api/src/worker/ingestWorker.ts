import 'dotenv/config';
import { Worker } from 'bullmq';
import env from '../env';
import { upsertDocuments } from '../services/qdrant';
import prisma from '../db';
import { logger } from '../logger';
import IORedis from 'ioredis';

const connection = new IORedis(env.REDIS_URL);

const worker = new Worker(
  'ingest',
  async (job) => {
    type IngestDoc = { text?: string; content?: string; title?: string };
    type IngestJob = { workspaceId: string; documents: IngestDoc[] };
    const { workspaceId, documents } = job.data as IngestJob;

    // Validate workspaceId is present
    if (!workspaceId) {
      const err = new Error('[worker] workspaceId is required for ingestion');
      logger.error({ jobId: job.id }, err.message);
      throw err;
    }

    logger.info({ workspaceId, docCount: documents.length, jobId: job.id }, 'Processing ingest job');

    // verify workspace exists before doing work
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) {
      const err = new Error(`[worker] workspace not found: ${workspaceId}`);
      logger.error({ workspaceId, jobId: job.id }, err.message);
      throw err; // let job retry / DLQ handle it
    }

    // upsert into qdrant WITH workspaceId for tenant isolation
    await upsertDocuments(
      workspaceId,
      documents.map((d, i: number) => ({
        id: `${workspaceId}-${Date.now()}-${i}`,
        text: d.text || d.content || '',
        metadata: { title: d.title || null },
      })),
    );

    // persist to Postgres KbDocument
    try {
      const rows = documents.map((d) => ({
        workspaceId,
        title: d.title || null,
        content: d.text || d.content || '',
      }));
      await prisma.kbDocument.createMany({ data: rows });
    } catch (e) {
      logger.error({ workspaceId, jobId: job.id, error: e }, 'Failed to persist kb documents');
      throw e;
    }

    logger.info({ workspaceId, docCount: documents.length, jobId: job.id }, 'Ingest job completed');
    return { ok: true };
  },
  { connection },
);

worker.on('completed', (job) => {
  logger.debug({ jobId: job.id, queue: 'ingest' }, 'Worker job completed');
});

worker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, queue: 'ingest', error: err.message }, 'Worker job failed');
});

logger.info('Ingest worker started');
