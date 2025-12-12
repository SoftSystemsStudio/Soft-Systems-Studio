/**
 * Dead Letter Queue Management
 * Utilities for inspecting and recovering from failed ingestion jobs
 */
import { ingestDLQ, ingestQueue, type IngestJobData } from '../queue';
import { logger } from '../logger';

export interface DLQJob {
  id: string;
  data: IngestJobData;
  timestamp: number;
  failedReason?: string;
  attemptsMade?: number;
}

/**
 * Get all jobs in the DLQ
 */
export async function getDLQJobs(limit = 100): Promise<DLQJob[]> {
  const jobs = await ingestDLQ.getJobs(['waiting', 'active', 'completed'], 0, limit - 1);

  return jobs.map((job) => ({
    id: job.id || 'unknown',
    data: job.data,
    timestamp: job.timestamp,
    failedReason: job.data.metadata?.failedReason as string | undefined,
    attemptsMade: job.data.metadata?.attemptsMade as number | undefined,
  }));
}

/**
 * Get DLQ statistics
 */
export async function getDLQStats() {
  const counts = await ingestDLQ.getJobCounts();
  const jobs = await getDLQJobs(1000);

  // Count failures by reason
  const failuresByReason: Record<string, number> = {};
  jobs.forEach((job) => {
    const reason = job.failedReason || 'unknown';
    failuresByReason[reason] = (failuresByReason[reason] || 0) + 1;
  });

  return {
    total: jobs.length,
    waiting: counts.waiting || 0,
    active: counts.active || 0,
    completed: counts.completed || 0,
    failuresByReason,
  };
}

/**
 * Retry a specific job from the DLQ
 * Removes the original DLQ entry and re-queues to main queue
 */
export async function retryDLQJob(jobId: string): Promise<{ success: boolean; newJobId?: string }> {
  const job = await ingestDLQ.getJob(jobId);

  if (!job) {
    logger.warn({ jobId }, 'DLQ job not found');
    return { success: false };
  }

  try {
    // Extract original job data (without DLQ metadata)
    const { metadata, ...originalData } = job.data;
    const cleanData: IngestJobData = {
      ...originalData,
      metadata: metadata
        ? Object.fromEntries(
            Object.entries(metadata).filter(
              ([key]) =>
                !['originalJobId', 'failedReason', 'attemptsMade', 'failedAt'].includes(key),
            ),
          )
        : undefined,
    };

    // Re-queue to main ingest queue
    const newJob = await ingestQueue.add('retry', cleanData, {
      priority: 1, // Higher priority for retries
    });

    // Remove from DLQ
    await job.remove();

    logger.info(
      {
        dlqJobId: jobId,
        newJobId: newJob.id,
        workspaceId: cleanData.workspaceId,
      },
      'DLQ job re-queued successfully',
    );

    return { success: true, newJobId: newJob.id };
  } catch (error) {
    logger.error({ jobId, error }, 'Failed to retry DLQ job');
    return { success: false };
  }
}

/**
 * Retry all jobs in the DLQ
 * Use with caution - may cause load spike
 */
export async function retryAllDLQJobs(maxJobs = 100): Promise<{
  attempted: number;
  succeeded: number;
  failed: number;
}> {
  const jobs = await getDLQJobs(maxJobs);

  let succeeded = 0;
  let failed = 0;

  logger.info({ totalJobs: jobs.length }, 'Starting bulk DLQ retry');

  for (const job of jobs) {
    const result = await retryDLQJob(job.id);
    if (result.success) {
      succeeded++;
    } else {
      failed++;
    }

    // Add small delay to avoid overwhelming the system
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  logger.info({ attempted: jobs.length, succeeded, failed }, 'Bulk DLQ retry completed');

  return {
    attempted: jobs.length,
    succeeded,
    failed,
  };
}

/**
 * Purge old DLQ entries (for jobs that can't be recovered)
 * @param olderThanDays - Remove entries older than this many days
 */
export async function purgeDLQEntries(olderThanDays = 30): Promise<number> {
  const jobs = await getDLQJobs(10000);
  const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;

  let purged = 0;

  for (const job of jobs) {
    if (job.timestamp < cutoffTime) {
      const fullJob = await ingestDLQ.getJob(job.id);
      if (fullJob) {
        await fullJob.remove();
        purged++;
      }
    }
  }

  logger.info({ purged, olderThanDays }, 'DLQ entries purged');

  return purged;
}

/**
 * Get detailed information about a specific DLQ job
 */
export async function inspectDLQJob(jobId: string) {
  const job = await ingestDLQ.getJob(jobId);

  if (!job) {
    return null;
  }

  return {
    id: job.id,
    data: job.data,
    timestamp: job.timestamp,
    processedOn: job.processedOn,
    finishedOn: job.finishedOn,
    attemptsMade: job.attemptsMade,
    failedReason: job.failedReason,
    stacktrace: job.stacktrace,
  };
}
