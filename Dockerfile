FROM node:22-slim AS builder

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@8.11.0 --activate

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/api/package.json ./packages/api/
COPY packages/core-llm/package.json ./packages/core-llm/
COPY packages/agency-core/package.json ./packages/agency-core/
COPY packages/agent-customer-service/package.json ./packages/agent-customer-service/
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/ui-components/package.json ./packages/ui-components/
COPY apps/agent-api/package.json ./apps/agent-api/

# Install all dependencies (including devDependencies)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Change to agent-api directory and generate Prisma client with Prisma 6
WORKDIR /app/apps/agent-api
RUN npx prisma@6 generate

# Go back to root and build all packages
WORKDIR /app
RUN pnpm -r --filter '!frontend' --filter '!api' build

# Use pnpm deploy to create a clean production deployment
RUN pnpm --filter apps-agent-api deploy --prod /app/deploy

# Runtime stage
FROM node:22-slim AS runtime

WORKDIR /app

# Install runtime dependencies (OpenSSL needed for Prisma)
RUN apt-get update && apt-get install -y openssl curl && rm -rf /var/lib/apt/lists/*

# Copy the deployed production files
COPY --from=builder /app/deploy ./

# Copy built code
COPY --from=builder /app/apps/agent-api/dist ./dist

# Copy Prisma schema and migrations
COPY --from=builder /app/apps/agent-api/prisma ./prisma

# Generate Prisma client in runtime using Prisma 6
RUN npx prisma@6 generate

EXPOSE 5000

# Run the application
CMD ["node", "dist/src/index.js"]
