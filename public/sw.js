/**
 * Service Worker dla NeoPlan PWA
 * Wersja v4 - rozdzielone cache dla HTML, RSC oraz zasobów statycznych
 */

const CACHE_VERSION = 'v4'
const STATIC_CACHE = `neoplan-static-${CACHE_VERSION}`
const PAGES_CACHE = `neoplan-pages-${CACHE_VERSION}`
const RSC_CACHE = `neoplan-rsc-${CACHE_VERSION}`

const CURRENT_CACHES = [STATIC_CACHE, PAGES_CACHE, RSC_CACHE]
const OFFLINE_FALLBACK_PATH = '/__offline'

const PRECACHE_STATIC_ASSETS = [
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
  <title>Offline — NeoPlan</title>
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
    <h1>Brak połączenia z internetem</h1>
    <p>Ta strona nie była jeszcze odwiedzona i nie jest zapisana w pamięci podręcznej. Połącz się z internetem, a następnym razem będzie dostępna offline.</p>
    <button onclick="location.reload()">Spróbuj ponownie</button>
  </div>
  <script>
    window.addEventListener('online', function() {
      location.reload();
    });
  </script>
</body>
</html>`

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const [pagesCache, staticCache] = await Promise.all([
        caches.open(PAGES_CACHE),
        caches.open(STATIC_CACHE),
      ])

      // 1. Zapisujemy stronę fallbacku offline w cache stron
      await pagesCache.put(
        new Request(OFFLINE_FALLBACK_PATH),
        new Response(OFFLINE_HTML, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }),
      )

      // 2. Precache strony głównej
      try {
        const homeRes = await fetch('/', { headers: { Accept: 'text/html' } })
        if (homeRes && homeRes.status === 200) {
          await pagesCache.put(new Request('/'), homeRes)
        }
      } catch (err) {
        console.warn('[SW] Nie udało się precachować /:', err)
      }

      // 3. Precache zasobów statycznych (ikony, logo)
      await Promise.allSettled(
        PRECACHE_STATIC_ASSETS.map(async (url) => {
          try {
            const res = await fetch(url)
            if (res && res.status === 200) {
              await staticCache.put(new Request(url), res)
            }
          } catch (err) {
            console.warn('[SW] Nie udało się precachować zasobu statycznego:', url, err)
          }
        }),
      )
    })().then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => !CURRENT_CACHES.includes(name))
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

  // 1. ZASOBY STATYCZNE NEXT.JS (/_next/static/...)
  // Pliki te zawierają hashe w nazwach, więc są niezmienne (immutable).
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE)
        const cached = await cache.match(request)
        if (cached) return cached

        try {
          const response = await fetch(request)
          if (response && response.status === 200) {
            cache.put(request, response.clone())
          }
          return response
        } catch {
          return new Response('', { status: 408, statusText: 'Request Timeout' })
        }
      })(),
    )
    return
  }

  // 2. POZOSTAŁE ZASOBY STATYCZNE (ikony, fonty, logo, obrazy)
  const isStaticAsset =
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/favicon.ico' ||
    url.pathname === '/logo.svg' ||
    url.pathname === '/apple-icon' ||
    /\.(svg|png|jpg|jpeg|webp|ico|woff2?)$/i.test(url.pathname)

  if (isStaticAsset) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE)
        const cached = await cache.match(request)

        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (
              networkResponse &&
              networkResponse.status === 200 &&
              networkResponse.type !== 'opaque'
            ) {
              cache.put(request, networkResponse.clone())
            }
            return networkResponse
          })
          .catch(() => null)

        if (cached) {
          return cached
        }

        const networkRes = await fetchPromise
        if (networkRes) return networkRes

        return new Response('', { status: 404, statusText: 'Not Found' })
      })(),
    )
    return
  }

  // 3. ŻĄDANIA REACT SERVER COMPONENTS (RSC)
  // Przejścia client-side w Next.js App Router (nagłówek RSC: 1 lub parametr _rsc)
  const isRSC =
    request.headers.get('RSC') === '1' ||
    request.headers.get('Next-Router-Prefetch') === '1' ||
    request.headers.get('Next-Router-State-Tree') !== null ||
    url.searchParams.has('_rsc')

  if (isRSC) {
    event.respondWith(
      (async () => {
        const rscCache = await caches.open(RSC_CACHE)

        try {
          const networkResponse = await fetch(request)
          if (networkResponse && networkResponse.status === 200) {
            const ct = networkResponse.headers.get('content-type') || ''
            // Upewniamy się, że to payload RSC, a nie HTML
            if (!ct.includes('text/html')) {
              await rscCache.put(request, networkResponse.clone())
              await rscCache.put(new Request(url.pathname), networkResponse.clone())

              // W tle pobieramy i cachujemy pełny dokument HTML dla tej strony,
              // aby przy odświeżeniu offline strona była natychmiast dostępna!
              if (url.pathname !== '/' && !url.pathname.startsWith('/api/')) {
                event.waitUntil(
                  (async () => {
                    try {
                      const pagesCache = await caches.open(PAGES_CACHE)
                      const existingHtml = await pagesCache.match(url.pathname)
                      if (!existingHtml) {
                        const htmlRes = await fetch(url.pathname, {
                          headers: { Accept: 'text/html' },
                        })
                        if (
                          htmlRes &&
                          htmlRes.status === 200 &&
                          (htmlRes.headers.get('content-type') || '').includes('text/html')
                        ) {
                          await pagesCache.put(new Request(url.pathname), htmlRes)
                        }
                      }
                    } catch {}
                  })(),
                )
              }
            }
          }
          return networkResponse
        } catch {
          // Pobieramy z RSC_CACHE
          let cachedRSC = await rscCache.match(request)
          if (!cachedRSC) {
            cachedRSC = await rscCache.match(url.pathname)
          }
          if (!cachedRSC) {
            cachedRSC = await rscCache.match(request, { ignoreSearch: true })
          }

          if (cachedRSC) {
            const ct = cachedRSC.headers.get('content-type') || ''
            // BEZWZGLĘDNA ZASADA: Nigdy nie zwracamy HTML dla żądania RSC
            if (!ct.includes('text/html')) {
              return cachedRSC
            }
          }

          throw new TypeError('Brak połączenia: zasób RSC nie jest zapisany w pamięci podręcznej')
        }
      })(),
    )
    return
  }

  // 4. NAWIGACJA DOKUMENTÓW HTML (ładowanie strony, odświeżenie, wejście z PWA)
  const isHtmlNavigation =
    request.mode === 'navigate' ||
    (request.headers.get('accept') && request.headers.get('accept').includes('text/html'))

  if (isHtmlNavigation) {
    event.respondWith(
      (async () => {
        const pagesCache = await caches.open(PAGES_CACHE)

        try {
          const networkResponse = await fetch(request)
          if (networkResponse && networkResponse.status === 200) {
            const ct = networkResponse.headers.get('content-type') || ''
            // BEZWZGLĘDNA ZASADA: Do PAGES_CACHE zapisujemy WYŁĄCZNIE dokumenty HTML!
            if (ct.includes('text/html')) {
              await pagesCache.put(request, networkResponse.clone())
              if (url.pathname !== '/') {
                await pagesCache.put(new Request(url.pathname), networkResponse.clone())
              }
            }
          }
          return networkResponse
        } catch {
          // Szukamy zapisanego dokumentu HTML w PAGES_CACHE
          let cachedResponse = await pagesCache.match(request)
          if (!cachedResponse) {
            cachedResponse = await pagesCache.match(url.pathname)
          }
          if (!cachedResponse && url.pathname === '/') {
            cachedResponse = await pagesCache.match('/')
          }

          // BEZWZGLĘDNA ZASADA: Nigdy nie zwracamy strumienia RSC (ściany kodu) dla nawigacji HTML!
          if (cachedResponse) {
            const ct = cachedResponse.headers.get('content-type') || ''
            if (ct.includes('text/html')) {
              return cachedResponse
            }
            console.warn('[SW] Zignorowano odpowiedź, która nie jest HTML:', ct)
          }

          // Jeśli strona nie była wcześniej odwiedzona, wyświetlamy fallback offline
          const offlinePage = await pagesCache.match(OFFLINE_FALLBACK_PATH)
          if (offlinePage) {
            return offlinePage
          }

          return new Response(OFFLINE_HTML, {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          })
        }
      })(),
    )
    return
  }

  // 5. POZOSTAŁE ŻĄDANIA
  event.respondWith(
    (async () => {
      try {
        return await fetch(request)
      } catch {
        throw new TypeError('Failed to fetch: offline')
      }
    })(),
  )
})
