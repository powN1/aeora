# ----------------------------
# 1️⃣ Build React frontend
# ----------------------------
# FROM node:20-alpine AS frontend-build
FROM oven/bun:latest AS frontend-build
WORKDIR /frontend

# Copy frontend package.json and install dependencies
COPY frontend/package*.json ./
RUN bun install

# Copy all frontend files and build
COPY frontend ./
RUN bun run build

# ----------------------------
# 2️⃣ Build backend
# ----------------------------
# FROM node:20-alpine
FROM oven/bun:latest
WORKDIR /app

# Copy backend package.json and install production dependencies
COPY backend/package*.json ./
RUN bun install --production

# Copy backend source code
COPY backend ./

# Copy built frontend from previous stage
COPY --from=frontend-build /frontend/dist ./frontend/dist

# Set production environment
ENV NODE_ENV=production
EXPOSE 3003

# Start server
CMD ["bun", "src/index.ts"]
