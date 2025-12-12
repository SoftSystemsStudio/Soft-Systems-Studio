import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with demo data...');

  // Create demo workspace
  const demoWorkspace = await prisma.workspace.upsert({
    where: { id: 'demo' },
    update: {},
    create: {
      id: 'demo',
      name: 'Demo Workspace',
      slug: 'demo',
    },
  });
  console.log('✅ Created demo workspace');

  // Create demo users
  const demoPassword = await bcrypt.hash('SecurePass123!', 12);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      password: demoPassword,
      name: 'Demo User',
    },
  });
  console.log('✅ Created demo user (demo@example.com)');

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: demoPassword,
      name: 'Admin User',
    },
  });
  console.log('✅ Created admin user (admin@example.com)');

  // Create workspace memberships
  await prisma.workspaceMembership.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: demoWorkspace.id,
        userId: demoUser.id,
      },
    },
    update: {},
    create: {
      workspaceId: demoWorkspace.id,
      userId: demoUser.id,
      role: 'member',
    },
  });

  await prisma.workspaceMembership.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: demoWorkspace.id,
        userId: adminUser.id,
      },
    },
    update: {},
    create: {
      workspaceId: demoWorkspace.id,
      userId: adminUser.id,
      role: 'admin',
    },
  });
  console.log('✅ Created workspace memberships');

  // Create sample conversation
  const conversation = await prisma.conversation.create({
    data: {
      workspaceId: demoWorkspace.id,
      title: 'Getting Started with Soft Systems Studio',
      messages: {
        create: [
          {
            role: 'user',
            content: 'What is Soft Systems Studio?',
          },
          {
            role: 'assistant',
            content:
              'Soft Systems Studio is an enterprise-ready AI agent platform that provides complete infrastructure for building, deploying, and scaling multi-tenant AI applications. It includes authentication, RAG-based knowledge retrieval, background job processing, and production-grade observability.',
          },
          {
            role: 'user',
            content: 'What are the key features?',
          },
          {
            role: 'assistant',
            content:
              'Key features include: 1) Multi-tenant workspace isolation with RBAC, 2) RAG-powered customer service agents with conversation memory, 3) Async document ingestion with vector search, 4) Production security with JWT auth and rate limiting, 5) Observability with Prometheus metrics and Sentry error tracking, 6) Scalable infrastructure with BullMQ queues and Docker support.',
          },
        ],
      },
    },
  });
  console.log('✅ Created sample conversation');

  // Create sample knowledge base documents
  const sampleDocs = [
    {
      title: 'Platform Overview',
      content: `Soft Systems Studio is a production-grade TypeScript monorepo for building AI-powered business agents. 
      It provides complete infrastructure including authentication, multi-tenancy, vector search, and observability.
      The platform uses PostgreSQL for data persistence, Redis for caching and queues, and Qdrant for vector similarity search.`,
      status: 'completed',
    },
    {
      title: 'Multi-Tenancy Guide',
      content: `The platform implements workspace-based multi-tenancy with role-based access control (RBAC).
      Each workspace is completely isolated at the database level with workspace_id foreign keys.
      Roles include: admin (platform administrators), owner (workspace owners), member (workspace members), 
      agent (service accounts for AI agents), and service (inter-service authentication).`,
      status: 'completed',
    },
    {
      title: 'Security Best Practices',
      content: `Security features include: JWT access tokens (15 min) and refresh tokens (7 days), 
      bcrypt password hashing with cost factor 12, timing-safe secret comparison to prevent timing attacks,
      Helmet.js security headers, rate limiting per IP/workspace/endpoint, Zod schema validation,
      SQL injection prevention via Prisma ORM, and comprehensive audit logging.`,
      status: 'completed',
    },
  ];

  for (const doc of sampleDocs) {
    await prisma.kbDocument.create({
      data: {
        workspaceId: demoWorkspace.id,
        title: doc.title,
        content: doc.content,
        status: doc.status,
        metadata: {},
      },
    });
  }
  console.log('✅ Created sample knowledge base documents');

  console.log('\n🎉 Seed complete!');
  console.log('\n📝 Demo Credentials:');
  console.log('   Email: demo@example.com');
  console.log('   Password: SecurePass123!');
  console.log('   Workspace ID: demo');
  console.log('\n   Admin Email: admin@example.com');
  console.log('   Admin Password: SecurePass123!');
}

void main()
  .catch((e: unknown) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
