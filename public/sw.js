const CACHE_NAME = 'neoplan-cache-v1'
const PRECACHE_ASSETS = [
  '/',
  '/logo.svg',
  '/apple-icon',
  '/favicon.ico',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS)
      })
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)),
        )
      })
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  // Tylko zapytania GET
  if (request.method !== 'GET') return

  // Ignorujemy zapytania z innych domen lub chrome-extension
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // 1. Statyczne zasoby Next.js i ikony: Stale-While-Revalidate
  const isStaticAsset =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/favicon.ico' ||
    url.pathname === '/logo.svg'

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone()
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
            }
            return networkResponse
          })
          .catch(() => null)

        return cachedResponse || fetchPromise
      }),
    )
    return
  }

  // 2. Strony HTML i widoki planu: Network First z timeoutem 2.5s na wypadek słabego zasięgu
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      const cachedResponse = await cache.match(request)

      const networkFetch = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          cache.put(request, networkResponse.clone())
        }
        return networkResponse
      })

      // Jeśli mamy zbuforowaną kopię w cache, czekamy max 2500ms na odpowiedź sieci
      if (cachedResponse) {
        const timeoutPromise = new Promise((resolve) =>
          setTimeout(() => resolve(cachedResponse), 2500),
        )
        try {
          return await Promise.race([networkFetch, timeoutPromise])
        } catch {
          return cachedResponse
        }
      }

      // Jeśli nie ma w cache, czekamy na sieć z obsługą błędu braku połączenia
      try {
        return await networkFetch
      } catch {
        if (request.headers.get('accept')?.includes('text/html')) {
          const cachedHome = await cache.match('/')
          if (cachedHome) return cachedHome
        }
        return new Response('Brak połączenia z siecią. Plan nie został wcześniej zbuforowany.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        })
      }
    })(),
  )
})
