# Stage 1: Build the React (Vite) App
FROM node:20-alpine AS build

WORKDIR /app

# Copy only package files first for caching purposes
COPY package*.json ./
RUN npm install

# Copy everything else and build
COPY . .

# Build Vite production files (output to /dist by default)
RUN npm run build

# Stage 2: Create a lightweight image with the build artifacts
FROM node:20-alpine

WORKDIR /app

# Copy only the built files from the previous stage
COPY --from=build /app/dist ./dist

# Expose port 5173 (or any other port you use for the frontend)
EXPOSE 5173

# Start a simple HTTP server to serve the static files
CMD ["npx", "serve", "-s", "dist", "-l", "5173"]