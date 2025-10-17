---
title: "Estrategia de captura de contenido"
updated: "2025-10-17"
owner: "Droid (Factory.ai)"
status: "en-progreso"
---

# Objetivo

Consolidar **todo** el material público relevante sobre *En las Nubes Restobar* para alimentar la experiencia cinematográfica web. Los insumos abarcan datos estructurados, narrativas, imágenes, vídeos y reseñas verificadas.

# Fuentes priorizadas

| Tipo | Fuente | Justificación | Estado |
| --- | --- | --- | --- |
| Carta + metadatos | [carta.menu/restaurants/logrono/en-las-nubes-restobar](https://carta.menu/restaurants/logrono/en-las-nubes-restobar) | Estructura de menú, fotos oficiales, rating agregado, enlaces a platos e ingredientes. | Captura inicial (HTML crudo en `data/raw/carta-menu.html`). |
| Información corporativa | [celebrarlo.com](https://www.celebrarlo.com) (ficha del restaurante) | Datos de contacto extendidos, capacidades de eventos, fotografías para banquetes. | Pendiente de scraping. |
| Directorio turístico | [lariojaturismo.com](https://lariojaturismo.com) (Listado de restaurantes) | Descripción turística, horarios, experiencias sugeridas, multimedia. | Pendiente. |
| Reseñas | [restaurantguru.com](https://restaurantguru.com) (Perfil) | Extractos de opiniones, valoración ponderada, platos destacados. | Pendiente. |
| Mapas & reseñas extensas | [Google Maps](https://www.google.com/maps) / [Tripadvisor](https://www.tripadvisor.es) | Fotografías de usuarios, reseñas largas, preguntas frecuentes. | Sujeto a limitaciones de acceso automatizado. |
| Delivery | [Uber Eats](https://www.ubereats.com), [Glovo](https://glovoapp.com) | Fotos de carta operativa, precios, disponibilidad. | Pendiente (bloqueos previos). |

# Alcance de captura

* **Datos estructurados**: HTML/JSON original, listados de platos, horarios, servicios, ratings.
* **Recursos visuales**: imágenes oficiales y de usuarios (prioridad a originales en `webp/png`, variantes comprimidas para web).
* **Recursos audiovisuales**: vídeos promocionales o tours virtuales cuando estén públicamente accesibles (descarga a `data/assets/video`).
* **Narrativa**: reseñas destacadas, descripciones de atmósfera, notas de prensa.
* **Metadatos de contacto**: teléfonos, direcciones, enlaces sociales, vCards.

# Organización de archivos

```
data/
  raw/                # HTML/JSON tal cual se descargó
  processed/          # Versiones normalizadas (JSON, Markdown)
assets/
  images/original/    # Descargas sin pérdidas
  images/web/         # Variantes optimizadas (< 1920px, WebP)
  video/              # Clips MP4/WebM relevantes
```

# Próximos pasos

1. Automatizar scraping básico (HTML + JSON) para todas las fuentes priorizadas.
2. Extraer y clasificar imágenes, almacenando originales y copias optimizadas.
3. Identificar reseñas representativas (máx. 280 caracteres) y normalizarlas.
4. Registrar procedencia, fecha y licencia en una tabla de trazabilidad (`processed/attribution.json`).
5. Integrar los nuevos datos en los módulos `menu-experience` y `reservas-experience` respetando lazy loading.

# Riesgos y mitigaciones

* **Bloqueo de scraping** → Priorizar `curl`/`Invoke-WebRequest` con encabezados realistas y respetar robots.txt; recurrir a captura manual cuando sea necesario.
* **Derechos de autor** → Mantener siempre el URL original y limitarse a contenido público sin restricciones explícitas.
* **Peso de assets** → Aplicar optimización con `Sharp`/`imagemin` antes de servir en producción.

# Bitácora

| Fecha | Acción | Notas |
| --- | --- | --- |
| 2025-10-17 | Documento creado | Base de estrategia y estructura de carpetas. |
