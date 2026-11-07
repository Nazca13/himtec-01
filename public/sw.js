// Service worker SAPA. Naikkan VERSION setiap mengubah strategi cache.
const VERSION = 'v2';
const SHELL = `sapa-shell-${VERSION}`;
const RUNTIME = `sapa-runtime-${VERSION}`;
const PRECACHE = ['/offline.html', '/icon-192.png', '/icon-512.png', '/logo.png'];
const NAV_TIMEOUT_MS = 4000;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([SHELL, RUNTIME]);
      for (const key of await caches.keys()) if (!keep.has(key)) await caches.delete(key);
      // Navigation preload: browser mulai mengunduh halaman sambil SW bangun, tanpa menunggu.
      if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
      await self.clients.claim();
    })()
  );
});

const cacheable = (res) => res && res.ok && res.type === 'basic';

async function navigate(event) {
  const cache = await caches.open(RUNTIME);
  try {
    const net = (async () => (await event.preloadResponse) || fetch(event.request))();
    const res = await Promise.race([
      net,
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), NAV_TIMEOUT_MS)),
    ]);
    if (cacheable(res)) cache.put(event.request, res.clone());
    return res;
  } catch {
    // Jaringan mati atau terlalu lambat: pakai salinan terakhir, lalu halaman offline.
    return (await cache.match(event.request)) || (await caches.match('/offline.html'));
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (cacheable(res)) cache.put(request, res.clone());
  return res;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME);
  const hit = await cache.match(request);
  const refresh = fetch(request).then((res) => {
    if (cacheable(res)) cache.put(request, res.clone());
    return res;
  });
  return hit || refresh;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Data selalu langsung ke jaringan: status lansia tidak boleh basi.
  if (url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(navigate(event));
  } else if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/_next/image')) {
    event.respondWith(cacheFirst(request)); // berkas ber-hash: aman disimpan selamanya
  } else if (/\.(png|svg|ico|webp|woff2?)$/.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
