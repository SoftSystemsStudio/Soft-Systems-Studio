FROM node:22-slim AS builder
WORKDIR /app
COPY . .
RUN corepack enable && corepack prepare pnpm@8.11.0 --activate
RUN pnpm -w install --frozen-lockfile
RUN pnpm -w -r build

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
