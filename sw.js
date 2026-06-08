// Service Worker — italiano-pwa v1
// Minimal: solo habilita instalación como PWA. Sin cache offline en v1.
const CACHE = 'italiano-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  // Pass through all requests — no offline cache in v1
  e.respondWith(fetch(e.request));
});
