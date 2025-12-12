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

# Runtime stage
FROM node:22-slim AS runtime

WORKDIR /app

# Install runtime dependencies (OpenSSL needed for Prisma)
RUN apt-get update && apt-get install -y openssl curl && rm -rf /var/lib/apt/lists/*

# Copy workspace files
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Copy all node_modules from builder (includes generated Prisma client)
COPY --from=builder /app/node_modules ./node_modules

# Copy built packages with their node_modules
COPY --from=builder /app/packages/core-llm/dist ./packages/core-llm/dist
COPY --from=builder /app/packages/core-llm/package.json ./packages/core-llm/package.json
COPY --from=builder /app/packages/core-llm/node_modules ./packages/core-llm/node_modules

COPY --from=builder /app/packages/agency-core/dist ./packages/agency-core/dist
COPY --from=builder /app/packages/agency-core/package.json ./packages/agency-core/package.json
COPY --from=builder /app/packages/agency-core/node_modules ./packages/agency-core/node_modules

COPY --from=builder /app/packages/agent-customer-service/dist ./packages/agent-customer-service/dist
COPY --from=builder /app/packages/agent-customer-service/package.json ./packages/agent-customer-service/package.json
COPY --from=builder /app/packages/agent-customer-service/node_modules ./packages/agent-customer-service/node_modules

# Copy agent-api app with its node_modules
COPY --from=builder /app/apps/agent-api/dist ./apps/agent-api/dist
COPY --from=builder /app/apps/agent-api/package.json ./apps/agent-api/package.json
COPY --from=builder /app/apps/agent-api/prisma ./apps/agent-api/prisma
COPY --from=builder /app/apps/agent-api/node_modules ./apps/agent-api/node_modules

WORKDIR /app/apps/agent-api

EXPOSE 5000

# Run the application
CMD ["node", "dist/src/index.js"]
