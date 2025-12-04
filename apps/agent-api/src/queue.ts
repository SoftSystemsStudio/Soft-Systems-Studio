import { Queue, QueueEvents } from 'bullmq';
import { getRedisClient } from './lib/redis';
import { queueWaitingGauge, queueActiveGauge, queueFailedGauge } from './metrics';
import logger from './logger';

// Get the shared Redis connection
const connection = getRedisClient();

// Define job types
export type IngestJobData = {
  tenantId?: string;
  workspaceId?: string;
  documentId?: string;
  documents?: unknown[];
  source?: string;
  content?: string;
  metadata?: Record<string, unknown>;
};

export type EmailJobData = {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  templateId?: string;
  templateData?: Record<string, unknown>;
};

export type JobData = IngestJobData | EmailJobData;

// Queue definitions
export const ingestQueue = new Queue<IngestJobData>('ingest', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 500, // Keep last 500 failed jobs for debugging
  },
});

export const emailQueue = new Queue<EmailJobData>('email', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 50,
    removeOnFail: 200,
  },
});

// Queue events for logging
const ingestEvents = new QueueEvents('ingest', { connection });
const emailEvents = new QueueEvents('email', { connection });

ingestEvents.on('completed', ({ jobId }) => {
  logger.debug({ jobId, queue: 'ingest' }, 'Job completed');
});

ingestEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error({ jobId, queue: 'ingest', reason: failedReason }, 'Job failed');
});

emailEvents.on('completed', ({ jobId }) => {
  logger.debug({ jobId, queue: 'email' }, 'Email job completed');
});

emailEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error({ jobId, queue: 'email', reason: failedReason }, 'Email job failed');
});

// Helper functions to add jobs
export async function addIngestJob(
  data: IngestJobData,
  options?: { priority?: number; delay?: number },
) {
  return ingestQueue.add('ingest', data, {
    priority: options?.priority,
    delay: options?.delay,
  });
}

export async function addEmailJob(
  data: EmailJobData,
  options?: { priority?: number; delay?: number },
) {
  return emailQueue.add('send', data, {
    priority: options?.priority,
    delay: options?.delay,
  });
}

// Schedule a recurring job (e.g., daily cleanup)
export async function scheduleRecurringJob(
  queue: Queue,
  name: string,
  data: Record<string, unknown>,
  pattern: string, // cron pattern
) {
  // Remove existing scheduled job
  const repeatableJobs = await queue.getRepeatableJobs();
  const existing = repeatableJobs.find((job) => job.name === name);
  if (existing) {
    await queue.removeRepeatableByKey(existing.key);
  }

  // Add new scheduled job
  return queue.add(name, data, {
    repeat: { pattern },
  });
}

// Poll and update metrics periodically
async function updateMetrics() {
  try {
    const ingestCounts = await ingestQueue.getJobCounts();
    const emailCounts = await emailQueue.getJobCounts();

    queueWaitingGauge.set({ queue: 'ingest' }, ingestCounts.waiting || 0);
    queueActiveGauge.set({ queue: 'ingest' }, ingestCounts.active || 0);
    queueFailedGauge.set({ queue: 'ingest' }, ingestCounts.failed || 0);

    queueWaitingGauge.set({ queue: 'email' }, emailCounts.waiting || 0);
    queueActiveGauge.set({ queue: 'email' }, emailCounts.active || 0);
    queueFailedGauge.set({ queue: 'email' }, emailCounts.failed || 0);
  } catch (e) {
    // ignore metrics errors
  }
}

setInterval(() => {
  void updateMetrics();
}, 5000);

// Graceful shutdown
export async function closeQueues(): Promise<void> {
  await Promise.all([
    ingestQueue.close(),
    emailQueue.close(),
    ingestEvents.close(),
    emailEvents.close(),
  ]);
  logger.info('Queues closed');
}

export default {
  ingestQueue,
  emailQueue,
  addIngestJob,
  addEmailJob,
  scheduleRecurringJob,
  closeQueues,
  connection,
};
