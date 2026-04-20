# Build stage
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Cloud Run injects a dynamic $PORT environment variable.
# Nginx listens on 80 by default. This command rewrites the nginx config 
# to listen on the exact port Cloud Run assigns dynamically before starting.
CMD sed -i -e 's/listen  *80;/listen '"$PORT"';/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'
