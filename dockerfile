# Use Node.js base image
FROM node:23-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files and build the application
COPY tsconfig.json ./
COPY tsup.config.ts ./
COPY src ./src
RUN npm run build

# Use a minimal base image for the final build
FROM node:23-slim

# Set working directory
WORKDIR /app

# Copy built files from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Run the application
CMD ["node", "dist/index.js"]
