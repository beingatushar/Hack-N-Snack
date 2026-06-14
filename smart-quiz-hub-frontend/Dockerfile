# =============================================================
# Smart Quiz Hub — Frontend (Development)
# =============================================================
# Base image: Node 22 LTS (Alpine = small)
#
# Hot reload flow:
#   1. You save any .ts / .html / .scss file on the HOST
#   2. The bind-mounted source is detected by Angular CLI's file watcher
#   3. The browser updates instantly via HMR — no page reload for most changes
#
# node_modules note:
#   node_modules is installed inside the image and preserved via an anonymous
#   Docker volume (see docker-compose.yml). Adding a new package requires:
#     docker compose build frontend
# =============================================================

FROM node:22-alpine

WORKDIR /app

# Install dependencies at image-build time so node_modules is baked into the image.
# The anonymous volume in docker-compose.yml keeps this copy alive even though
# the full source directory is bind-mounted at runtime.
COPY package*.json ./
RUN npm ci

EXPOSE 4200

# --host 0.0.0.0  → required for Docker port mapping to reach the dev server
# --poll 2000     → polling fallback (some Docker/OS combinations miss inotify events)
# --disable-host-check is NOT needed — localhost is trusted
CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--port", "4200", "--poll", "2000"]
