/**
 * SOCELLE — Workbox Service Worker (PWA-BUILD-UNBLOCK-01)
 *
 * Strategy per PWA_V1_SPEC.md:
 *   - App shell precaching via __WB_MANIFEST (injected by vite-plugin-pwa)
 *   - SPA navigation: NetworkFirst with /api/ and /auth/ denylist
 *   - Intelligence API: NetworkFirst, 2-min cache, 5-sec timeout
 *   - Supabase API: NetworkFirst, 5-min cache, 5-sec timeout
 *   - Images: CacheFirst, 14 days, 150 max entries
 *   - Fonts/styles (Google, Fontshare): StaleWhileRevalidate, 30 days
 *   - Education videos (videos.socelle.com): CacheFirst, 7 days, 10 max
 *   - Docs/help (/docs, /help): StaleWhileRevalidate, 7 days
 *   - Offline fallback: serve /offline.html for failed navigations
 *
 * TypeScript note: this file is excluded from tsconfig.app.json and compiled
 * by vite-plugin-pwa's internal esbuild pipeline.
 */

/// <reference lib="WebWorker" />

import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import {
  NetworkFirst,
  CacheFirst,
  StaleWhileRevalidate,
} from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// Cast self to ServiceWorkerGlobalScope so TypeScript understands the SW context.
// __WB_MANIFEST is replaced at build time by vite-plugin-pwa with the precache manifest.
const swSelf = self as unknown as ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

// ── Core setup ──────────────────────────────────────────────────────────────

clientsClaim();
cleanupOutdatedCaches();
precacheAndRoute(swSelf.__WB_MANIFEST);

// ── SPA shell navigation ─────────────────────────────────────────────────────
// NetworkFirst for all navigation requests; /api/ and /auth/ bypass to network.

registerRoute(
  new NavigationRoute(new NetworkFirst({ cacheName: 'shell' }), {
    denylist: [/\/api\//, /\/auth\//],
  })
);

// ── Intelligence API — NetworkFirst, 2-min cache, 5-sec timeout ──────────────

registerRoute(
  ({ url }) =>
    url.pathname.includes('/rest/v1/market_signals') ||
    url.pathname.includes('intelligence'),
  new NetworkFirst({
    cacheName: 'intelligence-api',
    networkTimeoutSeconds: 5,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxAgeSeconds: 2 * 60 }),
    ],
  })
);

// ── Supabase API — NetworkFirst, 5-min cache, 5-sec timeout ─────────────────

registerRoute(
  ({ url }) => url.hostname.includes('supabase.co'),
  new NetworkFirst({
    cacheName: 'supabase-api',
    networkTimeoutSeconds: 5,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxAgeSeconds: 5 * 60 }),
    ],
  })
);

// ── Images — CacheFirst, 14 days, 150 max entries ────────────────────────────

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxAgeSeconds: 14 * 24 * 60 * 60, maxEntries: 150 }),
    ],
  })
);

// ── Fonts + styles (Google Fonts, Fontshare) — StaleWhileRevalidate, 30 days ─

registerRoute(
  ({ url }) =>
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('api.fontshare.com') ||
    url.hostname.includes('cdn.fontshare.com'),
  new StaleWhileRevalidate({
    cacheName: 'fonts-styles',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
);

// ── Education/training videos (videos.socelle.com) — CacheFirst, 7 days ─────

registerRoute(
  ({ url }) => url.hostname.includes('videos.socelle.com'),
  new CacheFirst({
    cacheName: 'videos',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxAgeSeconds: 7 * 24 * 60 * 60, maxEntries: 10 }),
    ],
  })
);

// ── Docs + help — StaleWhileRevalidate, 7 days ───────────────────────────────

registerRoute(
  ({ url }) =>
    url.pathname.startsWith('/docs') || url.pathname.startsWith('/help'),
  new StaleWhileRevalidate({
    cacheName: 'docs-help',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxAgeSeconds: 7 * 24 * 60 * 60 }),
    ],
  })
);

// ── Offline fallback ──────────────────────────────────────────────────────────
// Serve /offline.html (precached via __WB_MANIFEST) when a navigation fails.

swSelf.addEventListener('fetch', (event: FetchEvent) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open('shell');
        const offline = await cache.match('/offline.html');
        return (
          offline ??
          new Response('Offline — check your connection', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' },
          })
        );
      })
    );
  }
});
