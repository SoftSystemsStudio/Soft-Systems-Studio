FROM node:22-slim AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && corepack prepare pnpm@8.11.0 --activate && pnpm install --prod

FROM node:22-slim AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build
EXPOSE 4000
 CMD ["node", "dist/index.js"]

# Healthcheck: probe the /health endpoint to determine container readiness
 HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
	 CMD curl -f http://localhost:4000/health || exit 1
