# syntax=docker/dockerfile:1.6
#
# Build context: REPO ROOT (so we can copy ../shared alongside frontend/).
# Use `docker build -f frontend/Dockerfile .` or rely on docker-compose's
# `context: .` + `dockerfile: frontend/Dockerfile`.

# ---------- deps ----------
FROM node:20-alpine AS deps
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# ---------- builder ----------
FROM node:20-alpine AS builder
WORKDIR /app

# NEXT_PUBLIC_* must be inlined at build time.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}

COPY shared ./shared
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
COPY frontend/package.json frontend/package-lock.json ./frontend/
COPY frontend/tsconfig.json frontend/next.config.js frontend/postcss.config.js frontend/tailwind.config.ts frontend/next-env.d.ts ./frontend/
COPY frontend/src ./frontend/src
COPY frontend/assets ./frontend/assets

WORKDIR /app/frontend
RUN npm run build

# ---------- runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S app && adduser -S app -G app

# Standalone output: server.js + minimal node_modules under .next/standalone,
# plus static assets under .next/static. outputFileTracingRoot=repo root means
# the standalone tree lives at /app/frontend/.next/standalone/frontend.
COPY --from=builder --chown=app:app /app/frontend/.next/standalone ./
COPY --from=builder --chown=app:app /app/frontend/.next/static ./frontend/.next/static

USER app
EXPOSE 3000

CMD ["node", "frontend/server.js"]
