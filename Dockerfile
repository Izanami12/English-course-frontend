# Stage 1: build frontend
FROM node:20-alpine AS build

WORKDIR /app

# Увеличиваем память Node.js для сборки
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Копируем package.json и package-lock.json для кэширования npm ci
COPY package*.json ./
RUN npm ci

# Копируем исходники и билдим фронт
COPY . .
RUN npm run build

# Stage 2: lightweight image с артефактами
FROM alpine:3.19

WORKDIR /dist
COPY --from=build /app/dist .

# Этот контейнер сам ничего не запускает, просто хранит сборку
CMD ["sh", "-c", "echo Frontend build container"]
