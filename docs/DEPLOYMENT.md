# Despliegue y validación profesional

## Requisitos

- Node.js 20 LTS
- npm 10 (incluido con Node 20)

## Preparación del entorno

```bash
git clone <repo>
cd en-las-nubes
npm ci
```

## Validaciones obligatorias

```bash
npm run check
```

Este comando ejecuta linting de JavaScript, linting de estilos y la suite de tests con cobertura en modo CI.

## Build de producción

```bash
npm run build
```

El build genera artefactos optimizados en `dist/`, con división de chunks para dependencias pesadas (`three`, `gsap`, `lottie`) y `modulepreload` con polyfill activado.

> Para generar un informe de tamaños adicional ejecuta `npm run build:report`, lo que creará `dist/report.html` para análisis detallado.

## Previsualización local

```bash
npm run preview -- --host
```

Sirve el paquete empacado y permite validaciones multiplataforma desde la red local.

## Checklist posterior al build

- Revisar `dist/report.html` si se ejecutó `npm run build:report` para vigilar tamaños de bundle.
- Verificar que las rutas PWA, manifest y assets PWA estén presentes en `dist/`.
- Confirmar que los chunks `vendor-three.*`, `vendor-gsap.*` y `vendor-lottie.*` se generan correctamente (lazy loading listo).
