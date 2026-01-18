# Stage 1: Build Angular app
FROM node:20-alpine AS build

# Setzt /app als Arbeitsverzeichnis
WORKDIR /app

# package.json & package-lock.json kopieren
COPY package*.json ./

# Abhängigkeiten installieren
RUN npm install

# ng installieren
RUN npm install -g @angular/cli

# Angular-Projekt kopieren
COPY . .

# Production Build
RUN ng build -c production

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Kopiere Build-Output in Nginx-Ordner
COPY --from=build /app/dist/frontend/browser /var/www/leihsy-frontend

# Optional: eigene Nginx Config
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

