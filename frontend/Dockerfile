# Base stage - node with pnpm
FROM node:20-alpine AS base
RUN corepack enable pnpm && corepack prepare pnpm@latest --activate
WORKDIR /app

# Development target
FROM base AS development
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY frontend/package.json ./frontend/
RUN pnpm --dir frontend install --frozen-lockfile
COPY frontend ./frontend
WORKDIR /app/frontend
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["pnpm", "dev", "--hostname", "0.0.0.0"]

# Builder stage (for production)
FROM base AS builder
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY frontend/package.json ./frontend/
RUN pnpm --dir frontend install --frozen-lockfile --prefer-offline
COPY frontend ./frontend
WORKDIR /app/frontend
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# Production target
FROM node:20-alpine AS production
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./frontend/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/frontend/public ./frontend/public
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production
CMD ["node", "frontend/server.js"]
