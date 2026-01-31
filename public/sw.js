/* Links PWA Service Worker */
const VERSION = "v1.0.0";
const STATIC_CACHE = `links-static-${VERSION}`;
const RUNTIME_CACHE = `links-runtime-${VERSION}`;

const CORE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/offline.html",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-512-maskable.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);
    await cache.addAll(CORE_ASSETS);
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => {
      if (k !== STATIC_CACHE && k !== RUNTIME_CACHE) return caches.delete(k);
    }));
    self.clients.claim();
  })());
});

function isApi(url) {
  return url.pathname.startsWith("/api/");
}

// Strategy:
// - /api/* => network-first (fresh data), fallback cache
// - everything else => cache-first, fallback offline page for navigations
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  if (isApi(url)) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      try {
        const fresh = await fetch(req);
        cache.put(req, fresh.clone());
        return fresh;
      } catch (e) {
        const cached = await cache.match(req);
        if (cached) return cached;
        return new Response(JSON.stringify({ ok:false, error:"offline" }), {
          status: 503,
          headers: { "content-type": "application/json" }
        });
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(STATIC_CACHE);
    const cached = await cache.match(req);
    if (cached) return cached;

    try {
      const res = await fetch(req);
      // Only cache same-origin successful responses
      if (res.ok && url.origin === self.location.origin) {
        cache.put(req, res.clone());
      }
      return res;
    } catch (e) {
      // If it's a navigation request, show offline page
      if (req.mode === "navigate") {
        const offline = await cache.match("/offline.html");
        return offline || new Response("Offline", { status: 503 });
      }
      throw e;
    }
  })());
});
