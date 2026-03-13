## PWA V1 – Implementation Spec

**Scope:** Replace brittle `vite-plugin-pwa` `generateSW` + terser pipeline with a stable **injectManifest + custom `sw.ts`** setup, gated to production, and fully passing the build/typecheck gate.

This spec is the detailed reference for the **PWA‑V1 WO**. The handover document only needs a summary and a link to this file.

---

### 1. Problem statement

Previous configuration:
- `vite-plugin-pwa` using Workbox `generateSW` + terser caused `npm run build` to fail with:
  - “Unable to write the service worker file. Unexpected early exit. Unfinished hook action(s) on exit: (terser) renderChunk”.
- Temporary mitigation already applied:
  - `VitePWA({ disable: true, … })` to unblock builds at the cost of disabling PWA features.

Goal:
- Restore a **stable PWA** layer that:
  - Only runs in real production builds.
  - Uses a **typed custom service worker** under our control.
  - Provides offline shell, intelligent caching for APIs/media/docs, and an offline fallback page.

---

### 2. Vite configuration (injectManifest + prod‑only)

File: `SOCELLE-WEB/vite.config.ts`

Implementation outline:

- Determine production:
  - `const isProd = process.env.NODE_ENV === 'production';`
- Configure plugin:
  - ```ts
    VitePWA({
      disable: !isProd,                // Only run in production builds
      strategies: 'injectManifest',    // Use custom SW, not generateSW
      srcDir: 'src',
      filename: 'sw.ts',
      injectRegister: 'auto',
      manifest: {
        // Reuse existing SOCELLE manifest fields:
        // name, short_name, icons, theme_color, background_color, start_url, display, etc.
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    })
    ```
- Remove or avoid any `disable: true` hard‑coded flags once PWA‑V1 is wired.

---

### 3. Service worker (`sw.ts`) behavior

File: `SOCELLE-WEB/src/sw.ts`

Core imports:
- `clientsClaim` from `workbox-core`
- `precacheAndRoute`, `createHandlerBoundToURL` from `workbox-precaching`
- `registerRoute`, `NavigationRoute` from `workbox-routing`
- Strategies:
  - `NetworkFirst`, `StaleWhileRevalidate`, `CacheFirst` from `workbox-strategies`
- Plugins:
  - `ExpirationPlugin` from `workbox-expiration`
  - `CacheableResponsePlugin` from `workbox-cacheable-response`
- Utility:
  - `offlineFallback` from `workbox-recipes`

Type hint:
- `declare let self: ServiceWorkerGlobalScope;`

#### 3.1 App shell + navigation

- Claim clients and precache:
  - `clientsClaim();`
  - `precacheAndRoute(self.__WB_MANIFEST || []);`
- SPA shell for navigations:
  - ```ts
    const appShellHandler = createHandlerBoundToURL('/index.html');
    const navigationRoute = new NavigationRoute(appShellHandler, {
      denylist: [/\/api\//, /\/auth\//],
    });
    registerRoute(navigationRoute);
    ```

#### 3.2 API routes

**Intelligence API**
- Matcher:
  - ```ts
    const isIntelligenceApi = ({ url }: { url: URL }) =>
      url.hostname.endsWith('.supabase.co') &&
      (url.pathname.includes('market_signals') || url.pathname.includes('intelligence'));
    ```
- Strategy:
  - `new NetworkFirst({`
    - `cacheName: 'socelle-intelligence-api',`
    - `networkTimeoutSeconds: 5,`
    - `plugins: [`
      - `new CacheableResponsePlugin({ statuses: [0, 200] }),`
      - `new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 120 }) // ~2 minutes`
    - `],`
  - `})`

**Generic Supabase API**
- Matcher:
  - ```ts
    const isSupabaseApi = ({ url }: { url: URL }) =>
      url.hostname.endsWith('.supabase.co') &&
      (url.pathname.startsWith('/rest/v1') || url.pathname.startsWith('/functions/v1'));
    ```
- Strategy:
  - `new NetworkFirst({`
    - `cacheName: 'socelle-supabase-api',`
    - `networkTimeoutSeconds: 5,`
    - `plugins: [`
      - `new CacheableResponsePlugin({ statuses: [0, 200] }),`
      - `new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 300 }) // ~5 minutes`
    - `],`
  - `})`

Register both with `registerRoute`.

#### 3.3 Static/media caching

**Images**
- Matcher:
  - `({ request }) => request.destination === 'image'`
