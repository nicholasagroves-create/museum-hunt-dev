const CACHE_NAME = "museum-hunt-shell-v2";
const ROOT = new URL("../../../", self.location.href);

const APP_SHELL_FILES = [
  new URL("index.html", ROOT).href,
  new URL("main.js", ROOT).href,
  new URL("app/engine/styles/archive-shell.css", ROOT).href,
  new URL("app/engine/pwa/manifest.webmanifest", ROOT).href,
  new URL("app/games/nc-natural-sciences/skins/default/assets/icons/icon-192.png", ROOT).href,
  new URL("app/games/nc-natural-sciences/skins/default/assets/icons/icon-512.png", ROOT).href
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