import 'dotenv/config';
import { Worker } from 'bullmq';
import env from '../env';
import { ingestDocuments, type IngestDocument } from '../services/ingest';
import { logger } from '../logger';
import IORedis from 'ioredis';

const connection = new IORedis(env.REDIS_URL);

const worker = new Worker(
  'ingest',
  async (job) => {
    type IngestJob = { workspaceId: string; documents: IngestDocument[] };
    const { workspaceId, documents } = job.data as IngestJob;

    logger.info(
      { workspaceId, docCount: documents.length, jobId: job.id },
      'Processing ingest job',
    );

    // Use the ingest service for transactional persistence
    const result = await ingestDocuments({
      workspaceId,
      documents,
    });

    logger.info(
      { workspaceId, docCount: result.documentCount, jobId: job.id },
      'Ingest job completed',
    );

    return { ok: true, ...result };
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
