# syntax=docker/dockerfile:1

# ── Stage 1: deps ─────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ── Stage 2: runtime ──────────────────────────────────────
FROM node:20-alpine AS runtime
WORKDIR /app

# Tạo user không phải root để tăng bảo mật
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Xoá file .env nếu vô tình copy vào (bảo mật)
RUN rm -f .env .env.*

USER appuser

EXPOSE 5000

ENV NODE_ENV=production \
    PORT=5000

CMD ["node", "server.js"]
