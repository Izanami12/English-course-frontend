# Stage: build frontend
FROM node:20-alpine AS build

WORKDIR /app

ENV NODE_OPTIONS="--max-old-space-size=3072"

# Копируем только package.json для кэширования
COPY package*.json ./
RUN npm ci

# Копируем весь проект и билдим
COPY . .
RUN npm run build

# Stage: artifacts only
FROM scratch AS artifacts
WORKDIR /app
# Берем только готовый dist
COPY --from=build /app/dist ./dist

# Контейнер ничего не запускает, просто хранит dist
CMD ["sh", "-c", "echo Frontend build container"]