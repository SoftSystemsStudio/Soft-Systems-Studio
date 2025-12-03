FROM node:22-slim AS builder
WORKDIR /app

# Cache bust: 2025-12-03
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

FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Install OpenSSL for Prisma and curl for healthcheck
RUN apt-get update && apt-get install -y openssl curl && rm -rf /var/lib/apt/lists/*

# App code
COPY --from=builder /app/apps/agent-api/dist ./apps/agent-api/dist
COPY --from=builder /app/apps/agent-api/prisma ./apps/agent-api/prisma
COPY --from=builder /app/apps/agent-api/package.json ./apps/agent-api/package.json

# Root node_modules (pnpm symlinks in app node_modules point here)
COPY --from=builder /app/node_modules ./node_modules

# App-specific node_modules (contains symlinks to root + .prisma)
COPY --from=builder /app/apps/agent-api/node_modules ./apps/agent-api/node_modules

# Copy required workspace packages (built output)
COPY --from=builder /app/packages/core-llm/dist ./packages/core-llm/dist
COPY --from=builder /app/packages/core-llm/package.json ./packages/core-llm/package.json
COPY --from=builder /app/packages/agency-core/dist ./packages/agency-core/dist
COPY --from=builder /app/packages/agency-core/package.json ./packages/agency-core/package.json
COPY --from=builder /app/packages/agent-customer-service/dist ./packages/agent-customer-service/dist
COPY --from=builder /app/packages/agent-customer-service/package.json ./packages/agent-customer-service/package.json

WORKDIR /app/apps/agent-api

EXPOSE 5000
CMD ["node", "dist/src/index.js"]

# Healthcheck for runtime image
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
	CMD curl -f http://localhost:5000/health || exit 1
