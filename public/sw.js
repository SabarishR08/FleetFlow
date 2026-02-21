const CACHE_VERSION = "v1";
const CACHE_NAME = `fleetflow-${CACHE_VERSION}`;

// Assets to cache on install
const ASSETS_TO_CACHE = [
  "/",
  "/_next/static/chunks/main.js",
  "/favicon.ico",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: Caching assets");
      return cache.addAll(ASSETS_TO_CACHE).catch((error) => {
        console.log("Service Worker: Some assets failed to cache", error);
      });
    })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log("Service Worker: Deleting old cache", name);
            return caches.delete(name);
          }
        })
      );
    })
  );
});

// Fetch event - network-first strategy for API, cache-first for assets
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests and some URLs
  if (event.request.method !== "GET") {
    return;
  }

  if (url.pathname.includes("/api/")) {
    // Network-first strategy for API calls
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok && response.status === 200) {
            const cache = caches.open(CACHE_NAME);
            cache.then((c) => c.put(event.request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          // Fall back to cache on network error
          return caches.match(event.request).then((cached) => {
            return (
              cached ||
              new Response(
                JSON.stringify({
                  error: "Offline - cached data may be stale",
                  offline: true,
                }),
                {
                  headers: { "Content-Type": "application/json" },
                  status: 200,
                }
              )
            );
          });
        })
    );
  } else {
    // Cache-first strategy for assets
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return (
          cached ||
          fetch(event.request).then((response) => {
            if (response.ok) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, response.clone());
              });
            }
            return response;
          })
        );
      })
    );
  }
});
