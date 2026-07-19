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
  site: 'https://packclair.example',
  integrations: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      navigateFallback: '/app/',
      manifest: {
        name: 'PackClair DE',
        short_name: 'PackClair',
        description: 'Préparez votre déclaration d’emballages LUCID Allemagne en local.',
        lang: 'fr',
        start_url: '/app/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0b4f8a',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
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
      },
      injectRegister: null
    })
  ],
  output: 'static'
});
