const CACHE_NAME = "boston-time-v4";
const SW_PATH = self.location.pathname;
const BASE_PATH = SW_PATH.endsWith("/sw.js")
  ? SW_PATH.slice(0, -"/sw.js".length)
  : "/";
const APP_SHELL = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/manifest.webmanifest`,
  `${BASE_PATH}/icons/icon-192-v2.png`,
  `${BASE_PATH}/icons/icon-512-v2.png`,
  `${BASE_PATH}/icons/icon-v2.svg`
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        return (
          (await caches.match(`${BASE_PATH}/index.html`)) ||
          (await caches.match(`${BASE_PATH}/`))
        );
      })
    );
    return;
  }

  if (
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "worker"
  ) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseCopy = networkResponse.clone();
            void caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(request, responseCopy));
          }

          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) {
            return cached;
          }

          return new Response("", { status: 503, statusText: "Asset unavailable" });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          const responseCopy = networkResponse.clone();
          void caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(request, responseCopy));

          return networkResponse;
        })
        .catch(async () => {
          if (request.destination === "document") {
            return (
              (await caches.match(`${BASE_PATH}/index.html`)) ||
              (await caches.match(`${BASE_PATH}/`))
            );
          }

          return new Response("", { status: 504, statusText: "Offline" });
        });
    })
  );
});
