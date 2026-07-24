// Minimal service worker — the whole app is one self-contained HTML file
// (samples embedded as base64), so all this needs to do is cache that one
// file and serve it back instantly, so double-click reset (which does a
// real page reload) is fast and local every time — offline or not — rather
// than re-fetching from GitHub Pages on every single reload.
const CACHE_NAME = 'sifi-cache-24jul26-0330'; // bump this string on every deploy — that's what actually busts the old cache

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.add(self.registration.scope))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

// Cache-first, updating the cache in the background — reload/reset is
// instant and local every time. If a network fetch happens to complete
// (e.g. you deploy a new build), the cache quietly picks it up for the
// *next* reload, rather than making the current one wait on it.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const networkUpdate = fetch(e.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return networkResponse;
      }).catch(() => null);
      return cached || networkUpdate || caches.match(self.registration.scope);
    })
  );
});
