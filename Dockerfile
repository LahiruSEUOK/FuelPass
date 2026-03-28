# Stage 1: Build the Vite React Application
FROM node:20-alpine as builder

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application files
# Note: Ensure .env is present in your build context or passed as args if required by Vite build
COPY . .

# Build the production application
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY docker-nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build output to replace the default Nginx contents
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 inside the container
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
