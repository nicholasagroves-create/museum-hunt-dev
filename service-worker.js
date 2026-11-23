/* Root-scoped worker: required to control the GitHub Pages app start URL. */
const CACHE = "museum-hunt-pwa-v3";
const SHELL = ["./", "./index.html", "./main.js", "./app/engine/styles/archive-shell.css", "./app/engine/pwa/manifest.webmanifest", "./app/games/nc-natural-sciences/skins/default/assets/icons/icon-192.png", "./app/games/nc-natural-sciences/skins/default/assets/icons/icon-512.png"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(Promise.all([caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("museum-hunt-") && k !== CACHE).map(k => caches.delete(k)))), self.clients.claim()]));
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok) { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); }
    return response;
  }).catch(() => caches.match(event.request)));
});
