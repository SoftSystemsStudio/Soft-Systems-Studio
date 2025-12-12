import { Queue, QueueEvents } from 'bullmq';
import { getRedisClient } from './lib/redis';
import { 
  queueWaitingGauge, 
  queueActiveGauge, 
  queueFailedGauge,
  dlqDepthGauge,
  jobFailureCounter,
} from './metrics';
import logger from './logger';
import env from './env';

// Lazy connection - only connect when queues are actually used
let connection: ReturnType<typeof getRedisClient> | null = null;
function getConnection() {
  if (!connection) {
    connection = getRedisClient();
  }
  return connection;
}

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

// Queue definitions - use lazy getter
function createIngestQueue() {
  return new Queue<IngestJobData>('ingest', {
    connection: getConnection(),
    defaultJobOptions: {
      attempts: 5, // Increased from 3 to give more retry opportunities
      backoff: {
        type: 'exponential',
        delay: 2000, // Start with 2s delay
      },
      removeOnComplete: 100, // Keep last 100 completed jobs
      removeOnFail: false, // Never auto-remove failed jobs - they go to DLQ
    },
  });
}

// Dead Letter Queue for permanently failed ingestion jobs
function createIngestDLQ() {
  return new Queue<IngestJobData>('ingest-dlq', {
    connection: getConnection(),
    defaultJobOptions: {
      removeOnComplete: false, // Keep all DLQ entries for investigation
      removeOnFail: false,
    },
  });
}

function createEmailQueue() {
  return new Queue<EmailJobData>('email', {
    connection: getConnection(),
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
}

// Lazy queue instances
let _ingestQueue: Queue<IngestJobData> | null = null;
let _ingestDLQ: Queue<IngestJobData> | null = null;
let _emailQueue: Queue<EmailJobData> | null = null;
let _ingestEvents: QueueEvents | null = null;
let _emailEvents: QueueEvents | null = null;

export const ingestQueue = new Proxy({} as Queue<IngestJobData>, {
  get(_target, prop) {
    if (!_ingestQueue) _ingestQueue = createIngestQueue();
    return Reflect.get(_ingestQueue, prop);
  },
});

export const ingestDLQ = new Proxy({} as Queue<IngestJobData>, {
  get(_target, prop) {
    if (!_ingestDLQ) _ingestDLQ = createIngestDLQ();
    return Reflect.get(_ingestDLQ, prop);
  },
});

export const emailQueue = new Proxy({} as Queue<EmailJobData>, {
  get(_target, prop) {
    if (!_emailQueue) _emailQueue = createEmailQueue();
    return Reflect.get(_emailQueue, prop);
  },
});

// Queue events for logging - only create when accessed
function getIngestEvents() {
  if (!_ingestEvents) {
    _ingestEvents = new QueueEvents('ingest', { connection: getConnection() });
  }
  return _ingestEvents;
}

function getEmailEvents() {
  if (!_emailEvents) {
    _emailEvents = new QueueEvents('email', { connection: getConnection() });
  }
  return _emailEvents;
}

const ingestEvents = getIngestEvents();
const emailEvents = getEmailEvents();

ingestEvents.on('completed', ({ jobId }) => {
  logger.debug({ jobId, queue: 'ingest' }, 'Job completed');
});

ingestEvents.on('failed', async ({ jobId, failedReason }) => {
  logger.error({ jobId, queue: 'ingest', reason: failedReason }, 'Job failed');
  
  // Increment failure counter
  const job = await ingestQueue.getJob(jobId);
  if (job) {
    const attemptsMade = job.attemptsMade || 0;
    const maxAttempts = job.opts?.attempts || 5;
    const isFinal = attemptsMade >= maxAttempts;
    
    // Extract failure reason category
    const reason = extractFailureReason(failedReason);
    jobFailureCounter.inc({ queue: 'ingest', reason, final: isFinal ? 'true' : 'false' });
    
    // Move to DLQ if all retries exhausted
    if (isFinal) {
      logger.warn(
        { 
          jobId, 
          workspaceId: job.data.workspaceId,
          ingestionId: job.data.ingestionId,
          attempts: attemptsMade,
          reason: failedReason,
        },
        'Job exhausted all retries, moving to DLQ',
      );
      
      try {
        await ingestDLQ.add('dlq-entry', {
          ...job.data,
          metadata: {
            ...job.data.metadata,
            originalJobId: jobId,
            failedReason,
            attemptsMade,
            failedAt: new Date().toISOString(),
          },
        });
        logger.info({ jobId, dlqJobId: jobId }, 'Job moved to DLQ');
      } catch (dlqError) {
        logger.error({ jobId, error: dlqError }, 'Failed to move job to DLQ');
      }
    }
  }
});

// Track retry attempts
ingestEvents.on('retries-exhausted', ({ jobId }) => {
  logger.error({ jobId, queue: 'ingest' }, 'Job retries exhausted');
});

/**
 * Extract categorized failure reason from error message
 */
function extractFailureReason(errorMessage: string): string {
  if (!errorMessage) return 'unknown';
  
  const msg = errorMessage.toLowerCase();
  if (msg.includes('workspace not found')) return 'workspace_not_found';
  if (msg.includes('qdrant')) return 'qdrant_error';
  if (msg.includes('database') || msg.includes('prisma')) return 'database_error';
  if (msg.includes('timeout')) return 'timeout';
  if (msg.includes('validation')) return 'validation_error';
  
  return 'unknown';
}

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
    const dlqCounts = await ingestDLQ.getJobCounts();

    queueWaitingGauge.set({ queue: 'ingest' }, ingestCounts.waiting || 0);
    queueActiveGauge.set({ queue: 'ingest' }, ingestCounts.active || 0);
    queueFailedGauge.set({ queue: 'ingest' }, ingestCounts.failed || 0);

    queueWaitingGauge.set({ queue: 'email' }, emailCounts.waiting || 0);
    queueActiveGauge.set({ queue: 'email' }, emailCounts.active || 0);
    queueFailedGauge.set({ queue: 'email' }, emailCounts.failed || 0);
    
    // Track DLQ depth
    dlqDepthGauge.set(
      { queue: 'ingest' },
      (dlqCounts.waiting || 0) + (dlqCounts.active || 0) + (dlqCounts.completed || 0)
    );
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
    ingestDLQ.close(),
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
  ingestDLQ,
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
