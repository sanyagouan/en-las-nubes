# Dockerfile simple y funcional para Coolify VPS
# En las Nubes Restobar - Solo lo necesario

# STAGE 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar codigo fuente
COPY . .

# Build de produccion
RUN npm run build

# STAGE 2: Production
FROM nginx:alpine AS production

# Copiar build estatico
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuracion nginx
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

# Health check
COPY healthcheck.sh /usr/local/bin/healthcheck.sh
RUN chmod +x /usr/local/bin/healthcheck.sh

# Exponer puerto
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD /usr/local/bin/healthcheck.sh || exit 1

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]