- Strategy:
  - `new CacheFirst({`
    - `cacheName: 'socelle-images',`
    - `plugins: [`
      - `new CacheableResponsePlugin({ statuses: [0, 200] }),`
      - `new ExpirationPlugin({ maxEntries: 150, maxAgeSeconds: 14 * 24 * 3600 })`
    - `],`
  - `})`

**Fonts and styles (Google/Fontshare)**
- Matcher:
  - ```ts
    ({ url, request }) =>
      (request.destination === 'style' || request.destination === 'font') &&
      (url.hostname.includes('fonts.googleapis.com') ||
       url.hostname.includes('fonts.gstatic.com') ||
       url.hostname.includes('fontshare.com'))
    ```
- Strategy:
  - `new StaleWhileRevalidate({`
    - `cacheName: 'socelle-fonts-styles',`
    - `plugins: [`
      - `new CacheableResponsePlugin({ statuses: [0, 200] }),`
      - `new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 30 * 24 * 3600 })`
    - `],`
  - `})`

**Education / training videos**
- Host: `videos.socelle.com` (or `cdn.socelle.com` once finalized).
- Matcher:
  - ```ts
    const VIDEO_CDN_HOST = 'videos.socelle.com';
    const isVideo = ({ request, url }: { request: Request; url: URL }) =>
      url.hostname === VIDEO_CDN_HOST &&
      (request.destination === 'video' ||
       url.pathname.endsWith('.mp4') ||
       url.pathname.endsWith('.webm'));
    ```
- Strategy:
  - `new CacheFirst({`
    - `cacheName: 'socelle-video',`
    - `plugins: [`
      - `new CacheableResponsePlugin({ statuses: [0, 200] }),`
      - `new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 7 * 24 * 3600 })`
    - `],`
  - `})`

**Docs / help**
- Matcher:
  - ```ts
    const isDocs = ({ url }: { url: URL }) =>
      url.origin === self.location.origin &&
      (url.pathname.startsWith('/help') ||
       url.pathname.startsWith('/docs') ||
       url.pathname.startsWith('/api/docs'));
    ```
- Strategy:
  - `new StaleWhileRevalidate({`
    - `cacheName: 'socelle-docs',`
    - `plugins: [`
      - `new CacheableResponsePlugin({ statuses: [0, 200] }),`
      - `new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 7 * 24 * 3600 })`
    - `],`
  - `})`

#### 3.4 Offline fallback

- Use:
  - `offlineFallback({ pageFallback: '/offline.html' });`
- This will serve `/offline.html` for navigations when the network is unavailable and the shell cannot be reached.

---

### 4. Offline page (`offline.html`)

File: `SOCELLE-WEB/public/offline.html`

Requirements:
- Pearl Mineral V2‑aligned styling (simple, static HTML).
- Messaging:
  - Clear statement that the user is offline.
  - Explanation that intelligence data is live and requires a connection.
  - Suggestion to retry when back online; no false promises of full offline mode.

No JS is required here; it can be a plain HTML file with inlined CSS.

---

### 5. Verification & governance

From `SOCELLE-WEB/`:

1. **Typecheck and build**
   - `npx tsc --noEmit`
   - `npm run build` (ensure `NODE_ENV=production` or equivalent).
   - Both must exit `0` with PWA enabled (i.e., `disable: !isProd` and `isProd` true).

2. **Verify JSON**
   - Add `SOCELLE-WEB/docs/qa/verify_PWA-V1_<timestamp>.json`:
     - `wo_id: "PWA-V1"` (or the canonical WO ID you record in `build_tracker_v2.md`).
     - `tsc: { "exit_code": 0 }`
     - `build: { "exit_code": 0 }`
     - `skills_run`: at minimum `["build-gate"]` (and optionally performance/accessibility skills).
     - `results`: include evidence that:
       - Service worker is registered in prod.
       - Offline fallback loads.
       - App still navigates correctly with PWA enabled.
     - `files_changed`: `["SOCELLE-WEB/vite.config.ts", "SOCELLE-WEB/src/sw.ts", "SOCELLE-WEB/public/offline.html"]`
     - `usability_checks`: mark `no_dead_ends`, `loading_empty_error_states`, and `demo_live_labeling_ok` as appropriate based on checks.

3. **Tracker entry**
   - Add/confirm a `PWA-V1` (or equivalent) infra WO row in `SOCELLE-WEB/docs/build_tracker_v2.md`:
     - Status: `READY_FOR_REVIEW` (until independently certified).
     - Proof: the `verify_PWA-V1_<timestamp>.json` filename.

4. **Lock**
   - Once PWA‑V1 is green and certified, treat this spec as the baseline.
   - Any further changes to PWA behavior should go through a dedicated **PWA‑V2** WO with its own spec and verify JSON.

