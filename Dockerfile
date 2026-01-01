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
COPY packages/agent-orchestrator/package.json ./packages/agent-orchestrator/
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/ui-components/package.json ./packages/ui-components/
COPY apps/agent-api/package.json ./apps/agent-api/
COPY apps/voice-receptionist/package.json ./apps/voice-receptionist/

# Install all dependencies - skip postinstall to avoid Prisma conflicts
# We'll generate Prisma client explicitly after copying source code
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source code
COPY . .

# Generate Prisma client explicitly (since we skipped postinstall)
WORKDIR /app/apps/agent-api
RUN npx prisma@6 generate

# Go back to root and build all packages (excluding frontend and legacy api)
WORKDIR /app
RUN pnpm -r --filter '!frontend' --filter '!api' --filter '!voice-receptionist' build

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

# Copy built packages with their dependencies
COPY --from=builder /app/packages/core-llm/dist ./packages/core-llm/dist
COPY --from=builder /app/packages/core-llm/package.json ./packages/core-llm/package.json
COPY --from=builder /app/packages/core-llm/node_modules ./packages/core-llm/node_modules

COPY --from=builder /app/packages/agency-core/dist ./packages/agency-core/dist
COPY --from=builder /app/packages/agency-core/package.json ./packages/agency-core/package.json
COPY --from=builder /app/packages/agency-core/node_modules ./packages/agency-core/node_modules

COPY --from=builder /app/packages/agent-orchestrator/dist ./packages/agent-orchestrator/dist
COPY --from=builder /app/packages/agent-orchestrator/package.json ./packages/agent-orchestrator/package.json
COPY --from=builder /app/packages/agent-orchestrator/node_modules ./packages/agent-orchestrator/node_modules

COPY --from=builder /app/packages/agent-customer-service/dist ./packages/agent-customer-service/dist
COPY --from=builder /app/packages/agent-customer-service/package.json ./packages/agent-customer-service/package.json
COPY --from=builder /app/packages/agent-customer-service/node_modules ./packages/agent-customer-service/node_modules

# Copy agent-api app with its dependencies and Prisma artifacts
COPY --from=builder /app/apps/agent-api/dist ./apps/agent-api/dist
COPY --from=builder /app/apps/agent-api/package.json ./apps/agent-api/package.json
COPY --from=builder /app/apps/agent-api/prisma ./apps/agent-api/prisma
COPY --from=builder /app/apps/agent-api/node_modules ./apps/agent-api/node_modules

WORKDIR /app/apps/agent-api

# Set production environment
ENV NODE_ENV=production

EXPOSE 5000

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "const port=process.env.PORT||5000;require('http').get(`http://localhost:${port}/health`,(r)=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1));"

# Use non-root user for security (node user already exists in node:22-slim)
USER node

# Run the application
CMD ["node", "dist/src/start.js"]
