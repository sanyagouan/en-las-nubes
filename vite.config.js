import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@data': path.resolve(__dirname, 'src/data'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils': path.resolve(__dirname, 'src/utils')
    }
  },
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
      modernPolyfills: true,
      renderLegacyChunks: true
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'robots.txt',
        'assets/pwa/icon-192.png',
        'assets/pwa/icon-512.png',
        'assets/social/en-las-nubes-cover.webp'
      ],
      manifest: {
        name: 'En las Nubes Restobar',
        short_name: 'En las Nubes',
        description:
          'Restobar en Logroño especializado en cachopos asturianos, cocina alemana auténtica y experiencias gastronómicas cinematográficas.',
        theme_color: '#4299E1',
        background_color: '#1A202C',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        lang: 'es-ES',
        categories: ['food', 'restaurant', 'bar'],
        icons: [
          {
            src: 'assets/pwa/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'assets/pwa/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'assets/pwa/maskable-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: 'assets/pwa/screenshot-desktop.webp',
            sizes: '1280x720',
            type: 'image/webp',
            form_factor: 'wide'
          },
          {
            src: 'assets/pwa/screenshot-mobile.webp',
            sizes: '720x1280',
            type: 'image/webp',
            form_factor: 'narrow'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,avif,json}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'font-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'page-cache'
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  css: {
    devSourcemap: true
  },
  build: {
    target: 'es2019',
    cssMinify: true
  },
  optimizeDeps: {
    include: ['gsap', 'aos', 'lottie-web', 'three']
  },
  server: {
    host: true,
    port: 5173
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov']
    }
  }
})