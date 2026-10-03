const CACHE_NAME = 'neoplan-cache-v2'
const OFFLINE_FALLBACK_PATH = '/__offline'

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

const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Offline \u2014 NeoPlan</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,-apple-system,sans-serif;min-height:100dvh;display:flex;align-items:center;justify-content:center;background:#0f172a;color:#e2e8f0;padding:1.5rem}
    .card{text-align:center;max-width:24rem}
    .icon{width:4rem;height:4rem;margin:0 auto 1.5rem;border-radius:1.5rem;background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.25);display:flex;align-items:center;justify-content:center}
    .icon svg{width:2rem;height:2rem;color:#f59e0b}
    h1{font-size:1.25rem;font-weight:800;margin-bottom:.5rem}
    p{font-size:.875rem;color:#94a3b8;line-height:1.6;margin-bottom:1.5rem}
    button{background:#0284c7;color:#fff;border:none;padding:.625rem 1.5rem;border-radius:.75rem;font-size:.875rem;font-weight:600;cursor:pointer;transition:background .15s}
    button:hover{background:#0369a1}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18M10.5 6.5a7.5 7.5 0 017.038 4.876M4.002 8.626a7.5 7.5 0 012.498-2.126M7.5 14.5a4.5 4.5 0 015.124-1.124M12 18h.01"/>
      </svg>
    </div>
    <h1>Brak po\u0142\u0105czenia z internetem</h1>
    <p>Ta strona nie by\u0142a jeszcze odwiedzona i nie jest zapisana w pami\u0119ci podr\u0119cznej. Po\u0142\u0105cz si\u0119 z internetem, a nast\u0119pnym razem b\u0119dzie dost\u0119pna offline.</p>
    <button onclick="location.reload()">Spr\xf3buj ponownie</button>
  </div>
</body>
</html>`

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(async (cache) => {
        await cache.put(
          new Request(OFFLINE_FALLBACK_PATH),
          new Response(OFFLINE_HTML, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          }),
        )
        await Promise.allSettled(
          PRECACHE_ASSETS.map((url) =>
            cache.add(url).catch((err) => {
              console.warn('[SW] Nie udało się precachować:', url, err)
            }),
          ),
        )
      })
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Usuwam stary cache:', name)
              return caches.delete(name)
            }),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
      }),
    )
    return
  }

  const isStaticAsset =
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/favicon.ico' ||
    url.pathname === '/logo.svg' ||
    /\.(svg|png|jpg|jpeg|webp|ico|woff2?)$/i.test(url.pathname)

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (
              networkResponse &&
              networkResponse.status === 200 &&
              networkResponse.type !== 'opaque'
            ) {
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

  const isNavigation =
    request.headers.get('accept')?.includes('text/html') ||
    request.headers.get('RSC') === '1' ||
    request.headers.get('Next-Router-Prefetch') === '1'

  if (isNavigation) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME)

        try {
          const networkResponse = await fetch(request)
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone())
          }
          return networkResponse
        } catch {
          const cachedResponse = await cache.match(request)
          if (cachedResponse) return cachedResponse

          if (request.headers.get('accept')?.includes('text/html')) {
            const cachedHome = await cache.match('/')
            if (cachedHome) return cachedHome

            const offlinePage = await cache.match(OFFLINE_FALLBACK_PATH)
            if (offlinePage) return offlinePage
          }

          return new Response('Brak połączenia z siecią.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          })
        }
      })(),
    )
    return
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
      .catch(async () => {
        const cached = await caches.match(request)
        return (
          cached ||
          new Response('Offline', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          })
        )
      }),
  )
})
