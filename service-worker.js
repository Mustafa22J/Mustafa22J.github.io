/* service-worker.js — immersive data-center portfolio.
   - Precaches the app shell; runtime-caches same-origin GET assets (cache-first) so the whole
     experience works offline after the first visit.
   - Navigation requests are network-first with an offline fallback to the cached shell.
   - Never intercepts POST (the Formspree contact submission) or cross-origin requests
     (GitHub / LinkedIn), and never caches non-200 or opaque responses.
   - Bumps the cache version and deletes old caches on activate, so a stale classic site is
     never served after the migration. Relative scope → works from a GitHub Pages subpath. */
const CACHE = 'mj-facility-v1';
const CORE = ['./', './index.html', './manifest.json',
  './assets/icons/icon-192.png', './assets/icons/icon-512.png', './assets/icons/favicon-32.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function cachePut(request, response) {
  // only cache good, same-origin, basic responses — never failures or opaque cross-origin
  if (!response || response.status !== 200 || response.type === 'opaque') return response;
  const copy = response.clone();
  caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
  return response;
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;                          // leave POST (Formspree) to the network
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;           // leave cross-origin (GitHub/LinkedIn/etc.) alone

  if (req.mode === 'navigate') {                             // fresh HTML online, cached shell offline
    event.respondWith(
      fetch(req).then((res) => cachePut(req, res))
        .catch(() => caches.match(req).then((m) => m || caches.match('./index.html')))
    );
    return;
  }
  // static assets: cache-first, populate cache on miss
  event.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => cachePut(req, res)).catch(() => hit))
  );
});
