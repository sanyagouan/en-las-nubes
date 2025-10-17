# 🚀 Implementación Rápida - En las Nubes Restobar

## ⚡ Despliegue en 5 Pasos

### Paso 1: Preparar GitHub (2 min)
```bash
# Ejecutar script de configuración
./scripts/setup-coolify-secrets.sh

# Configurar en GitHub: Settings → Secrets and variables → Actions
COOLIFY_SERVER_URL=https://tu-coolify.com
COOLIFY_API_KEY=tu-api-key
COOLIFY_APPLICATION_ID=tu-app-id
COOLIFY_APP_URL=https://enlasnubes.tudominio.com
```

### Paso 2: Crear App en Coolify (1 min)
1. Login → New Application → Docker Compose
2. Importar desde GitHub repository
3. Configurar resources (CPU: 1.0, Memory: 512M)

### Paso 3: Configurar Variables (1 min)
```bash
# En Coolify: Application → Environment Variables
NODE_ENV=production
VITE_APP_URL=https://enlasnubes.tudominio.com
VITE_COOLIFY_DEPLOYMENT=true
```

### Paso 4: Primer Despliegue (2 min)
```bash
# Automatic via GitHub Actions
git add .
git commit -m "feat: deploy to production"
git push origin main

# Coolify detectará y desplegará automáticamente
```

### Paso 5: Validar (1 min)
```bash
# Verificar que está online
curl -I https://enlasnubes.tudominio.com

# Validar PWA
curl -I https://enlasnubes.tudominio.com/manifest.webmanifest
```

## ✅ **Total: ~7 minutos**

## 🔧 Dominio y SSL (Post-despliegue)

### Configurar DNS
```bash
# En tu proveedor de dominio
A     @        IP_DEL_VPS
CNAME www      tudominio.com
```

### SSL Automático
1. Coolify → Application → Domains
2. Añadir dominio: `enlasnubes.tudominio.com`
3. Activar Let's Encrypt → Save

## 📊 Validación Final

```bash
# Script de validación completa
./scripts/validate-deployment.sh

# Esperado: ✅ 73/79 validaciones pasadas
```

## 🚨 Problemas Comunes

**Build fails:** `npm run build` local para validar
**SSL issues:** Esperar 5-10 min después de configurar DNS
**PWA no funciona:** Limpiar cache del browser

## 📞 Soporte Rápido

- Revisar logs en Coolify: Application → Logs
- Verificar GitHub Actions: Actions tab
- Validar health check: `/api/health`

**¡Tu web estará funcionando en menos de 10 minutos!** ⚡