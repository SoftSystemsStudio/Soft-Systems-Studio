---
name: queue-job
description: Use when implementing background jobs with BullMQ/Redis. Covers creating job types, workers, retry patterns, and dead-letter queue handling.
---

# Queue Job Skill

## Overview

This project uses BullMQ with Redis for background job processing. Queue setup is in `/apps/agent-api/src/queue.ts`.

## Creating a New Job Type

### 1. Define Job Data Interface

```typescript
// types/jobs.ts
export interface MyJobData {
  workspaceId: string;
  userId: string;
  payload: {
    // Job-specific data
  };
}
```

### 2. Add Job to Queue

```typescript
import { queue } from '../queue';

await queue.add('my-job-type', {
  workspaceId,
  userId,
  payload: { ... }
}, {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000  // Base delay in ms
  },
  removeOnComplete: 100,  // Keep last 100 completed
  removeOnFail: 1000,     // Keep last 1000 failed
});
```

### 3. Create Worker

```typescript
// worker/myJobWorker.ts
import { Worker, Job } from 'bullmq';
import { redis } from '../redis';
import { logger } from '../logger';
import { extractFailureReason } from '../utils/jobErrors';

export const myJobWorker = new Worker(
  'main-queue',
  async (job: Job<MyJobData>) => {
    if (job.name !== 'my-job-type') return;

    const { workspaceId, userId, payload } = job.data;

    logger.info(
      {
        jobId: job.id,
        workspaceId,
        userId,
      },
      'Processing my-job-type',
    );

    try {
      // Job logic here
      await processMyJob(payload);

      logger.info({ jobId: job.id }, 'Job completed');
    } catch (error) {
      logger.error(
        {
          jobId: job.id,
          error: extractFailureReason(error),
        },
        'Job failed',
      );
      throw error; // Let BullMQ handle retry
    }
  },
  { connection: redis },
);
```

## Retry Strategy

Use exponential backoff for transient failures:

```typescript
{
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000  // 2s, 4s, 8s
  }
}
```

## Dead Letter Queue (DLQ)

Move permanently failed jobs to DLQ:

```typescript
import { dlqQueue } from '../queue';

myJobWorker.on('failed', async (job, error) => {
  if (job.attemptsMade >= job.opts.attempts) {
    await dlqQueue.add('failed-job', {
      originalJob: job.name,
      data: job.data,
      error: extractFailureReason(error),
      failedAt: new Date().toISOString(),
    });

    logger.warn(
      {
        jobId: job.id,
        jobName: job.name,
      },
      'Job moved to DLQ',
    );
  }
});
```

## Prometheus Metrics

Update metrics for monitoring:

```typescript
import {
  queueWaitingGauge,
  queueActiveGauge,
  queueFailedGauge,
  dlqDepthGauge,
  jobFailureCounter,
} from '../metrics';

// On job completion
queueActiveGauge.dec();

// On job failure
jobFailureCounter.inc({ job_type: job.name });
queueFailedGauge.inc();
```

## Graceful Shutdown

Register shutdown handlers:

```typescript
import { registerQueueShutdownHandlers } from '../queue';

// In app startup
registerQueueShutdownHandlers();
```

## Testing Jobs

```typescript
describe('MyJobWorker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process job successfully', async () => {
    const job = {
      id: 'test-job-1',
      name: 'my-job-type',
      data: { workspaceId: 'ws-1', userId: 'user-1', payload: {} },
      attemptsMade: 0,
      opts: { attempts: 3 },
    };

    await myJobWorker.process(job);

    expect(mockService.process).toHaveBeenCalledWith(job.data.payload);
  });
});
```

## Related Files

- Queue setup: `/apps/agent-api/src/queue.ts`
- Workers: `/apps/agent-api/src/worker/`
- Redis config: `/apps/agent-api/src/redis.ts`
- Metrics: `/apps/agent-api/src/metrics.ts`
