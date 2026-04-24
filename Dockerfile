# 1. Aşama: Node.js ortamı
FROM node:20-slim

# 2. Aşama: Çalışma dizini
WORKDIR /app

# 3. Aşama: Bağımlılık yönetimi
COPY package*.json ./
RUN npm install

# 4. Aşama: Kodları kopyala
COPY . .

# 5. Aşama: Frontend Build (Vite)
RUN npm run build

# 6. Aşama: Port ve Ortam Değişkenleri
EXPOSE 3000
ENV NODE_ENV=production

# 7. Aşama: Başlatma
CMD ["npm", "start"]
