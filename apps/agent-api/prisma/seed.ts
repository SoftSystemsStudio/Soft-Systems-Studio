import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error('POSTGRES_URL environment variable is required');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.workspace.upsert({
    where: { id: 'demo' },
    update: {},
    create: { id: 'demo', name: 'Demo Workspace' },
  });
  console.log('Seed: created demo workspace');
}

void main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
