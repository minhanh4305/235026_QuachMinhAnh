#!/bin/sh
# Thay thế URL backend trong config.js theo biến môi trường VITE_API_URL
# Cho phép đổi backend mà không cần build lại image

API_URL="${VITE_API_URL:-http://localhost:5000}"

echo "window.__API_URL__ = \"${API_URL}\";" > /usr/share/nginx/html/config.js

echo "[entrypoint] API_URL set to: ${API_URL}"

exec nginx -g "daemon off;"
