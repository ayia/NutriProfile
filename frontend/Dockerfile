# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Dépendances
COPY package*.json ./
RUN npm ci

# Build
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copier les fichiers buildés
COPY --from=build /app/dist /usr/share/nginx/html

# Configuration nginx
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
