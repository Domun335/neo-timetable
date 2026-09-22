import { schoolConfig } from '../school.config.js'

export default function manifest() {
  return {
    name: schoolConfig.meta.title || 'NeoPlan',
    short_name: schoolConfig.shortName || 'NeoPlan',
    description: schoolConfig.meta.description || 'Nowoczesny plan lekcji',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: schoolConfig.branding?.primaryColor || '#0284c7',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: schoolConfig.branding?.logo || '/logo.svg',
        sizes: 'any',
        type: (schoolConfig.branding?.logo || '/logo.svg').endsWith('.png')
          ? 'image/png'
          : (schoolConfig.branding?.logo || '/logo.svg').endsWith('.webp')
            ? 'image/webp'
            : 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
