#!/usr/bin/env ts-node
/**
 * DLQ Management CLI
 * Command-line utility for inspecting and managing the dead letter queue
 * 
 * Usage:
 *   pnpm dlq:stats              - Show DLQ statistics
 *   pnpm dlq:list [limit]       - List DLQ jobs (default: 20)
 *   pnpm dlq:inspect <jobId>    - Inspect specific job details
 *   pnpm dlq:retry <jobId>      - Retry a specific job
 *   pnpm dlq:retry-all [limit]  - Retry all DLQ jobs (default: 100)
 *   pnpm dlq:purge [days]       - Purge jobs older than N days (default: 30)
 */

import 'dotenv/config';
import {
  getDLQJobs,
  getDLQStats,
  retryDLQJob,
  retryAllDLQJobs,
  purgeDLQEntries,
  inspectDLQJob,
} from '../src/lib/dlq';
import { closeQueues } from '../src/queue';

const command = process.argv[2];
const arg1 = process.argv[3];

async function main() {
  try {
    switch (command) {
      case 'stats': {
        const stats = await getDLQStats();
        console.log('\n📊 DLQ Statistics:');
        console.log(`Total jobs: ${stats.total}`);
        console.log(`Waiting: ${stats.waiting}`);
        console.log(`Active: ${stats.active}`);
        console.log(`Completed: ${stats.completed}`);
        console.log('\nFailures by reason:');
        Object.entries(stats.failuresByReason).forEach(([reason, count]) => {
          console.log(`  ${reason}: ${count}`);
        });
        break;
      }

      case 'list': {
        const limit = arg1 ? parseInt(arg1, 10) : 20;
        const jobs = await getDLQJobs(limit);
        console.log(`\n📋 DLQ Jobs (showing ${jobs.length}):\n`);
        
        if (jobs.length === 0) {
          console.log('  No jobs in DLQ ✅');
        } else {
          jobs.forEach((job, idx) => {
            console.log(`${idx + 1}. Job ID: ${job.id}`);
            console.log(`   Workspace: ${job.data.workspaceId}`);
            console.log(`   Ingestion ID: ${job.data.ingestionId || 'N/A'}`);
            console.log(`   Failed Reason: ${job.failedReason || 'unknown'}`);
            console.log(`   Attempts: ${job.attemptsMade || 'N/A'}`);
            console.log(`   Timestamp: ${new Date(job.timestamp).toISOString()}`);
            console.log('');
          });
        }
        break;
      }

      case 'inspect': {
        if (!arg1) {
          console.error('❌ Job ID required');
          process.exit(1);
        }
        
        const details = await inspectDLQJob(arg1);
        if (!details) {
          console.error(`❌ Job not found: ${arg1}`);
          process.exit(1);
        }
        
        console.log('\n🔍 Job Details:\n');
        console.log(JSON.stringify(details, null, 2));
        break;
      }

      case 'retry': {
        if (!arg1) {
          console.error('❌ Job ID required');
          process.exit(1);
        }
        
        console.log(`🔄 Retrying job ${arg1}...`);
        const result = await retryDLQJob(arg1);
        
        if (result.success) {
          console.log(`✅ Job retried successfully. New job ID: ${result.newJobId}`);
        } else {
          console.error('❌ Failed to retry job');
          process.exit(1);
        }
        break;
      }

      case 'retry-all': {
        const maxJobs = arg1 ? parseInt(arg1, 10) : 100;
        console.log(`🔄 Retrying up to ${maxJobs} DLQ jobs...`);
        
        const result = await retryAllDLQJobs(maxJobs);
        console.log(`\n✅ Retry completed:`);
        console.log(`   Attempted: ${result.attempted}`);
        console.log(`   Succeeded: ${result.succeeded}`);
        console.log(`   Failed: ${result.failed}`);
        break;
      }

      case 'purge': {
        const days = arg1 ? parseInt(arg1, 10) : 30;
        console.log(`🗑️  Purging DLQ entries older than ${days} days...`);
        
        const purged = await purgeDLQEntries(days);
        console.log(`✅ Purged ${purged} entries`);
        break;
      }

      default: {
        console.log(`
DLQ Management CLI

Usage:
  pnpm dlq:stats              - Show DLQ statistics
  pnpm dlq:list [limit]       - List DLQ jobs (default: 20)
  pnpm dlq:inspect <jobId>    - Inspect specific job details
  pnpm dlq:retry <jobId>      - Retry a specific job
  pnpm dlq:retry-all [limit]  - Retry all DLQ jobs (default: 100)
  pnpm dlq:purge [days]       - Purge jobs older than N days (default: 30)

Examples:
  pnpm dlq:stats
  pnpm dlq:list 50
  pnpm dlq:inspect job-123
  pnpm dlq:retry job-123
  pnpm dlq:retry-all 200
  pnpm dlq:purge 60
        `);
        process.exit(command ? 1 : 0);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await closeQueues();
    process.exit(0);
  }
}

main();
