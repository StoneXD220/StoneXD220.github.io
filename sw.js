const CACHE_NAME = 'apex-smp-v18';
const APP_ASSETS = ['/', '/index.html', '/styles.css?v=18', '/app.js?v=18', '/manifest.webmanifest', '/apex-smp-logo.png'];
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', (event) => {
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
