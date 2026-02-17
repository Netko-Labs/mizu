# Multi-stage build for Mizu
FROM oven/bun:1.2 AS base
WORKDIR /app

# Install dependencies stage
FROM base AS deps
COPY package.json bun.lock turbo.json ./
COPY packages/shared/cli/package.json ./packages/shared/cli/
COPY packages/shared/logger/package.json ./packages/shared/logger/
COPY packages/shared/typescript-config/package.json ./packages/shared/typescript-config/
COPY packages/configs/minato-config/package.json ./packages/configs/minato-config/
COPY packages/minato/domain/package.json ./packages/minato/domain/
COPY packages/minato/repository/package.json ./packages/minato/repository/
COPY packages/minato/service/package.json ./packages/minato/service/
COPY packages/minato/trpc/package.json ./packages/minato/trpc/
COPY apps/minato/package.json ./apps/minato/
RUN bun install --frozen-lockfile

# Build stage
FROM deps AS builder
COPY . .
RUN bun run repo build --app minato

# Production stage
FROM oven/bun:1.2-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 mizu && \
    adduser --system --uid 1001 --ingroup mizu mizu

# Copy built app
COPY --from=builder /app/apps/minato/.output ./
COPY --from=builder /app/packages/minato/repository/src/db/drizzle ./drizzle
COPY apps/minato/docker-entrypoint.sh ./

RUN chmod +x docker-entrypoint.sh && \
    chown -R mizu:mizu /app

USER mizu

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["bun", "run", "./server/index.mjs"]
