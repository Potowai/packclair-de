import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import VitePWA from '@vite-pwa/astro';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  },
  site: 'https://cvclair.example',
  integrations: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      navigateFallback: '/app/',
      manifest: {
        name: 'CVClair — CV français qui passe les ATS',
        short_name: 'CVClair',
        description: 'Créez un CV français qui passe les ATS. Gratuit à créer, 2,99 € à télécharger.',
        lang: 'fr',
        start_url: '/app/',
        scope: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1a4f8a',
        icons: [{ src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }]
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: { cacheableResponse: { statuses: [0, 200] } }
          },
          {
            urlPattern: ({ request }) => request.destination !== 'document',
            handler: 'CacheFirst',
            options: { cacheableResponse: { statuses: [0, 200] } }
          }
        ]
      }
    })
  ],
  output: 'static'
});
