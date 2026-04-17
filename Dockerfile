# ============================================
# MyHomePage Static Site Dockerfile
# Using Nginx to serve Vue built static files
# ============================================

FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_DECISIONER_URL
ARG VITE_WORKER_URL
ARG VITE_USER_CENTER_URL
ARG VITE_APP_ID
ARG VITE_ADMIN_TOKEN
ARG VITE_GITHUB_OWNER
ARG VITE_GITHUB_REPO
ARG VITE_GITHUB_BRANCH
ARG VITE_GITHUB_DATA_ROOT

ENV VITE_DECISIONER_URL=$VITE_DECISIONER_URL \
    VITE_WORKER_URL=$VITE_WORKER_URL \
    VITE_USER_CENTER_URL=$VITE_USER_CENTER_URL \
    VITE_APP_ID=$VITE_APP_ID \
    VITE_ADMIN_TOKEN=$VITE_ADMIN_TOKEN \
    VITE_GITHUB_OWNER=$VITE_GITHUB_OWNER \
    VITE_GITHUB_REPO=$VITE_GITHUB_REPO \
    VITE_GITHUB_BRANCH=$VITE_GITHUB_BRANCH \
    VITE_GITHUB_DATA_ROOT=$VITE_GITHUB_DATA_ROOT

# Copy frontend source code
COPY package.json package-lock.json ./
COPY index.html ./
COPY vite.config.js ./
COPY src/ ./src/
COPY public/ ./public/

# Install dependencies and build
# Configure npm mirror for faster downloads
RUN npm config set registry https://registry.npmmirror.com
RUN npm ci && npm run build

# ============================================
# Runtime stage
# ============================================

FROM nginx:1.25-alpine

# Copy build artifacts to Nginx default directory
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
