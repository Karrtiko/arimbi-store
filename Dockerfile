# Use Node.js LTS
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (cache mount to speed up)
COPY package*.json ./
COPY panda.config.ts ./
COPY svelte.config.js ./
COPY vite.config.ts ./
RUN apk add --no-cache python3 make g++
RUN npm ci

# Copy source
COPY . .

# Build application
RUN npm run build
# Prune dev dependencies
RUN npm prune --production

# Final stage
FROM node:20-alpine

WORKDIR /app

# Copy built application and modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Expose port
EXPOSE 3000

# Start command
CMD ["node", "build"]
