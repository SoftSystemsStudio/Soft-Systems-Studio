import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.workspace.upsert({
    where: { id: 'demo' },
    update: {},
    create: { id: 'demo', name: 'Demo Workspace' }
  });
  console.log('Seed: created demo workspace');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
