import { Queue, QueueEvents } from 'bullmq';
import { getRedisClient } from './lib/redis';
import { queueWaitingGauge, queueActiveGauge, queueFailedGauge } from './metrics';
import logger from './logger';
import env from './env';

// Get the shared Redis connection
const connection = getRedisClient();

// Define job types
export type IngestJobData = {
  tenantId?: string;
  workspaceId?: string;
  documentId?: string;
  documents?: unknown[];
  ingestionId?: string;
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

// Track the metrics interval for cleanup
let metricsInterval: NodeJS.Timeout | null = null;

/**
 * Determine if queue metrics should be enabled based on server role and explicit flag
 */
function shouldEnableQueueMetrics(): boolean {
  // Explicit flag takes precedence
  if (env.ENABLE_QUEUE_METRICS) {
    return true;
  }

  // Auto-enable for worker and all roles
  if (env.SERVER_ROLE === 'worker' || env.SERVER_ROLE === 'all') {
    return true;
  }

  // Disable for pure API servers and test environment
  if (env.NODE_ENV === 'test') {
    return false;
  }

  return false;
}

/**
 * Start the queue metrics polling interval
 * Only starts if enabled by server role or explicit flag
 */
export function startQueueMetrics(): void {
  if (metricsInterval) {
    logger.debug('Queue metrics already running');
    return;
  }

  if (!shouldEnableQueueMetrics()) {
    logger.debug(
      { serverRole: env.SERVER_ROLE, enableFlag: env.ENABLE_QUEUE_METRICS },
      'Queue metrics disabled for this server role',
    );
    return;
  }

  metricsInterval = setInterval(() => {
    void updateMetrics();
  }, 5000);

  // Ensure interval doesn't prevent Node from exiting
  metricsInterval.unref();

  logger.info({ serverRole: env.SERVER_ROLE }, 'Queue metrics polling started');
}

/**
 * Stop the queue metrics polling interval
 */
export function stopQueueMetrics(): void {
  if (metricsInterval) {
    clearInterval(metricsInterval);
    metricsInterval = null;
    logger.debug('Queue metrics polling stopped');
  }
}

// Graceful shutdown
export async function closeQueues(): Promise<void> {
  // Stop metrics polling first
  stopQueueMetrics();

  await Promise.all([
    ingestQueue.close(),
    emailQueue.close(),
    ingestEvents.close(),
    emailEvents.close(),
  ]);
  logger.info('Queues closed');
}

/**
 * Graceful shutdown handler for the entire queue system
 * Call this on process exit signals
 */
export async function gracefulShutdown(): Promise<void> {
  logger.info('Queue system shutting down...');
  await closeQueues();
}

// Track whether shutdown handlers have been registered
let shutdownHandlersRegistered = false;

/**
 * Register shutdown handlers for graceful queue cleanup
 * Call this explicitly from your main entry point
 * Opt-in pattern prevents duplicate handlers and test interference
 */
export function registerQueueShutdownHandlers(): void {
  if (shutdownHandlersRegistered) {
    logger.debug('Queue shutdown handlers already registered');
    return;
  }

  // Don't register in test environment
  if (env.NODE_ENV === 'test') {
    logger.debug('Skipping shutdown handler registration in test environment');
    return;
  }

  // Handle process termination signals
  const shutdownSignals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];

  shutdownSignals.forEach((signal) => {
    process.on(signal, () => {
      logger.info({ signal }, 'Received shutdown signal');
      void gracefulShutdown().then(() => {
        process.exit(0);
      });
    });
  });

  // Handle uncaught exceptions - close queues before crashing
  process.on('uncaughtException', (error) => {
    logger.error({ error }, 'Uncaught exception, shutting down queues');
    void gracefulShutdown().finally(() => {
      process.exit(1);
    });
  });

  shutdownHandlersRegistered = true;
  logger.info('Queue shutdown handlers registered');
}

export default {
  ingestQueue,
  emailQueue,
  addIngestJob,
  addEmailJob,
  scheduleRecurringJob,
  closeQueues,
  gracefulShutdown,
  registerQueueShutdownHandlers,
  startQueueMetrics,
  stopQueueMetrics,
  connection,
};
