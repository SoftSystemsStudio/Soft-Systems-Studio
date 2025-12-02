import { execSync } from 'child_process';

// Ensure Prisma CLI reads the same DB URL as the app uses
if (process.env.POSTGRES_URL) {
  process.env.DATABASE_URL = process.env.POSTGRES_URL;
}

// Apply schema to the test database. This uses `prisma db push` which is safe for CI.
try {
  // Generate client and push schema. Use npx so it works in environments without global prisma.
  execSync('npx prisma generate', { stdio: 'inherit' });
  execSync('npx prisma db push', { stdio: 'inherit' });
} catch (err) {
  // For environments where prisma CLI isn't available, surface a clearer error.
  // Tests will fail quickly if the DB is not migrated.
  // eslint-disable-next-line no-console
  console.error('Prisma migration/setup failed. Ensure dev deps are installed.');
  throw err;
}

// Connect prisma client used by the app
import prisma from '../src/db';

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
    await prisma.$disconnect();
  } catch (e) {
    // ignore
  }
});

export {};
