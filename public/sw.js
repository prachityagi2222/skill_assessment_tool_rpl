// KaushalSetu RPL - Offline Service Worker (Cache Version 1.0.0)
// Designed for field RPL camps and areas with intermittent or zero internet connectivity.

const CACHE_NAME = 'kaushalsetu-shell-v1';

// Static application shell assets and extracted qualification catalogs required offline
// - qualifications_index.json (1.8MB): precached — search works offline.
// - Small reference JSONs below: precached — coordinator review + rubrics work offline.
// - qualifications.json (4.7MB, lazy-loaded via getQualificationById): NOT precached to avoid
//   install bloat; covered by runtime stale-while-revalidate below.
// - extraction_review_issues.json + extraction_report.json: precached — audit queue visible offline.
// - Hashed Vite assets (assets/*.js|css): cannot be listed statically; covered by runtime SWR below.
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg',
  './icon-192.svg',
  './icon-512.svg',
  './data/qualifications_index.json',
  './data/assessment_rubrics.json',
  './data/assessment_methods.json',
  './data/curriculum_versions.json',
  './data/evidence_requirements.json',
  './data/competencies.json',
  './data/performance_criteria.json',
  './data/qualification_sources.json',
  './data/modules.json',
  './data/extraction_review_issues.json',
  './data/extraction_report.json'
];

// Install Event: Pre-cache App Shell & Core Reference Catalogs
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Pre-cache core assets gracefully (continue even if non-critical asset fails)
      return Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[SW] Precache item omitted or deferred: ${url}`, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clean up stale caches & claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log(`[SW] Removing outdated cache: ${name}`);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Resilience strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Security Rule: NEVER cache non-GET requests, blob URLs, data URLs, or sensitive records
  if (request.method !== 'GET') {
    return;
  }
  if (url.protocol === 'blob:' || url.protocol === 'data:') {
    return;
  }
  if (url.pathname.includes('/api/auth') || url.pathname.includes('/sensitive/')) {
    return;
  }

  // Strategy 1: HTML Navigation requests (App Shell) -> Network First with Cache Fallback
  // Keys normalized to scope-relative URLs so subpath deploys (/repo/) resolve correctly.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => {
          // If network is offline, return cached app shell.
          // Use registration scope so '/'-fallback does not escape to domain root on subpaths.
          const scopeIndex = new URL('index.html', self.registration.scope);
          return caches.match(scopeIndex, { ignoreSearch: true }).then((cached) => {
            if (cached) return cached;
            return caches.match(request, { ignoreSearch: true }).then((byRequest) => {
              if (byRequest) return byRequest;
              return new Response('<!doctype html><title>Offline</title><p>KaushalSetu is offline. Reconnect to reload.</p>', {
                headers: { 'Content-Type': 'text/html' }
              });
            });
          });
        })
    );
    return;
  }

  // Strategy 2: Static assets (JS, CSS, SVGs, Fonts, JSON reference data) + runtime lazy JSONs
  // (e.g. qualifications.json 4.7MB lazy-loaded): Stale-While-Revalidate.
  // Returns cached copy immediately, revalidates in background; never resolves undefined.
  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (url.origin === self.location.origin || url.hostname.includes('fonts.gstatic.com'))
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed: return cache, else explicit offline fallback (never undefined).
          if (cachedResponse) return cachedResponse;
          if (request.destination === 'document' || request.mode === 'navigate') {
            return caches.match(new URL('index.html', self.registration.scope), { ignoreSearch: true }).then((shell) => {
              return shell || new Response('Offline', { status: 503, statusText: 'Offline' });
            });
          }
          if (request.url.includes('/data/')) {
            return new Response('[]', { headers: { 'Content-Type': 'application/json' } });
          }
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        });

      return cachedResponse || fetchPromise;
    })
  );
});
