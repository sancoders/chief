// Service worker de Caseras: fallback offline y notificaciones push.
// Subí la versión del caché cuando cambien los assets precacheados.
const CACHE = "caseras-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  // offline.html es autocontenida (estilos e ícono inline), no precacheamos más.
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll([OFFLINE_URL])));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Solo intercepta navegaciones: red primero, pantalla offline si no hay conexión.
self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE_URL)));
});

// Push: listo para cuando se configuren claves VAPID y suscripciones en el server.
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Caseras", {
      body: data.body,
      icon: data.icon ?? "/icon-192.png",
      badge: "/icon-192.png",
      data: data.data,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/panel";
  event.waitUntil(clients.openWindow(url));
});
