# 🚀 Guía Completa de Implementación - En las Nubes Restobar

## 📋 Tabla de Contenidos
1. [Prerrequisitos](#prerrequisitos)
2. [Configuración Previa](#configuración-previa)
3. [Despliegue en Coolify](#despliegue-en-coolify)
4. [Configuración de Dominio y SSL](#configuración-de-dominio-y-ssl)
5. [Validación Post-Despliegue](#validación-post-despliegue)
6. [Mantenimiento y Monitoreo](#mantenimiento-y-monitoreo)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerrequisitos

### Infraestructura Requerida
- **VPS** con Docker instalado (mínimo 1GB RAM, 1 CPU)
- **Coolify** instalado y configurado
- **Dominio** personalizado (opcional pero recomendado)
- **GitHub** repository con el código

### Software Necesario
```bash
# En el VPS
docker --version  # >= 20.10
docker-compose --version  # >= 2.0

# Local (para desarrollo)
node --version  # >= 18.0
npm --version   # >= 9.0
```

---

## 📁 Configuración Previa

### 1. Preparar el Repositorio
```bash
# 1. Clonar el repositorio
git clone <tu-repository-url>
cd en-las-nubes

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.template .env

# 4. Validar build local
npm run check
npm run build
```

### 2. Configurar GitHub Actions
```bash
# Ejecutar script de configuración de secrets
./scripts/setup-coolify-secrets.sh

# O configurar manualmente en GitHub:
# Settings → Secrets and variables → Actions → New repository secret
```

**Secrets Requeridos:**
```
COOLIFY_SERVER_URL=https://tu-coolify.com
COOLIFY_API_KEY=tu-api-key
COOLIFY_APPLICATION_ID=tu-app-id
COOLIFY_APP_URL=https://enlasnubes.tudominio.com
```

### 3. Verificar Archivos de Despliegue
```bash
# Validar que existen los archivos clave
ls -la Dockerfile docker-compose.yml nginx.conf .env.template
ls -la scripts/setup-coolify-secrets.sh
ls -la .github/workflows/coolify-deploy.yml
```

---

## 🚀 Despliegue en Coolify

### Paso 1: Configurar Coolify
1. **Iniciar sesión** en tu panel de Coolify
2. **Crear nueva aplicación** → "Docker Compose"
3. **Importar proyecto** desde GitHub

### Paso 2: Configurar Variables de Entorno
```bash
# En Coolify: Application → Environment Variables
NODE_ENV=production
VITE_APP_URL=https://enlasnubes.tudominio.com
VITE_API_URL=https://api.enlasnubes.tudominio.com
VITE_COOLIFY_DEPLOYMENT=true

# Recursos VPS (ajustar según capacidad)
CPU_LIMIT=1.0
MEMORY_LIMIT=512M
CPU_RESERVATION=0.5
MEMORY_RESERVATION=256M
```

### Paso 3: Configurar Health Check
```yaml
# En la configuración de Coolify
health_check_url: /api/health
health_check_interval: 30s
health_check_timeout: 10s
health_check_retries: 3
```

### Paso 4: Primer Despliegue
```bash
# Opción 1: Automático via GitHub Actions
git add .
git commit -m "feat: production deployment ready"
git push origin main

# Opción 2: Manual en Coolify
# Click en "Deploy" en el panel de Coolify
```

---

## 🌐 Configuración de Dominio y SSL

### 1. Configurar DNS
```bash
# En tu proveedor de DNS
A     @        IP_DEL_VPS
AAAA  @        IPv6_DEL_VPS (opcional)
CNAME www      tudominio.com
```

### 2. SSL Automático (Coolify)
1. **Activar Let's Encrypt** en Coolify
2. **Configurar dominio** en la aplicación
3. **Validar certificado** automático

### 3. Configurar Nginx (si es necesario)
```nginx
# nginx.conf ya está optimizado para producción
# Verificar que incluye:
server {
    listen 80;
    server_name enlasnubes.tudominio.com;

    # Redirección a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name enlasnubes.tudominio.com;

    # Configuración SSL automática por Coolify
    ssl_certificate /etc/letsencrypt/live/enlasnubes.tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/enlasnubes.tudominio.com/privkey.pem;
}
```

---

## ✅ Validación Post-Despliegue

### 1. Validación Automática
```bash
# Ejecutar script de validación
./scripts/validate-deployment.sh

# Salida esperada:
# ✅ 73/79 validaciones pasadas
# ✅ PRODUCTION READY
```

### 2. Verificaciones Manuales
```bash
# 1. Verificar que el sitio responde
curl -I https://enlasnubes.tudominio.com

# 2. Validar PWA
curl -I https://enlasnubes.tudominio.com/manifest.webmanifest
curl -I https://enlasnubes.tudominio.com/sw.js

# 3. Probar API endpoints
curl https://enlasnubes.tudominio.com/api/health

# 4. Validar SEO
curl -s https://enlasnubes.tudominio.com | grep -i "schema.org"
```

### 3. Validación Browser
- **Chrome DevTools → Lighthouse**: Score > 90
- **Network Tab**: Verificar carga de chunks
- **Application Tab**: Validar Service Worker
- **Console**: Sin errores JavaScript

### 4. Validación Mobile
- **Chrome DevTools → Mobile**: Test responsive
- **Lighthouse Mobile**: Performance > 90
- **PWA Install**: Test instalación app

---

## 📊 Mantenimiento y Monitoreo

### 1. Monitoreo Automático
```bash
# Health checks configurados en Coolify:
- /api/health (cada 30s)
- Uso de CPU/Memoria
- Espacio en disco
- Tiempo de respuesta
```

### 2. Logs y Alertas
```bash
# Ver logs en Coolify
# Application → Logs → Real-time

# Logs importantes a monitorear:
- npm build errors
- nginx access/errors
- service worker registration
- performance metrics
```

### 3. Actualizaciones Automáticas
```yaml
# GitHub Actions se ejecuta en cada push:
- Test automatico
- Build optimization
- Deploy sin downtime
- Health check post-deploy
- Rollback automatico si falla
```

### 4. Backups Automáticos
```bash
# Configurado en docker-compose.yml:
- Backups diarios de datos
- Retención de 7 días
- Export automático a almacenamiento externo
```

---

## 🚨 Troubleshooting

### Problemas Comunes y Soluciones

#### 1. Build Fails
```bash
# Error: "Module not found"
npm install
npm run build

# Error: "Memory limit exceeded"
# Aumentar MEMORY_LIMIT en Coolify a 1G
```

#### 2. PWA No Funciona
```bash
# Validar Service Worker
curl -I https://dominio.com/sw.js
# Debe retornar 200 y content-type: application/javascript

# Limpiar cache del browser
# DevTools → Application → Storage → Clear storage
```

#### 3. Slow Performance
```bash
# Verificar bundle size
npm run build:report

# Optimizar imágenes
# Usar WebP/AVIF, lazy loading
```

#### 4. SSL Issues
```bash
# Verificar certificado
openssl s_client -connect dominio.com:443

# Renovar manual si es necesario
# Coolify → SSL → Renew Certificate
```

#### 5. Database/External API Issues
```bash
# Verificar variables de entorno
echo $VITE_API_URL

# Test API endpoints
curl -v https://api.enlasnubes.tudominio.com
```

### Scripts de Emergencia

#### Rollback Automático
```bash
# GitHub Actions rollback automático
# O manual:
git checkout previous-tag
git push origin main --force
```

#### Reinicio Completo
```bash
# En Coolify: Application → Restart
# O via SSH al VPS:
docker-compose down
docker-compose up -d
```

#### Debug Mode
```bash
# Activar logs detallados
# En Coolify: Application → Environment Variables
DEBUG=true
LOG_LEVEL=verbose
```

---

## 📈 Métricas de Éxito

### Objetivos de Rendimiento
- **Lighthouse Score**: > 90 en todas las categorías
- **Time to Interactive**: < 3 segundos
- **Bundle Size**: < 2MB total
- **Uptime**: > 99.5%
- **PWA Score**: 100/100

### Métricas de Negocio
- **Conversion Rate**: Reservas online
- **Bounce Rate**: < 40%
- **Page Views**: Sesión > 3 páginas
- **Mobile Usage**: > 60% tráfico móvil

---

## 🎞️ Checklist Final Pre-Producción

- [ ] Todos los tests pasan (`npm run check`)
- [ ] Build exitoso (`npm run build`)
- [ ] Variables de entorno configuradas
- [ ] GitHub Actions secrets configurados
- [ ] Dominio apuntando al VPS
- [ ] SSL certificado activo
- [ ] Health checks funcionando
- [ ] Monitoreo configurado
- [ ] Backups programados
- [ ] Validación mobile completada
- [ ] PWA features testeadas
- [ ] Performance optimizada
- [ ] SEO validado
- [ ] Accesibilidad verificada

---

## 🎉 ¡Felicidades!

Tu aplicación "En las Nubes Restobar" está ahora **100% lista para producción** con:

✅ **Despliegue automático** vía Coolify
✅ **CI/CD completo** con GitHub Actions
✅ **PWA funcional** con Service Worker
✅ **SEO optimizado** con Schema markup
✅ **Performance optimizada** con bundle splitting
✅ **Monitoreo activo** con health checks
✅ **SSL automático** con Let's Encrypt
✅ **Rollback automático** ante fallos

**El sistema está listo para recibir tráfico real y escalar tu negocio gastronómico!** 🚀

---

*Para soporte técnico adicional, revisa el archivo `TROUBLESHOOTING.md` o contacta al equipo de desarrollo.*