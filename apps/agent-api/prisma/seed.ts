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

  // Create comprehensive knowledge base documents about Soft Systems Studio
  const sampleDocs = [
    {
      title: 'What is Soft Systems Studio?',
      content: `Soft Systems Studio is an enterprise-ready AI agent platform - a production-grade TypeScript monorepo designed for building, deploying, and scaling AI-powered business agents. 
      
      It provides everything needed to deploy production AI agents including:
      - Multi-tenant SaaS infrastructure with workspace isolation
      - RAG-based knowledge retrieval with conversation memory
      - Complete authentication system with JWT and refresh tokens
      - Background job processing with BullMQ queues
      - Production observability with Prometheus metrics and Sentry error tracking
      - Docker and Kubernetes deployment support
      
      The platform is built with TypeScript, uses PostgreSQL for data persistence, Redis for caching and queues, and Qdrant for vector similarity search. It's designed to scale from MVP to millions of users without major refactoring.`,
      status: 'completed',
    },
    {
      title: 'Key Features and Capabilities',
      content: `Soft Systems Studio offers comprehensive features for building production AI agents:
      
      AI AGENT SYSTEM:
      - Customer service agents with RAG (Retrieval-Augmented Generation) pipeline
      - Conversation memory with sliding window context (last 10 messages)
      - Multi-turn dialogue with contextual understanding
      - Configurable behavior: custom prompts, temperature, response style
      - Document knowledge base with async ingestion
      - Vector search using Qdrant with 99% retrieval accuracy
      
      SECURITY & AUTHENTICATION:
      - JWT access tokens (15 min) and refresh tokens (7 days)
      - bcrypt password hashing with cost factor 12
      - Timing-safe secret comparison to prevent timing attacks
      - Rate limiting per IP, workspace, and endpoint
      - Comprehensive audit logging
      - SQL injection prevention via Prisma ORM
      
      MULTI-TENANCY:
      - Workspace-based isolation with RBAC
      - Roles: admin, owner, member, agent, service
      - Database-level data isolation
      - Independent billing and usage metering
      
      INFRASTRUCTURE:
      - BullMQ queue system with retry logic and DLQ
      - Graceful shutdown for serverless deployments
      - Docker Compose for local development
      - Kubernetes-ready with health checks
      - Horizontal scaling support`,
      status: 'completed',
    },
    {
      title: 'Technology Stack',
      content: `Soft Systems Studio is built with modern, production-proven technologies:
      
      CORE:
      - Language: TypeScript 5.x for type safety
      - Runtime: Node.js 22.x
      - Package Manager: pnpm 8.x with workspaces
      - Framework: Express 4.x for REST API
      - Frontend: Next.js 14.x with React 18.x
      
      DATA LAYER:
      - Primary Database: PostgreSQL 15
      - ORM: Prisma 6 with type-safe queries
      - Cache & Queues: Redis 7
      - Vector Database: Qdrant for similarity search
      
      INFRASTRUCTURE:
      - Queue System: BullMQ for reliable background jobs
      - Authentication: JWT with refresh token rotation
      - Payments: Stripe integration
      - Containerization: Docker with multi-stage builds
      
      OBSERVABILITY:
      - Logging: Pino with structured JSON
      - Metrics: Prometheus with prom-client
      - Error Tracking: Sentry
      - Health Checks: Custom middleware for Kubernetes`,
      status: 'completed',
    },
    {
      title: 'Use Cases and Target Customers',
      content: `Soft Systems Studio is perfect for:
      
      CUSTOMER SERVICE AUTOMATION:
      - 24/7 AI support with knowledge base integration
      - Multi-turn conversations with context memory
      - Escalation to human agents when needed
      - Conversation history and analytics
      
      INTERNAL KNOWLEDGE MANAGEMENT:
      - Document Q&A systems for internal knowledge bases
      - Team collaboration with AI assistance
      - Compliance-aware chatbots with audit trails
      - Sales enablement with CRM integration
      
      SAAS PRODUCT FEATURES:
      - Add AI chat to existing products
      - Multi-tenant AI agents for B2B SaaS
      - White-label AI solutions
      - API-first architecture for integrations
      
      TARGET CUSTOMERS:
      - SaaS companies adding AI features
      - Agencies building AI solutions for clients
      - Enterprises modernizing customer support
      - Startups building AI-first products`,
      status: 'completed',
    },
    {
      title: 'Getting Started and Setup',
      content: `Getting started with Soft Systems Studio is simple:
      
      QUICK START (One Command):
      git clone the repository, then run ./scripts/demo.sh which automatically:
      - Checks prerequisites (Node.js 22+, Docker, pnpm)
      - Installs dependencies
      - Starts Docker services (Postgres, Redis, Qdrant)
      - Runs database migrations
      - Seeds demo data
      - Starts the API server
      
      PREREQUISITES:
      - Node.js 22+ with corepack enabled
      - Docker & Docker Compose
      - pnpm 8+ (installed via corepack)
      - OpenAI API key (for LLM and embeddings)
      
      MANUAL SETUP:
      1. Clone repository and run pnpm install
      2. Copy .env.example files and configure
      3. Start infrastructure with docker compose
      4. Run database migrations with Prisma
      5. Seed demo data
      6. Build and start the API server
      
      DEMO CREDENTIALS:
      - Email: demo@example.com
      - Password: SecurePass123!
      - Workspace: demo
      
      The platform includes an interactive API demo script (./scripts/api-demo.sh) to explore all endpoints.`,
      status: 'completed',
    },
    {
      title: 'Pricing and Business Model',
      content: `Soft Systems Studio is an open-source platform with flexible deployment options:
      
      DEPLOYMENT OPTIONS:
      - Self-hosted: Deploy on your own infrastructure (AWS, GCP, Azure)
      - Managed services: Use cloud services (Vercel, Railway, Render)
      - Hybrid: Mix of self-hosted and managed components
      
      COSTS TO CONSIDER:
      - Infrastructure: Database, Redis, Qdrant hosting costs
      - OpenAI API: LLM calls and embedding generation (usage-based)
      - Observability: Sentry, monitoring tools (optional)
      - Compute: API servers and background workers
      
      COST EFFICIENCY:
      - Efficient resource utilization with connection pooling
      - Background job processing reduces blocking operations
      - Caching layer minimizes database queries
      - Vector search optimized for performance
      
      SCALABILITY:
      - Starts affordable for MVPs (< $100/month)
      - Scales horizontally as usage grows
      - No vendor lock-in or per-seat licensing
      - Pay only for infrastructure you use`,
      status: 'completed',
    },
    {
      title: 'Architecture and Design',
      content: `Soft Systems Studio follows enterprise architecture patterns:
      
      SYSTEM ARCHITECTURE:
      - Monorepo with pnpm workspaces
      - Clear separation of concerns (API, frontend, packages)
      - Service layer pattern for business logic
      - Repository pattern with Prisma ORM
      - Event-driven with queue-based workers
      
      API LAYER:
      - RESTful endpoints with versioning (/api/v1/)
      - Express middleware pipeline
      - Zod schema validation
      - JWT authentication middleware
      - Rate limiting per endpoint
      
      SERVICE LAYER:
      - Chat service: RAG retrieval and LLM orchestration
      - Ingest service: Document processing and vectorization
      - Auth service: Token management and sessions
      - Qdrant service: Vector database operations
      
      DATA PERSISTENCE:
      - Transactional consistency with Prisma
      - Multi-tenant data isolation
      - Optimistic locking for concurrency
      - Audit logging for compliance
      
      BACKGROUND JOBS:
      - Document ingestion pipeline
      - Embedding generation
      - Cleanup tasks
      - Exponential backoff retry logic`,
      status: 'completed',
    },
    {
      title: 'Support and Community',
      content: `Get help and stay connected with Soft Systems Studio:
      
      DOCUMENTATION:
      - Comprehensive guides in /docs folder
      - API reference with examples
      - Architecture deep dive
      - Security best practices
      - Deployment guide
      
      GETTING HELP:
      - GitHub Issues for bug reports and feature requests
      - Email: contact@softsystemsstudio.com
      - Documentation: Check docs/README.md for all guides
      - Demo: Run ./scripts/demo.sh for interactive walkthrough
      
      CONTRIBUTING:
      - Open source and welcoming contributions
      - See CONTRIBUTING.md for guidelines
      - Test coverage required for PRs
      - Code review process
      
      ROADMAP:
      - Additional agent types (sales, support, research)
      - More LLM providers (Anthropic, Gemini)
      - Enhanced observability dashboards
      - Improved developer experience
      - Community Discord server (coming soon)`,
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
