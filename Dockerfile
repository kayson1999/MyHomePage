# ============================================
# 个人主页静态站点 Dockerfile
# 使用 Nginx 提供 Vue 构建后的静态文件
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# 复制前端源码
COPY package.json package-lock.json ./
COPY index.html ./
COPY vite.config.js ./
COPY src/ ./src/
COPY public/ ./public/

# 安装依赖并构建
# 配置淘宝npm镜像源加速
RUN npm config set registry https://registry.npmmirror.com
RUN npm ci && npm run build

# ============================================
# 运行时阶段
# ============================================
FROM nginx:1.25-alpine

# 复制构建产物到 Nginx 默认目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 自定义 Nginx 配置（可选）
# COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
