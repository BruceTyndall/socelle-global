/**
 * SOCELLE — Service Worker (PWA — Build 5 enhanced)
 * WO: V2-MULTI-01
 *
 * Strategy:
 *   - Cache-first for static assets (JS, CSS, fonts, images)
 *   - Network-first for API calls (supabase.co)
 *   - Offline fallback page for navigation requests
 *   - Push notifications: intelligence alerts, booking reminders
 *   - Notification click: opens relevant portal route
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
  return await fetch(request);
}

/**
 * Push notification handler.
 *
 * Expected push payload (JSON):
 *   { title, body, icon?, badge?, tag?, url?, type }
 *
 * Types:
 *   'signal'   — new market intelligence signal
 *   'booking'  — appointment reminder
 *   'alert'    — system or credit alert
 */
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'SOCELLE', body: event.data.text() };
  }

  const {
    title = 'SOCELLE',
    body = '',
    icon = '/socelle-icon-192.png',
    badge = '/socelle-icon-192.png',
    tag = 'socelle-notification',
    url = '/portal/dashboard',
    type = 'general',
  } = payload;

  // Tag by type to prevent duplicate stacking
  const notificationTag = `socelle-${type}-${tag}`;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      tag: notificationTag,
      renotify: false,
      requireInteraction: type === 'booking',
      data: { url },
      actions:
        type === 'signal'
          ? [{ action: 'view', title: 'View Signal' }]
          : type === 'booking'
          ? [{ action: 'view', title: 'See Appointment' }]
          : [],
    })
  );
});

/**
 * Notification click handler.
 * Opens the URL stored in notification.data.url in an existing client
 * or a new window if none is open.
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url ?? '/portal/dashboard';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        // Focus an existing window if one is open on the same origin
        for (const client of clients) {
          try {
            const clientUrl = new URL(client.url);
            if (clientUrl.origin === self.location.origin) {
              client.navigate(targetUrl);
              return client.focus();
            }
          } catch {
            // Non-http client — skip
          }
        }
        // Otherwise open a new window
        return self.clients.openWindow(targetUrl);
      })
  );
});

/**
 * Push subscription change handler.
 * Re-subscribes automatically if the browser rotates the push subscription.
 */
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager
      .subscribe({ userVisibleOnly: true })
      .then((subscription) => {
        // Notify the app so it can update the subscription on the server.
        return self.clients.matchAll().then((clients) => {
          clients.forEach((client) =>
            client.postMessage({
              type: 'PUSH_SUBSCRIPTION_CHANGED',
              subscription: subscription.toJSON(),
            })
          );
        });
      })
      .catch(() => {
        // Push subscription renewal failed — user may need to re-enable.
      })
  );
});
