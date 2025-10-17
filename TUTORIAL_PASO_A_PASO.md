# 📚 Tutorial Paso a Paso - Implementación Completa

## 🎯 **Objetivo:** Desplegar "En las Nubes Restobar" en producción con Coolify

Vamos a implementar tu web restaurante paso a paso, desde cero hasta producción.

---

## 📋 REQUISITOS PREVIOS

### Necesitarás tener:
1. ✅ **VPS (Servidor Privado Virtual)** - Ya contratado con Docker instalado
2. ✅ **Coolify** - Ya instalado en tu servidor
3. ✅ **Dominio** - Comprado (ej: enlasnubesrestobar.com)
4. ✅ **GitHub** - Cuenta y repositorio creado
5. ✅ **Acceso terminal** - A tu VPS con SSH

---

## 🚀 **PASO 1: Configurar GitHub**

### 1.1 Subir el código a GitHub
```bash
# Desde tu computadora, en la carpeta del proyecto
git init
git add .
git commit -m "feat: initial commit - En las Nubes Restobar"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/en-las-nubes.git
git push -u origin main
```

### 1.2 Configurar Secrets en GitHub
Ve a tu repositorio en GitHub:

1. **Entra a tu repositorio**
2. **Click en `Settings`** (pestaña superior)
3. **En el menú izquierdo, busca `Secrets and variables`**
4. **Click en `Actions`**
5. **Click en `New repository secret`**

Agrega estos secrets uno por uno:

#### Secret 1: COOLIFY_SERVER_URL
```
Name: COOLIFY_SERVER_URL
Value: https://tu-coolify.com
(reemplaza tu-coolify.com con tu dominio de Coolify)
```

#### Secret 2: COOLIFY_API_KEY
```
Name: COOLIFY_API_KEY
Value: TU_API_KEY_DE_COOLIFY
```

**¿Cómo obtener tu API Key?**
1. Entra a tu panel de Coolify
2. Ve a `Settings` → `API Keys`
3. Click en `Create API Key`
4. Copia la key generada

#### Secret 3: COOLIFY_APPLICATION_ID
```
Name: COOLIFY_APPLICATION_ID
Value: 1
(este número lo obtendremos en el Paso 2, por ahora pon 1)
```

#### Secret 4: COOLIFY_APP_URL
```
Name: COOLIFY_APP_URL
Value: https://enlasnubes.tudominio.com
(reemplaza con tu dominio real)
```

### 1.3 Verificar GitHub Actions
1. **Ve a la pestaña `Actions`** en tu repositorio GitHub
2. **Verás el workflow `coolify-deploy.yml`** que ya está configurado
3. **Debe aparecer como listo para ejecutarse**

---

## 🔧 **PASO 2: Configurar Coolify**

### 2.1 Entrar a tu panel de Coolify
```
https://tu-coolify.com
Login con tus credenciales
```

### 2.2 Crear Nueva Aplicación
1. **En el dashboard principal, click en `New`**
2. **Selecciona `Application`**
3. **Elige `Docker Compose`**
4. **Click en `Next`**

### 2.3 Conectar con GitHub
1. **Selecciona `GitHub`** como source
2. **Autoriza Coolify a acceder a tu repositorio**
3. **Busca tu repositorio: `en-las-nubes`**
4. **Selecciónalo y click en `Next`**

### 2.4 Configuración Básica
1. **Application Name:** `En las Nubes Restobar`
2. **Description:** `Web gastronómica cinematográfica`
3. **Git Repository:** Ya debe aparecer seleccionado
4. **Branch:** `main`
5. **Click en `Next`**

### 2.5 Configurar Resources
1. **CPU Limit:** `1.0`
2. **Memory Limit:** `512M`
3. **CPU Reservation:** `0.5`
4. **Memory Reservation:** `256M`
5. **Click en `Next`**

### 2.6 Obtener Application ID
1. **Después de crear la app, Coolify te redirigirá al dashboard**
2. **En la URL o en la página, busca el ID de la aplicación**
3. **Generalmente es un número (ej: 1, 2, 3...)**
4. **Vuelve a GitHub Settings → Secrets → Actions**
5. **Edita el secret `COOLIFY_APPLICATION_ID`** y pon el ID real

---

## ⚙️ **PASO 3: Configurar Variables de Entorno**

### 3.1 En Coolify
1. **Ve a tu aplicación en Coolify**
2. **Click en `Environment Variables`**
3. **Añade estas variables:**

#### Variable 1: NODE_ENV
```
Key: NODE_ENV
Value: production
```

#### Variable 2: VITE_APP_URL
```
Key: VITE_APP_URL
Value: https://enlasnubes.tudominio.com
```

#### Variable 3: VITE_API_URL
```
Key: VITE_API_URL
Value: https://api.enlasnubes.tudominio.com
```

#### Variable 4: VITE_COOLIFY_DEPLOYMENT
```
Key: VITE_COOLIFY_DEPLOYMENT
Value: true
```

### 3.2 Guardar Configuración
1. **Click en `Save`**
2. **Coolify mostrará un mensaje de confirmación**

---

## 🚀 **PASO 4: Primer Despliegue**

### 4.1 Trigger Automático
El despliegue se activará automáticamente cuando hagas push a GitHub:

