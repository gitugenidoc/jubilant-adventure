# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies including dev
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Final stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy generated prisma client from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy source
COPY src ./src
COPY prisma/schema.prisma ./prisma/

# Expose port
EXPOSE 3000

# Set environment variable
ENV NODE_ENV=production

# Default command
CMD ["npm", "run", "start"]
