# --- Stage 1: Builder ---
FROM oven/bun:1-alpine AS builder

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

RUN bun run build

# --- Stage 2: Production ---
FROM oven/bun:1-alpine

WORKDIR /app
COPY --from=builder /app/dist ./dist

EXPOSE 5173

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun -e "const http = require('http'); http.get('http://localhost:5173', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

CMD ["bun", "x", "serve", "dist", "-s", "-p", "5173", "--no-clipboard"]