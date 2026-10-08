// Si•Fi service worker — NETWORK FIRST for the page itself.
// The old version served the cached copy first and only updated it in the background, so every
// deploy showed up one launch late (the phone kept running the previous build). Now: when online,
// the page always comes fresh from GitHub Pages (and the cache is refreshed); the cached copy is
// only used when the network fails (offline). Everything else stays cache-first.
const CACHE_NAME = 'sifi-cache-v2';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.add(self.registration.scope)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(names => Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const isPage = req.mode === 'navigate' || req.destination === 'document';
  if (isPage) {
    e.respondWith(
      fetch(req, { cache: 'no-store' }).then(res => {
        if (res && res.status === 200) { const copy = res.clone(); caches.open(CACHE_NAME).then(c => c.put(self.registration.scope, copy)); }
        return res;
      }).catch(() => caches.match(self.registration.scope).then(c => c || caches.match(req)))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      if (res && res.status === 200) { const copy = res.clone(); caches.open(CACHE_NAME).then(c => c.put(req, copy)); }
      return res;
    }))
  );
});
