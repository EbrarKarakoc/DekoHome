# Stage 1: Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Bağımlılıkları kopyala ve yükle
COPY package*.json ./
RUN npm install

# Tüm kodu kopyala ve frontend build'ini yap
COPY . .
RUN npm run build

# Stage 2: Runtime stage
FROM node:20-slim

WORKDIR /app

# Sadece gerekli dosyaları kopyala
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/ortak-backend ./ortak-backend
COPY --from=builder /app/web-frontend/dist ./web-frontend/dist

# Healthcheck için curl yükle
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

EXPOSE 3000
ENV NODE_ENV=production

# Sağlık kontrolü (Jenkins pipeline için kritik)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/v1/health || exit 1

CMD ["npm", "start"]
