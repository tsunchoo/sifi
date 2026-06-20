const CACHE = 'percoset-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/Sounds/Tamb50.wav',
  '/Sounds/Tamb100.wav',
  '/Sounds/Shak50.wav',
  '/Sounds/Shak100.wav',
  '/Sounds/Clap50.wav',
  '/Sounds/Clap100.wav',
  '/Sounds/CongHi50.wav',
  '/Sounds/CongHi100.wav',
  '/Sounds/CongLo50.wav',
  '/Sounds/CongLo100.wav',
  '/Sounds/BongHi50.wav',
  '/Sounds/BongHi100.wav',
  '/Sounds/BongLo50.wav',
  '/Sounds/BongLo100.wav',
  '/Sounds/Cowb50.wav',
  '/Sounds/Cowb100.wav',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
