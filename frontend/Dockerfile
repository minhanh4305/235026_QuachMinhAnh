# syntax=docker/dockerfile:1

# ── Stage 1: build ────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Build với VITE_API_URL mặc định; URL thực sẽ được ghi đè lúc runtime bởi entrypoint.sh
RUN npm run build

# ── Stage 2: serve với nginx ──────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Copy static files đã build
COPY --from=build /app/dist /usr/share/nginx/html

# Copy cấu hình nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint script để inject VITE_API_URL lúc runtime
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENV VITE_API_URL=http://localhost:5000

ENTRYPOINT ["/docker-entrypoint.sh"]
