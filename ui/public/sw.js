const CACHE_VERSION = 'v1';
const APP_SHELL_CACHE = `maligna-ui-shell-${CACHE_VERSION}`;
const STATIC_CACHE = `maligna-ui-static-${CACHE_VERSION}`;
const EXAMPLES_CACHE = `maligna-ui-examples-${CACHE_VERSION}`;
const CACHE_NAMES = [APP_SHELL_CACHE, STATIC_CACHE, EXAMPLES_CACHE];

function scopePath() {
  return new URL(self.registration.scope).pathname;
}

function scopedUrl(path) {
  return new URL(path, self.registration.scope).toString();
}

function withinScope(pathname) {
  return pathname.startsWith(scopePath());
}

function isExamplesPath(pathname) {
  return pathname.startsWith(`${scopePath()}examples/`);
}

function isAssetsPath(pathname) {
  return pathname.startsWith(`${scopePath()}assets/`);
}

function parseAssetUrlsFromHtml(html, htmlUrl) {
  const urls = new Set();
  const attrRegex = /\b(?:src|href)=["']([^"']+)["']/g;
  let match;

  while ((match = attrRegex.exec(html)) !== null) {
    const rawPath = match[1];
    if (!rawPath || rawPath.startsWith('data:') || rawPath.startsWith('#')) continue;

    const url = new URL(rawPath, htmlUrl);
    if (url.origin !== self.location.origin) continue;
    if (!withinScope(url.pathname)) continue;

    url.hash = '';
    urls.add(url.toString());
  }

  return urls;
}

async function getAppShellUrls() {
  const urls = new Set([
    scopedUrl('./'),
    scopedUrl('index.html'),
    scopedUrl('examples/manifest.json'),
  ]);

  try {
    const indexUrl = scopedUrl('index.html');
    const response = await fetch(indexUrl, { cache: 'no-cache' });
    if (response.ok) {
      const html = await response.text();
      parseAssetUrlsFromHtml(html, indexUrl).forEach((url) => urls.add(url));
    }
  } catch (_error) {
    // Ignore install-time shell discovery failure; runtime cache will fill in.
  }

  return [...urls];
}

async function cachePutSafe(cacheName, request, response) {
  if (!response || !response.ok || response.type === 'opaque') return;
  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (_error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw _error;
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    await cache.put(request, response.clone());
  }
  return response;
}

async function handleNavigation(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cachePutSafe(APP_SHELL_CACHE, request, response);
      return response;
    }
  } catch (_error) {
    // Fall back to cached shell below.
  }

  const cache = await caches.open(APP_SHELL_CACHE);
  return (await cache.match(scopedUrl('index.html'))) || (await cache.match(scopedUrl('./')));
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const urls = await getAppShellUrls();
    const cache = await caches.open(APP_SHELL_CACHE);
    await Promise.allSettled(urls.map((url) => cache.add(url)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const existing = await caches.keys();
    await Promise.all(
      existing
        .filter((cacheName) => cacheName.startsWith('maligna-ui-') && !CACHE_NAMES.includes(cacheName))
        .map((cacheName) => caches.delete(cacheName)),
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (!withinScope(url.pathname)) return;

  if (request.mode === 'navigate' && !isExamplesPath(url.pathname)) {
    event.respondWith(handleNavigation(request));
    return;
  }

  if (isExamplesPath(url.pathname)) {
    event.respondWith(networkFirst(request, EXAMPLES_CACHE));
    return;
  }

  const destination = request.destination;
  const isStaticDestination = destination === 'style' || destination === 'script' || destination === 'font' || destination === 'image';
  if (isAssetsPath(url.pathname) || isStaticDestination) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (url.pathname === scopePath() || url.pathname === `${scopePath()}index.html`) {
    event.respondWith(networkFirst(request, APP_SHELL_CACHE));
  }
});