const CACHE_NAME = "limore-cloud-shell-v5";
const SHELL_FILES = [
    "/",
    "/index.html",
    "/style.css?v=20260407-3",
    "/script.js?v=20260407-3",
    "/desktop-enhancements.js?v=20260407-3",
    "/manifest.webmanifest",
    "/assets/game-cloud.webp",
    "/assets/chrome-custom-v1.png",
    "/assets/edge-custom-v1.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.map((key) => (key === CACHE_NAME ? null : caches.delete(key)))
        ))
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const request = event.request;

    if (request.method !== "GET") {
        return;
    }

    const requestUrl = new URL(request.url);
    if (requestUrl.origin !== self.location.origin) {
        return;
    }

    const isLiveApi =
        requestUrl.pathname.startsWith("/api/")
        || requestUrl.pathname === "/network-info"
        || requestUrl.pathname === "/health";

    // Never cache live API responses. Always go to network first.
    if (isLiveApi) {
        event.respondWith(fetch(request, { cache: "no-store" }));
        return;
    }

    const isHotAsset =
        requestUrl.pathname.endsWith(".js")
        || requestUrl.pathname.endsWith(".css")
        || requestUrl.pathname.endsWith(".html")
        || requestUrl.pathname === "/";

    if (request.mode === "navigate" || isHotAsset) {
        event.respondWith(
            fetch(request, { cache: "no-store" })
                .then((response) => {
                    if (response && response.status === 200) {
                        const cloned = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
                    }
                    return response;
                })
                .catch(() => caches.match(request).then((cached) => cached || caches.match("/index.html")))
        );
        return;
    }

    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) {
                return cached;
            }
            return fetch(request).then((response) => {
                if (!response || response.status !== 200) {
                    return response;
                }
                const cloned = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
                return response;
            });
        })
    );
});
