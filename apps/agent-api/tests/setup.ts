import { execSync } from 'child_process';

// Ensure tests run in `test` environment to relax some runtime checks
process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';

// Ensure Prisma CLI reads the same DB URL as the app uses
if (process.env.POSTGRES_URL) {
  process.env.DATABASE_URL = process.env.POSTGRES_URL;
}

// Provide safe defaults for test environment to satisfy env validation
process.env.POSTGRES_URL = process.env.POSTGRES_URL ?? 'postgresql://postgres:postgres@localhost:5432/agent_api_test';
process.env.DATABASE_URL = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-that-is-long-enough-123456';

// (debug logs removed)

// Ensure queue metrics are disabled in tests
process.env.ENABLE_QUEUE_METRICS = 'false';

// Apply schema to the test database. This uses `prisma db push` which is safe for CI.
try {
  // Generate client and push schema. Use npx so it works in environments without global prisma.
  // Guard: only run `prisma db push --accept-data-loss` when the operator explicitly
  // sets `PRISMA_ACCEPT_DATA_LOSS=true` to avoid accidental destructive schema changes.
  if (!process.env.POSTGRES_URL) {
    // No test DB configured; skip push and let tests fail fast with a clear message.
    // eslint-disable-next-line no-console
    console.warn(
      'Skipping prisma db push because POSTGRES_URL is not set. Integration tests require a test database.',
    );
  } else if (process.env.PRISMA_ACCEPT_DATA_LOSS === 'true') {
    execSync('npx prisma generate', { stdio: 'inherit' });
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  } else {
    // Inform operator how to enable destructive push explicitly.
    // eslint-disable-next-line no-console
    console.warn(
      'Prisma schema push skipped. To allow applying schema changes that may cause data loss, set PRISMA_ACCEPT_DATA_LOSS=true and ensure POSTGRES_URL points to a dedicated test database.',
    );
  }
} catch (err) {
  // For environments where prisma CLI isn't available, surface a clearer error.
  // Tests will fail quickly if the DB is not migrated.
  // eslint-disable-next-line no-console
  console.error('Prisma migration/setup failed. Ensure dev deps are installed.');
  throw err;
}

// Connect prisma client used by the app
import prisma from '../src/db';
import { closeQueues, stopQueueMetrics } from '../src/queue';

beforeAll(async () => {
  await prisma.$connect();
  // Clean database from previous test runs to ensure isolation
  try {
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.workspaceMembership.deleteMany();
    await prisma.user.deleteMany();
    await prisma.kbDocument.deleteMany();
    await prisma.workspace.deleteMany();
  } catch (e) {
    // ignore errors during cleanup
  }
});

afterAll(async () => {
  try {
    // Stop queue metrics and close queue connections
    stopQueueMetrics();
    await closeQueues();
  } catch (e) {
    // ignore queue cleanup errors
  }

  try {
    await prisma.$disconnect();
  } catch (e) {
    // ignore
  }
});

export {};
