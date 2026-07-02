FROM node:20-slim
RUN apt-get update -qq && apt-get install -y -qq openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json* ./
COPY tsconfig.json ./
COPY prisma ./prisma
COPY backend ./backend
COPY contracts ./contracts
COPY ai ./ai
RUN npm install
RUN npx prisma generate
EXPOSE 3004
CMD ["npx", "ts-node", "backend/moderation-service/src/main.ts"]