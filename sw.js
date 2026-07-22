// Minimal service worker — the whole app is one self-contained HTML file
// (samples embedded as base64), so all this needs to do is cache that one
// file and serve it back when there's no network, so double-click reset
// (which does a real page reload) keeps working offline instead of hitting
// the browser's "no internet" error page.
const CACHE_NAME = 'sifi-cache-v1';

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

// Network-first, falling back to cache when offline — keeps the app fresh
// when there's a connection, but never leaves it stranded without one.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(networkResponse => {
      if (networkResponse && networkResponse.status === 200) {
        const clone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
      }
      return networkResponse;
    }).catch(() => caches.match(e.request).then(cached => cached || caches.match(self.registration.scope)))
  );
});
