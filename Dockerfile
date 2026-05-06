# Use the official Node.js 22 image
FROM node:22-slim AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the frontend assets
RUN npm run build

# Production stage
FROM node:22-slim

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm install --omit=dev

# Copy built assets and server files from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/package.json ./

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
