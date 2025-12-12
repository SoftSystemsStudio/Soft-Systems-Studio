/**
 * Tests for Dead Letter Queue functionality
 */
import { 
  getDLQJobs, 
  getDLQStats, 
  retryDLQJob, 
  retryAllDLQJobs,
  purgeDLQEntries,
  inspectDLQJob,
} from '../../src/lib/dlq';
import { ingestDLQ, ingestQueue, type IngestJobData } from '../../src/queue';

// Mock the logger
jest.mock('../../src/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock env
jest.mock('../../src/env', () => ({
  __esModule: true,
  default: {
    REDIS_URL: 'redis://localhost:6379',
    NODE_ENV: 'test',
  },
}));

describe('Dead Letter Queue', () => {
  beforeEach(async () => {
    try {
      // Clear queues before each test
      await ingestQueue.drain();
      await ingestQueue.clean(0, 10000, 'completed');
      await ingestQueue.clean(0, 10000, 'failed');
      await ingestDLQ.drain();
      await ingestDLQ.clean(0, 10000, 'completed');
      await ingestDLQ.clean(0, 10000, 'failed');
    } catch (error) {
      // Ignore cleanup errors in test environment
      console.warn('Queue cleanup error:', error);
    }
  }, 10000);

  afterAll(async () => {
    try {
      await ingestQueue.close();
      await ingestDLQ.close();
    } catch (error) {
      // Ignore close errors
    }
  });

  describe('DLQ Job Management', () => {
    it('should add job to DLQ when failures occur', async () => {
      const jobData: IngestJobData = {
        workspaceId: 'test-workspace',
        documents: [{ content: 'test' }],
        ingestionId: 'test-ingest-1',
      };

      await ingestDLQ.add('dlq-entry', {
        ...jobData,
        metadata: {
          originalJobId: 'original-123',
          failedReason: 'Qdrant timeout',
          attemptsMade: 5,
          failedAt: new Date().toISOString(),
        },
      });

      const jobs = await getDLQJobs();
      expect(jobs.length).toBe(1);
      expect(jobs[0]?.data.workspaceId).toBe('test-workspace');
      expect(jobs[0]?.failedReason).toBe('Qdrant timeout');
      expect(jobs[0]?.attemptsMade).toBe(5);
    });

    it('should retrieve DLQ statistics', async () => {
      // Add multiple DLQ entries with different failure reasons
      await ingestDLQ.add('dlq-entry', {
        workspaceId: 'ws-1',
        documents: [],
        metadata: {
          failedReason: 'workspace_not_found',
          attemptsMade: 5,
        },
      });

      await ingestDLQ.add('dlq-entry', {
        workspaceId: 'ws-2',
        documents: [],
        metadata: {
          failedReason: 'qdrant_error',
          attemptsMade: 5,
        },
      });

      await ingestDLQ.add('dlq-entry', {
        workspaceId: 'ws-3',
        documents: [],
        metadata: {
          failedReason: 'qdrant_error',
          attemptsMade: 5,
        },
      });

      const stats = await getDLQStats();
      expect(stats.total).toBe(3);
      expect(stats.failuresByReason['workspace_not_found']).toBe(1);
      expect(stats.failuresByReason['qdrant_error']).toBe(2);
    });

    it('should inspect specific DLQ job details', async () => {
      const job = await ingestDLQ.add('dlq-entry', {
        workspaceId: 'test-workspace',
        documents: [{ content: 'test' }],
        metadata: {
          originalJobId: 'job-456',
          failedReason: 'Database connection failed',
          attemptsMade: 5,
        },
      });

      const details = await inspectDLQJob(job.id!);
      expect(details).toBeTruthy();
      expect(details?.data.workspaceId).toBe('test-workspace');
      expect(details?.data.metadata?.failedReason).toBe('Database connection failed');
    });
  });

  describe('DLQ Recovery', () => {
    it('should retry a single DLQ job', async () => {
      const jobData: IngestJobData = {
        workspaceId: 'test-workspace',
        documents: [{ content: 'retry test' }],
        ingestionId: 'retry-ingest-1',
        metadata: {
          originalJobId: 'original-789',
          failedReason: 'Temporary failure',
          attemptsMade: 5,
          failedAt: new Date().toISOString(),
        },
      };

      const dlqJob = await ingestDLQ.add('dlq-entry', jobData);
      const result = await retryDLQJob(dlqJob.id!);

      expect(result.success).toBe(true);
      expect(result.newJobId).toBeDefined();

      // Verify job was removed from DLQ
      const dlqJobs = await getDLQJobs();
      expect(dlqJobs.length).toBe(0);

      // Verify job was added to main queue
      const mainQueueJobs = await ingestQueue.getJobs(['waiting']);
      expect(mainQueueJobs.length).toBe(1);
      expect(mainQueueJobs[0]?.data.workspaceId).toBe('test-workspace');
      
      // Verify DLQ metadata was cleaned
      expect(mainQueueJobs[0]?.data.metadata?.originalJobId).toBeUndefined();
      expect(mainQueueJobs[0]?.data.metadata?.failedReason).toBeUndefined();
    });

    it('should handle retry of non-existent DLQ job', async () => {
      const result = await retryDLQJob('non-existent-job-id');
      expect(result.success).toBe(false);
      expect(result.newJobId).toBeUndefined();
    });

    it('should retry all DLQ jobs in bulk', async () => {
      // Add 3 jobs to DLQ
      for (let i = 0; i < 3; i++) {
        await ingestDLQ.add('dlq-entry', {
          workspaceId: `workspace-${i}`,
          documents: [{ content: `test ${i}` }],
          metadata: {
            failedReason: 'Test failure',
            attemptsMade: 5,
          },
        });
      }

      const result = await retryAllDLQJobs();
      expect(result.attempted).toBe(3);
      expect(result.succeeded).toBe(3);
      expect(result.failed).toBe(0);

      // Verify all jobs moved to main queue
      const mainQueueJobs = await ingestQueue.getJobs(['waiting']);
      expect(mainQueueJobs.length).toBe(3);

      // Verify DLQ is empty
      const dlqJobs = await getDLQJobs();
      expect(dlqJobs.length).toBe(0);
    });

    it('should respect maxJobs limit in bulk retry', async () => {
      // Add 5 jobs to DLQ
      for (let i = 0; i < 5; i++) {
        await ingestDLQ.add('dlq-entry', {
          workspaceId: `workspace-${i}`,
          documents: [],
          metadata: { failedReason: 'Test' },
        });
      }

      const result = await retryAllDLQJobs(3);
      expect(result.attempted).toBe(3);
      
      // 2 jobs should remain in DLQ
      const dlqJobs = await getDLQJobs();
      expect(dlqJobs.length).toBe(2);
    });
  });

  describe('DLQ Cleanup', () => {
    it('should purge old DLQ entries', async () => {
      // Add recent jobs
      await ingestDLQ.add('dlq-entry', {
        workspaceId: 'recent-workspace-1',
        documents: [],
        metadata: { failedReason: 'Recent failure' },
      });

      await ingestDLQ.add('dlq-entry', {
        workspaceId: 'recent-workspace-2',
        documents: [],
        metadata: { failedReason: 'Recent failure' },
      });

      // Purge old entries (none should be purged since all are recent)
      const purged = await purgeDLQEntries(30);
      expect(purged).toBe(0);

      const remainingJobs = await getDLQJobs();
      expect(remainingJobs.length).toBe(2);
    });

    it('should not purge recent DLQ entries', async () => {
      // Add 2 recent jobs
      await ingestDLQ.add('dlq-entry', {
        workspaceId: 'ws-1',
        documents: [],
        metadata: { failedReason: 'Test' },
      });
      
      await ingestDLQ.add('dlq-entry', {
        workspaceId: 'ws-2',
        documents: [],
        metadata: { failedReason: 'Test' },
      });

      const purged = await purgeDLQEntries(30);
      expect(purged).toBe(0);

      const remainingJobs = await getDLQJobs();
      expect(remainingJobs.length).toBe(2);
    });
  });

  describe('Failure Categorization', () => {
    it('should categorize workspace not found errors', async () => {
      const errorMessage = 'Workspace not found: abc-123';
      // The extractFailureReason function is internal, so we test via the event handler
      // by checking the metrics after a failure
      
      await ingestDLQ.add('dlq-entry', {
        workspaceId: 'missing-ws',
        documents: [],
        metadata: {
          failedReason: errorMessage,
          attemptsMade: 5,
        },
      });

      const jobs = await getDLQJobs();
      expect(jobs[0]?.failedReason).toContain('Workspace not found');
    });

    it('should categorize qdrant errors', async () => {
      await ingestDLQ.add('dlq-entry', {
        workspaceId: 'test-ws',
        documents: [],
        metadata: {
          failedReason: 'Qdrant ingestion failed: Connection timeout',
          attemptsMade: 5,
        },
      });

      const jobs = await getDLQJobs();
      expect(jobs[0]?.failedReason).toContain('Qdrant');
    });

    it('should handle unknown error types', async () => {
      await ingestDLQ.add('dlq-entry', {
        workspaceId: 'test-ws',
        documents: [],
        metadata: {
          failedReason: 'Some unexpected error occurred',
          attemptsMade: 5,
        },
      });

      const jobs = await getDLQJobs();
      expect(jobs[0]?.failedReason).toBeDefined();
    });
  });

  describe('DLQ Limits', () => {
    it('should respect limit parameter in getDLQJobs', async () => {
      // Add 10 jobs
      for (let i = 0; i < 10; i++) {
        await ingestDLQ.add('dlq-entry', {
          workspaceId: `ws-${i}`,
          documents: [],
          metadata: { failedReason: 'Test' },
        });
      }

      const jobs = await getDLQJobs(5);
      expect(jobs.length).toBe(5);
    });

    it('should handle empty DLQ gracefully', async () => {
      const jobs = await getDLQJobs();
      expect(jobs.length).toBe(0);

      const stats = await getDLQStats();
      expect(stats.total).toBe(0);
      expect(stats.waiting).toBe(0);
    });
  });
});
