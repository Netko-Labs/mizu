# Multi-stage build for Mizu Nagare (流れ) — the deployment daemon.
# Needs the Docker socket mounted at runtime (-v /var/run/docker.sock:/var/run/docker.sock)
# and a writable ~/.mizu volume for generated project files.
FROM oven/bun:1.2 AS base
WORKDIR /app

# Install dependencies stage
FROM base AS deps
COPY package.json bun.lock turbo.json ./
COPY packages/shared/cli/package.json ./packages/shared/cli/
COPY packages/shared/logger/package.json ./packages/shared/logger/
COPY packages/shared/typescript-config/package.json ./packages/shared/typescript-config/
COPY packages/configs/nagare-config/package.json ./packages/configs/nagare-config/
COPY packages/nagare/domain/package.json ./packages/nagare/domain/
COPY packages/nagare/repository/package.json ./packages/nagare/repository/
COPY packages/nagare/service/package.json ./packages/nagare/service/
COPY packages/nagare/api/package.json ./packages/nagare/api/
COPY apps/nagare/package.json ./apps/nagare/
RUN bun install --frozen-lockfile

# Build stage
FROM deps AS builder
COPY . .
RUN bun run repo build --app nagare

# Production stage
FROM oven/bun:1.2-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built daemon + migrations
COPY --from=builder /app/apps/nagare/dist ./dist
COPY --from=builder /app/packages/nagare/repository/src/db/drizzle ./drizzle

EXPOSE 3001

CMD ["bun", "run", "./dist/index.js"]
