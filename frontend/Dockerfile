FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source
COPY src ./src
COPY index.html vite.config.js tailwind.config.js postcss.config.js ./
COPY public ./public 2>/dev/null || true

# Build for production
RUN npm run build

# Use nginx to serve
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=0 /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
