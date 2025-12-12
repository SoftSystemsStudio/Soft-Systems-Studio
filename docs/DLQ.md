# Dead Letter Queue (DLQ) Documentation

## Overview

The ingestion queue uses a Dead Letter Queue (DLQ) system to handle permanently failed jobs and prevent silent data loss. When an ingestion job exhausts all retry attempts, it's automatically moved to the DLQ for investigation and manual recovery.

## Architecture

```
┌─────────────────┐
│  Ingest Queue   │
│   (main queue)  │
└────────┬────────┘
         │
         │ Job fails
         ▼
   ┌──────────┐
   │  Retry   │ ◄── Exponential backoff
   │  Logic   │     (2s, 4s, 8s, 16s, 32s)
   └────┬─────┘
        │
        │ 5 attempts exhausted
        ▼
┌─────────────────┐
│   Ingest DLQ    │ ◄── Permanent failure storage
│   (ingest-dlq)  │     Manual recovery required
└─────────────────┘
```

## Configuration

### Retry Policy

- **Max Attempts**: 5 (increased from 3)
- **Backoff Strategy**: Exponential with 2s initial delay
- **Backoff Sequence**: 2s → 4s → 8s → 16s → 32s
- **Total Retry Time**: ~62 seconds before DLQ

### DLQ Behavior

- **Auto-removal**: Disabled - failed jobs are never automatically deleted
- **Storage**: Indefinite - jobs remain until manually processed or purged
- **Metadata**: Includes original job ID, failure reason, attempt count, failure timestamp

## Metrics

### DLQ Depth Gauge

```prometheus
job_dlq_depth{queue="ingest"}
```

Tracks total number of jobs in DLQ (waiting + active + completed).

**Alert Threshold**: Set alerts when depth > 10 for investigation.

### Job Failure Counter

```prometheus
job_failures_total{queue="ingest",reason="qdrant_error",final="true"}
```

Tracks failures by reason and whether it was the final attempt.

**Labels**:

- `queue`: Queue name (ingest, email)
- `reason`: Categorized failure (see Failure Categorization below)
- `final`: "true" if DLQ-bound, "false" if will retry

### Job Retry Counter

```prometheus
job_retries_total{queue="ingest",attempt="2"}
```

Tracks retry attempts by attempt number.

**Usage**: Monitor retry patterns to identify systemic issues.

## Failure Categorization

DLQ automatically categorizes failures for easier debugging:

| Category              | Examples                             | Recovery Action                            |
| --------------------- | ------------------------------------ | ------------------------------------------ |
| `workspace_not_found` | Invalid workspace ID                 | Verify workspace exists, manually fix data |
| `qdrant_error`        | Connection timeout, indexing failure | Check Qdrant health, retry when recovered  |
| `database_error`      | Prisma connection failure            | Check Postgres health, retry               |
| `timeout`             | Long-running operations              | Review document size, increase timeout     |
| `validation_error`    | Malformed input data                 | Fix upstream data source                   |
| `unknown`             | Unrecognized errors                  | Manual investigation required              |

## Operations

### CLI Commands

#### View DLQ Statistics

```bash
pnpm dlq:stats
```

Shows total jobs, failure breakdown by reason.

**Output**:

```
📊 DLQ Statistics:
Total jobs: 42
Waiting: 42
Active: 0
Completed: 0

Failures by reason:
  qdrant_error: 30
  workspace_not_found: 8
  timeout: 4
```

#### List DLQ Jobs

```bash
pnpm dlq:list [limit]
```

Lists DLQ jobs with details (default: 20, max recommended: 100).

**Example**:

```bash
pnpm dlq:list 50  # Show 50 most recent jobs
```

#### Inspect Specific Job

```bash
pnpm dlq:inspect <jobId>
```

Shows full job details including stacktrace.

**Example**:

```bash
pnpm dlq:inspect 42
```

#### Retry Single Job

```bash
pnpm dlq:retry <jobId>
```

Re-queues a specific job to the main ingest queue with high priority.

**Use Case**: After fixing root cause (e.g., Qdrant recovered), retry individual jobs.

#### Retry All DLQ Jobs

```bash
pnpm dlq:retry-all [limit]
```

Bulk retry with rate limiting (100ms delay between jobs, default limit: 100).

⚠️ **Caution**: May cause load spike. Use during maintenance windows.

**Example**:

```bash
pnpm dlq:retry-all 200  # Retry up to 200 jobs
```

#### Purge Old Entries

```bash
pnpm dlq:purge [days]
```

Removes entries older than N days (default: 30).

**Use Case**: Cleanup after resolved incidents or unrecoverable failures.

**Example**:

```bash
pnpm dlq:purge 60  # Remove entries older than 60 days
```

### Programmatic Access

```typescript
import { getDLQJobs, getDLQStats, retryDLQJob, inspectDLQJob } from './lib/dlq';

// Get statistics
const stats = await getDLQStats();
console.log(`DLQ depth: ${stats.total}`);

// List failed jobs
const jobs = await getDLQJobs(50);
jobs.forEach((job) => {
  console.log(`${job.id}: ${job.failedReason}`);
});

// Retry specific job
const result = await retryDLQJob('job-123');
if (result.success) {
  console.log(`Retried as ${result.newJobId}`);
}

// Inspect job details
const details = await inspectDLQJob('job-456');
console.log(details?.stacktrace);
```

