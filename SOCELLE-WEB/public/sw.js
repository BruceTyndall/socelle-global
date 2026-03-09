/**
 * SOCELLE — Service Worker (PWA Baseline)
 * WO: V2-MULTI-01
 *
 * Strategy:
 *   - Cache-first for static assets (JS, CSS, fonts, images)
 *   - Network-first for API calls (supabase.co)
 *   - Offline fallback page for navigation requests
 */

const CACHE_VERSION = 'socelle-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const OFFLINE_PAGE = '/offline.html';

/**
 * Precache the offline fallback page on install.
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll([OFFLINE_PAGE]);
    })
  );
  self.skipWaiting();
});

/**
 * Clean up old caches on activate.
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

/**
 * Determine if a request is for a static asset.
 */
function isStaticAsset(url) {
  return /\.(js|css|woff2?|ttf|otf|png|jpg|jpeg|gif|svg|ico|webp)$/.test(url.pathname);
}

/**
 * Determine if a request is an API call (Supabase).
 */
function isApiCall(url) {
  return url.hostname.includes('supabase.co') || url.hostname.includes('supabase.in');
}

/**
 * Fetch handler — route requests to the correct strategy.
 */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) schemes
  if (!url.protocol.startsWith('http')) return;

  // API calls: network-first
  if (isApiCall(url)) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Static assets: cache-first
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // Navigation requests: network with offline fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(navigationFallback(event.request));
    return;
  }
});

/**
 * Cache-first strategy — serve from cache, fall back to network and cache the response.
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 408, statusText: 'Offline' });
  }
}

/**
 * Network-first strategy — try network, fall back to cache.
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('{"error":"offline"}', {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Navigation fallback — try network, serve offline page if unavailable.
 */
async function navigationFallback(request) {
  try {
    return await fetch(request);
  } catch {
    const offlinePage = await caches.match(OFFLINE_PAGE);
    return offlinePage || new Response('Offline', { status: 503 });
  }
}
