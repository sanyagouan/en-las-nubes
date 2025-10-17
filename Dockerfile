# Multi-stage Dockerfile optimizado para producción en Coolify VPS
# En las Nubes Restobar - Build ultra-optimizado

# ========================================
# STAGE 1: Builder - Dependencias y Build
# ========================================
FROM node:20-alpine AS builder

# Variables de entorno para el build
ENV NODE_ENV=production
ENV VITE_API_BASE_URL=/api
ENV VITE_APP_VERSION=1.0.0
ENV ANALYZE=false

# Instalar dependencias básicas para el build
RUN apk add --no-cache \
    libc6-compat \
    glib \
    nss \
    nspr \
    atk \
    at-spi2-atk \
    gtk+3.0 \
    gdk-pixbuf \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    xdg-utils

WORKDIR /app

# Copiar package files con cache optimizado
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Instalar dependencias con npm ci para producción
RUN npm ci --only=production --silent && npm cache clean --force

# Copiar código fuente
COPY . .

# Build optimizado para VPS con análisis de bundle
RUN npm run build

# Generar reporte de build para Coolify
RUN npm run build:report || echo "Build report skipped"

# ========================================
# STAGE 2: Production - Nginx + Static Assets
# ========================================
FROM nginx:alpine AS production

# Etiquetas para Coolify
LABEL maintainer="En las Nubes Restobar"
LABEL version="1.0.0"
LABEL description="Experiencia web cinematográfica para En las Nubes Restobar"

# Variables de entorno de producción
ENV NGINX_PORT=80
ENV NGINX_HOST=localhost
ENV SSL_CERT_PATH=""
ENV SSL_KEY_PATH=""

# Instalar herramientas para monitoreo y salud
RUN apk add --no-cache \
    curl \
    jq \
    openssl \
    tzdata \
    && rm -rf /var/cache/apk/*

# Configuración de timezone
ENV TZ=Europe/Madrid
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Configurar nginx optimizado para VPS
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

# Health check script
COPY healthcheck.sh /usr/local/bin/healthcheck.sh
RUN chmod +x /usr/local/bin/healthcheck.sh

# Copiar build estático
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar scripts de mantenimiento
COPY scripts/ /opt/scripts/ || echo "Scripts directory not found, skipping"

# Configurar permisos optimizados
RUN chown -R nginx:nginx /usr/share/nginx/html \
    && find /usr/share/nginx/html -type f -exec chmod 644 {} \; \
    && find /usr/share/nginx/html -type d -exec chmod 755 {} \;

# Crear directorios para logs y cache
RUN mkdir -p /var/log/nginx /var/cache/nginx /var/run/nginx \
    && chown -R nginx:nginx /var/log/nginx /var/cache/nginx /var/run/nginx

# Exponer puerto
EXPOSE 80

# Health check para Coolify
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD /usr/local/bin/healthcheck.sh || exit 1

# User no root
USER nginx

# Comando de inicio optimizado
CMD ["nginx", "-g", "daemon off;"]