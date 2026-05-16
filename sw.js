/**
 * sw.js — Service Worker para PWA offline-capable
 */

const CACHE_NAME = 'ar-nav-v1';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/app.html',
  '/manifest.json',
  '/css/styles.css',
  '/js/ar-components.js',
  '/js/navigation.js',
  '/js/ui.js',
  '/markers/index.html',
];

// Instalación: cachear assets estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activación: limpiar caches viejos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: red primero, cache como fallback
self.addEventListener('fetch', (event) => {
  // No interceptar peticiones a CDNs externos (A-Frame, AR.js)
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
