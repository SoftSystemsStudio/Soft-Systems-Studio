import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