## Monitoring & Alerts

### Recommended Prometheus Alerts

#### DLQ Depth Alert

```yaml
- alert: DLQDepthHigh
  expr: job_dlq_depth{queue="ingest"} > 10
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: 'Ingestion DLQ depth is high'
    description: '{{ $value }} jobs in DLQ - investigate failures'
```

#### DLQ Growth Rate Alert

```yaml
- alert: DLQGrowthRateHigh
  expr: rate(job_dlq_depth{queue="ingest"}[5m]) > 0.1
  for: 10m
  labels:
    severity: critical
  annotations:
    summary: 'DLQ is growing rapidly'
    description: 'DLQ growth rate: {{ $value }} jobs/sec'
```

#### High Failure Rate Alert

```yaml
- alert: JobFailureRateHigh
  expr: rate(job_failures_total{queue="ingest",final="true"}[5m]) > 0.05
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: 'High ingestion failure rate'
    description: '{{ $value }} final failures/sec'
```

### Grafana Dashboard Panels

**DLQ Depth Over Time**:

```promql
job_dlq_depth{queue="ingest"}
```

**Failures by Reason**:

```promql
sum by (reason) (increase(job_failures_total{queue="ingest",final="true"}[1h]))
```

**Retry Success Rate**:

```promql
(
  sum(rate(job_queue_completed{queue="ingest"}[5m]))
  /
  (sum(rate(job_queue_completed{queue="ingest"}[5m])) + sum(rate(job_failures_total{queue="ingest",final="true"}[5m])))
) * 100
```

**Average Retry Attempts**:

```promql
sum(rate(job_retries_total{queue="ingest"}[5m]))
/
sum(rate(job_failures_total{queue="ingest"}[5m]))
```

## Incident Response

### Scenario 1: Qdrant Outage

**Symptoms**:

- DLQ depth growing
- Most failures: `qdrant_error`

**Response**:

1. Check Qdrant health: `curl http://qdrant:6333/health`
2. Fix Qdrant connectivity/capacity
3. Verify recovery: `pnpm dlq:stats`
4. Bulk retry: `pnpm dlq:retry-all`

### Scenario 2: Invalid Workspace IDs

**Symptoms**:

- Steady DLQ growth
- Failures: `workspace_not_found`

**Response**:

1. Inspect failed jobs: `pnpm dlq:list 50`
2. Identify pattern in workspace IDs
3. Fix upstream data source
4. Manually clean DLQ: `pnpm dlq:purge 7`

### Scenario 3: Memory/Timeout Issues

**Symptoms**:

- Sporadic failures
- Reason: `timeout` or `unknown`

**Response**:

1. Inspect job sizes: `pnpm dlq:inspect <jobId>`
2. Review document sizes in job data
3. Consider splitting large batches
4. Increase worker resources if needed
5. Retry after optimization: `pnpm dlq:retry-all`

## Best Practices

### Development

1. **Always test failure paths** - Ensure DLQ moves happen correctly
2. **Simulate retries** - Test exponential backoff behavior
3. **Log contextually** - Include workspace ID, ingestion ID in all logs

### Operations

1. **Monitor DLQ depth daily** - Zero is ideal, <10 is acceptable
2. **Investigate spikes immediately** - Pattern may indicate systemic issue
3. **Retry after root cause fix** - Don't retry blindly
4. **Purge resolved entries** - Keep DLQ clean for signal clarity

### Alerting

1. **Alert on depth** - Threshold: >10 for 5 minutes
2. **Alert on growth rate** - Indicates active incident
3. **Alert on specific reasons** - Some categories need immediate attention

## Troubleshooting

### Q: Job stuck in DLQ, but root cause fixed?

**A**: Use `pnpm dlq:retry <jobId>` to manually re-queue.

### Q: DLQ depth growing too fast?

**A**:

1. Check Prometheus metrics for failure reasons
2. Inspect recent jobs: `pnpm dlq:list 20`
3. Address root cause before retrying

### Q: Can I prevent certain failures from going to DLQ?

**A**: Not directly, but you can:

1. Increase retry attempts (edit queue config)
2. Add pre-validation before queueing
3. Implement circuit breaker for upstream services

### Q: What's the maximum safe DLQ depth?

**A**: No hard limit, but:

- <10: Normal operations
- 10-50: Investigate within 24h
- 50-100: Active incident, investigate immediately
- > 100: Critical, potential data loss risk

### Q: How to recover from bulk data corruption?

**A**:

1. Stop producer: `systemctl stop data-ingestion-service`
2. Purge corrupt entries: `pnpm dlq:purge 1`
3. Fix data source
4. Restart producer
5. Manually re-ingest if needed

## Schema Reference

### DLQ Job Metadata

```typescript
{
  workspaceId: string;
  documents: IngestDocument[];
  ingestionId?: string;
  metadata: {
    originalJobId: string;      // Job ID from main queue
    failedReason: string;        // Error message
    attemptsMade: number;        // Total retry attempts (5)
    failedAt: string;            // ISO timestamp
    // ...original metadata preserved
  }
}
```

## Related Documentation

- [Queue Architecture](./ARCHITECTURE.md#queue-system)
- [Monitoring & Metrics](./METRICS_PROMETHEUS.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Security Considerations](./SECURITY.md)
