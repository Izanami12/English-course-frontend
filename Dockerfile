# Stage 1: build
FROM node:20-alpine AS build
WORKDIR /app

ENV NODE_OPTIONS="--max-old-space-size=1536"

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: artifacts only
FROM alpine:3.19

WORKDIR /dist
COPY --from=build /app/dist .

# контейнер ничего не запускает
CMD ["sh", "-c", "echo Frontend build container"]
