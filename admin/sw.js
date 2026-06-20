/* ====================================================
   admin/sw.js — Service Worker mínimo
   Requerido para que la PWA sea instalable.
   No cachea agresivamente para que siempre veas
   los datos de productos actualizados.
   ==================================================== */

const CACHE_NAME = "novacenter-admin-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* Network-first: siempre intenta traer lo último, cae a cache si no hay red */
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
