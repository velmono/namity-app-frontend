FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

EXPOSE 80
CMD ["npx", "vite", "preview", "--port", "80", "--host"]
