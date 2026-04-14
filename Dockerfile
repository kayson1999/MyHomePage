# ============================================
# MyHomePage Static Site Dockerfile
# Using Nginx to serve Vue built static files
# ============================================

FROM node:20-alpine AS builder

WORKDIR /app

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

# Custom Nginx configuration (optional)
# COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
