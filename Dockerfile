FROM node:22-slim AS builder
WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Enable pnpm first
RUN corepack enable && corepack prepare pnpm@8.11.0 --activate

# Copy package files and lockfile first for better caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy ALL workspace package.json files
COPY packages/api/package.json ./packages/api/
COPY packages/core-llm/package.json ./packages/core-llm/
COPY packages/agency-core/package.json ./packages/agency-core/
COPY packages/agent-customer-service/package.json ./packages/agent-customer-service/
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/ui-components/package.json ./packages/ui-components/
COPY apps/agent-api/package.json ./apps/agent-api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build all packages
RUN pnpm -r build

FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/packages/api/dist ./packages/api/dist
COPY --from=builder /app/packages/api/package.json ./packages/api/package.json
WORKDIR /app/packages/api
RUN corepack enable && corepack prepare pnpm@8.11.0 --activate
RUN pnpm install --prod
EXPOSE 4000
CMD ["node", "dist/index.js"]

# Healthcheck for runtime image
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
	CMD curl -f http://localhost:4000/health || exit 1
