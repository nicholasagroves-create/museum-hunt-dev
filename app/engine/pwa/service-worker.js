const CACHE_NAME = "ncns-shell-v1";

const APP_SHELL_FILES = [
  "/index.html",
  "/main.js",
  "/app/engine/styles/archive-shell.css",
  "/app/engine/pwa/manifest.webmanifest",
  "/app/games/nc-natural-sciences/skins/default/assets/icons/icon-192.png",
  "/app/games/nc-natural-sciences/skins/default/assets/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const file of APP_SHELL_FILES) {
        try {
          await cache.add(file);
          console.log("Cached:", file);
        } catch (error) {
          console.error("Failed to cache:", file, error);
        }
      }
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request);
    })
  );
});