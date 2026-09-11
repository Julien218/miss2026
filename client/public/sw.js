const CACHE = 'mmd-2027-v3';
const APP_SHELL = [
  '/',
  '/manifest.webmanifest',
  '/favicon.png',
  '/apple-touch-icon.png',
  '/logo/miss-mister-dour-logo-transparent.webp',
];

const PRIVATE_PREFIXES = [
  '/login',
  '/admin',
  '/dashboard',
  '/dashboard-internal',
  '/my-profile',
  '/candidate/',
  '/contests',
  '/calendar',
  '/choreographer',
  '/jury/',
  '/photographer',
  '/settings',
  '/notifications',
  '/profile/edit/',
  '/onboarding/candidate/',
  '/invite/',
  '/invitation/',
  '/video-factory',
];

function isPrivatePath(pathname) {
  return PRIVATE_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(prefix));
}

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/') || isPrivatePath(url.pathname)) return;

  const isNavigation = event.request.mode === 'navigate';

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Ne cache que des réponses publiques réussies ; toute réponse marquée
        // private/no-store par le serveur reste hors du cache PWA.
        const cacheControl = response.headers.get('cache-control') || '';
        if (response.ok && !/private|no-store/i.test(cacheControl)) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (isNavigation && !isPrivatePath(url.pathname)) return caches.match('/');
        return Response.error();
      })
  );
});
