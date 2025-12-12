import 'dotenv/config';
import { Worker } from 'bullmq';
import env from '../env';
import { ingestDocuments, type IngestDocument } from '../services/ingest';
import { logger } from '../logger';
import { jobRetryCounter } from '../metrics';
import IORedis from 'ioredis';

const connection = new IORedis(env.REDIS_URL);

const worker = new Worker(
  'ingest',
  async (job) => {
    type IngestJob = { workspaceId: string; documents: IngestDocument[]; ingestionId?: string };
    const { workspaceId, documents, ingestionId } = job.data as IngestJob;

    // Track retry attempts
    if (job.attemptsMade > 1) {
      jobRetryCounter.inc({ queue: 'ingest', attempt: job.attemptsMade.toString() });
      logger.warn(
        { workspaceId, jobId: job.id, attempt: job.attemptsMade },
        'Retrying ingest job',
      );
    }

    logger.info(
      { workspaceId, docCount: documents.length, jobId: job.id, ingestionId, attempt: job.attemptsMade },
      'Processing ingest job',
    );

    // Use the ingest service for transactional persistence
    const result = await ingestDocuments({
      workspaceId,
      documents,
      ingestionId,
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
