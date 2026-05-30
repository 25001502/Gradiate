const CACHE_PREFIX = 'gradiate-pwa';
const SHELL_CACHE = `${CACHE_PREFIX}-shell-v3`;
const RUNTIME_CACHE = `${CACHE_PREFIX}-runtime-v1`;
const IMAGE_CACHE = `${CACHE_PREFIX}-images-v1`;
const CURRENT_CACHES = [SHELL_CACHE, RUNTIME_CACHE, IMAGE_CACHE];

const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.png',
  '/icons/apple-touch-icon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-192.png',
  '/icons/maskable-512.png',
];

const EXCLUDED_PATH_PREFIXES = ['/api'];
const STATIC_DESTINATIONS = new Set(['font', 'manifest', 'script', 'style', 'worker']);
const MAX_IMAGE_CACHE_ITEMS = 80;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL_URLS)),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName.startsWith(CACHE_PREFIX))
            .filter((cacheName) => !CURRENT_CACHES.includes(cacheName))
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(request.url);

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (EXCLUDED_PATH_PREFIXES.some((prefix) => requestUrl.pathname.startsWith(prefix))) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (STATIC_DESTINATIONS.has(request.destination)) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, MAX_IMAGE_CACHE_ITEMS));
  }
});

async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch {
    const cachedResponse = await caches.match(request);
    const cachedShell = await caches.match('/index.html');
    const offlineFallback = await caches.match('/offline.html');

    return cachedResponse || cachedShell || offlineFallback || Response.error();
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }

      return response;
    })
    .catch(() => cachedResponse || Response.error());

  return cachedResponse || fetchPromise;
}

async function cacheFirst(request, cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  const response = await fetch(request);

  if (response.ok) {
    cache.put(request, response.clone());
    trimCache(cache, maxItems);
  }

  return response;
}

async function trimCache(cache, maxItems) {
  const keys = await cache.keys();

  if (keys.length <= maxItems) {
    return;
  }

  await cache.delete(keys[0]);
  trimCache(cache, maxItems);
}
