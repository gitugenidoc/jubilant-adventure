FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source
COPY src ./src
COPY .env.example .env

# Generate Prisma Client
RUN npm run generate

# Expose port
EXPOSE 3000

# Default command (will be overridden by docker-compose)
CMD ["npm", "run", "start"]
