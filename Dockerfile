FROM node:22-slim AS builder

# Force fresh build - v5
ARG CACHEBUST=5
WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Enable pnpm first
RUN corepack enable && corepack prepare pnpm@8.11.0 --activate

# Copy root package files first
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy ALL workspace package.json files BEFORE install
COPY packages/api/package.json ./packages/api/
COPY packages/core-llm/package.json ./packages/core-llm/
COPY packages/agency-core/package.json ./packages/agency-core/
COPY packages/agent-customer-service/package.json ./packages/agent-customer-service/
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/ui-components/package.json ./packages/ui-components/
COPY apps/agent-api/package.json ./apps/agent-api/

# Install ALL dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client BEFORE building (TypeScript needs the generated types)
WORKDIR /app/apps/agent-api
RUN pnpm exec prisma generate

# Build only required packages for agent-api (skip frontend and broken packages/api)
WORKDIR /app
RUN pnpm -r --filter '!frontend' --filter '!api' build

# Use pnpm deploy to create standalone deployment with real files (no symlinks)
RUN pnpm --filter apps-agent-api deploy --prod /app/deploy

# Prisma generates to @prisma/client which pnpm deploy includes
# No additional copy needed - the generated client is inside node_modules/@prisma/client

FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Install OpenSSL for Prisma and curl for healthcheck
RUN apt-get update && apt-get install -y openssl curl && rm -rf /var/lib/apt/lists/*

# Copy the standalone deployment (has all deps as real files, not symlinks)
COPY --from=builder /app/deploy ./

# Copy built dist
COPY --from=builder /app/apps/agent-api/dist ./dist

# Copy prisma schema for migrations
COPY --from=builder /app/apps/agent-api/prisma ./prisma

EXPOSE 5000
CMD ["node", "dist/src/index.js"]

# Healthcheck for runtime image
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
	CMD curl -f http://localhost:5000/health || exit 1
