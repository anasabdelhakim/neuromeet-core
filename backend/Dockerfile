# ── Stage 1: Install & Build ──────────────────────────────────────────────────
FROM oven/bun:1 AS builder
WORKDIR /app

# Copy lockfile + manifest first for layer caching
COPY package.json bun.lock ./
RUN bun install

# Copy the rest of the source
COPY . .

# Generate Prisma client (CRITICAL — NestJS imports from lib/prisma/_generated)
RUN bunx prisma generate

# Build the NestJS app (SWC compiler)
RUN bun run build

# Prune dev dependencies for the production image
RUN bun install --production

# ── Stage 2: Production Runtime ───────────────────────────────────────────────
FROM oven/bun:1 AS runtime
WORKDIR /app

# Copy only what's needed to run
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/lib/prisma/_generated ./lib/prisma/_generated
COPY --from=builder /app/lib/prisma/_migrations ./lib/prisma/_migrations

ENV NODE_ENV=production
EXPOSE 4000

CMD ["sh", "-c", "bunx prisma migrate deploy && bun dist/main.js"]
