# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos esenciales

### Desarrollo
- `npm run dev` - Servidor de desarrollo en puerto 5173
- `npm run build` - Build para producción con optimización
- `npm run preview` - Preview del build local

### Calidad y Testing
- `npm run check` - **Comando obligatorio antes de commits**: ejecuta linting + testing + coverage
- `npm run lint` - ESLint para JavaScript
- `npm run lint:styles` - Stylelint para CSS/SCSS
- `npm test` - Tests con Vitest (watch mode)
- `npm run test:run` - Tests una sola vez
- `npm run test:coverage` - Tests con reporte de cobertura

### Utilidades
- `npm run build:report` - Genera reporte visual del bundle con ANALYZE=true
- `node scripts/extract-content.mjs` - Extrae y procesa contenido de fuentes externas

## Arquitectura principal

### Estructura modular
- **Frontend moderno**: Vite + Vanilla JavaScript ES2023 (sin frameworks)
- **Carga diferida**: Sistema con `createLazyModule()` y `observeAndLoad()` en main.js
- **PWA completo**: Service Worker con Workbox, manifest y caching estratégico
- **Testing**: Vitest + jsdom con custom matchers para accesibilidad

### Pipeline de contenido externo
El proyecto procesa automáticamente datos de:
- cartamenú.com (carta en tiempo real)
- celebrarlo.com (información del restaurante)
- restaurantguru.com (reseñas y valoraciones)

Script: `scripts/extract-content.mjs` genera JSON procesados en `data/processed/`

### Animaciones cinematográficas
- **Three.js**: Canvas 3D con partículas y parallax en héroe
- **GSAP**: Timeline animations, parallax scrolling y micro-interacciones
- **Lottie Web**: Animaciones vectoriales complejas

### Estructura de módulos
- `src/main.js` - Punto de entrada con carga diferida
- `src/modules/app.js` - Renderizado del DOM principal
- `src/modules/hero-animations.js` - Animaciones Three.js/GSAP del héroe
- `src/modules/menu-experience.js` - Carta interactiva con búsqueda
- `src/modules/reservas-experience.js` - Sistema de reservas con WhatsApp
- `src/modules/navigation.js` - Navegación smooth scroll
- `src/modules/performance.js` - Budgeting y métricas
- `src/modules/pwa.js` - Service Worker y caché
- `src/modules/theme.js` - Toggle modo claro/oscuro

### Arquitectura CSS
- **CSS Layers**: Sistema en `src/styles/` con `@layer components`
- **Nomenclatura**: Prefijo `cloud-` para componentes principales
- **Variables**: Sistema de diseño en `src/styles/variables.css`
- **1000+ líneas** de componentes principales con CSS custom properties

### Optimización de performance
- **Bundle splitting**: Chunks separados para `three`, `gsap`, `lottie`
- **Module preload**: Optimización de carga de módulos
- **Image optimization**: WebP/AVIF con fallbacks
- **Caching strategy**: Service Worker con caché por tipo de recurso

## Convenciones importantes

### Nomenclatura
- Componentes: prefijo `cloud-` (ej: `cloud-container`, `hero-cloud`)
- IDs de sección: nombres descriptivos (`hero`, `menu`, `reservas`)
- Clases utilitarias: BEM-inspired con prefijo `cloud-`

### Testing
- Tests escritos en español
- Custom matchers para accesibilidad en `tests/setup.js`
- Cobertura mínima requerida antes de commits

### PWA Features
- Offline first con Service Worker
- App manifest para instalación
- Skip links para accesibilidad
- Theme toggle con preferencias guardadas

### Datos externos
- Pipeline automatizado con `extract-content.mjs`
- Fuentes verificadas: cartamenú.com, celebrarlo.com, restaurantguru.com
- JSON procesados en `data/processed/` con normalización de encoding

## Targets de performance
- Bundle size total: < 2MB
- LCP (Largest Contentful Paint): < 2.5s
- TBT (Total Blocking Time): < 200ms
- Cache hit rate: > 90% para assets estáticos

## Desarrollo workflow
1. Ejecutar `npm run check` antes de cualquier commit
2. Usar `npm run dev` para desarrollo
3. Probar con `npm run test:coverage` antes de PRs
4. Verificar bundle con `npm run build:report` si se añaden dependencias