```bash
# Desde tu computadora, en la carpeta del proyecto
git add .
git commit -m "feat: deploy to production - En las Nubes Restobar"
git push origin main
```

### 4.2 Monitorear Despliegue
1. **Ve a GitHub → Actions tab**
2. **Verás el workflow `coolify-deploy.yml` ejecutándose**
3. **Tarda aproximadamente 3-5 minutos**

**¿Qué hace el workflow?**
- ✅ Ejecuta tests automáticamente
- ✅ Optimiza el build para producción
- ✅ Crea Docker image
- ✅ Despliega en Coolify
- ✅ Verifica que esté funcionando
- ✅ Si falla, hace rollback automático

### 4.3 Verificar en Coolify
1. **Ve a tu aplicación en Coolify**
2. **Verás el status cambiando:**
   - `Building...`
   - `Deploying...`
   - `Running` ✅

3. **Para ver los logs:**
   - Click en `Logs`
   - Podrás ver todo el proceso de despliegue

---

## 🌐 **PASO 5: Configurar Dominio**

### 5.1 Configurar DNS
Entra al panel de tu proveedor de dominio (GoDaddy, Namecheap, etc.):

**Registros DNS a crear:**
```
Tipo: A
Nombre: @ (o vacío)
Valor: IP_DE_TU_VPS
TTL: 3600 (o por defecto)

Tipo: CNAME
Nombre: www
Valor: tudominio.com
TTL: 3600 (o por defecto)
```

**¿Cómo obtener la IP de tu VPS?**
```bash
# SSH a tu servidor
ssh root@TU_IP_VPS

# Una vez dentro
curl ifconfig.me
```

### 5.2 Esperar Propagación DNS
- **Tiempo de espera:** 5 a 30 minutos
- **Para verificar propagación:**
```bash
ping tudominio.com
```
Debe responder con la IP de tu VPS.

### 5.3 Configurar Dominio en Coolify
1. **Ve a tu aplicación en Coolify**
2. **Click en `Domains`**
3. **Añade tu dominio:** `enlasnubes.tudominio.com`
4. **Activa `Let's Encrypt SSL`**
5. **Click en `Save`**

### 5.4 Verificar SSL
1. **Espera 5-10 minutos**
2. **Coolify generará certificado SSL automáticamente**
3. **Verifica que esté activo:**
```bash
curl -I https://enlasnubes.tudominio.com
```
Debe mostrar `200 OK` y `server: nginx`

---

## ✅ **PASO 6: Validación Final**

### 6.1 Verificación Manual
**Abre tu navegador y visita:**
```
https://enlasnubes.tudominio.com
```

**Qué debes verificar:**
1. ✅ **Carga correctamente** la web
2. ✅ **No hay errores** en la consola (F12)
3. ✅ **El logo de PWA** aparece en la barra de dirección
4. ✅ **El certificado SSL** está activo (candado verde)
5. ✅ **Todas las secciones** funcionan (menú, reservas, etc.)

### 6.2 Validación Técnica
1. **Chrome DevTools → Lighthouse**
   - Click en `Generate report`
   - Busca scores > 90

2. **Verificar PWA:**
   - Chrome DevTools → Application
   - Manifest: debe mostrar datos del restaurante
   - Service Worker: debe estar "activated"

3. **Verificar API:**
   - Visita `https://enlasnubes.tudominio.com/api/health`
   - Debe responder con `200 OK`

### 6.3 Script de Validación
```bash
# Desde tu computadora
./scripts/validate-deployment.sh

# Output esperado:
# ✅ 73/79 validaciones pasadas
# ✅ PRODUCTION READY
```

---

## 🎉 **¡FELICIDADES! TU WEB ESTÁ EN PRODUCCIÓN**

### ¿Qué tienes ahora funcionando?
✅ **Web completa** en https://enlasnubes.tudominio.com
✅ **PWA instalable** en móviles
✅ **SSL automático** con Let's Encrypt
✅ **CI/CD automatizado** con GitHub Actions
✅ **Monitoreo activo** con health checks
✅ **Backups automáticos** configurados
✅ **SEO optimizado** para Google

### Próximos pasos opcionales:
1. **Instalar la PWA** en tu móvil
2. **Configurar Google Analytics** (si quieres estadísticas)
3. **Probar el sistema de reservas**
4. **Compartir en redes sociales**

---

## 🚨 **¿Problemas Comunes?**

### "No funciona el despliegue"
- **Verifica logs en GitHub Actions**
- **Revisa secrets configurados**
- **Valida que Coolify esté conectado a GitHub**

### "No carga el dominio"
- **Verifica configuración DNS**
- **Espera 30 minutos por propagación**
- **Confirma IP del VPS**

### "SSL no funciona"
- **Espera 10 minutos después de configurar dominio**
- **Verifica que DNS apunte correctamente al VPS**

### "La web carga lento"
- **Es normal en el primer despliegue**
- **Coolify optimiza caché automáticamente**
- **Prueba limpiar cache del navegador**

---

## 📞 **Soporte**

Si tienes problemas:
1. **Revisa logs en Coolify:** Application → Logs
2. **Verifica GitHub Actions:** Repository → Actions
3. **Testea localmente:** `npm run dev`

**¡Tu restaurante ya está en línea y listo para recibir clientes!** 🥩🍺