/* ========================================
   TABINK SERVICE WORKER
   Provides offline support and caching
   ======================================== */

const CACHE_NAME = 'tabink-v1';
const ASSETS_TO_CACHE = [
  '../',
  '../index.html',
  '../assets/style.css',
  '../assets/icons/icons.svg',
  '../lib/sql-wasm.js',
  '../lib/sql-wasm.wasm',
  '../functions/db.js',
  '../functions/config.js',
  '../functions/ui.js',
  '../functions/settings.js',
  '../apps/widgets/files-widget.js',
  '../apps/widgets/tasks-widget.js',
  '../apps/widgets/feed-widget.js',
  '../apps/widgets/timer-widget.js',
  '../apps/files.html',
  '../apps/tasks.html',
  '../apps/feed.html',
  '../apps/timer.html',
  '../apps/settings.html',
  '../apps/database.html'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[Service Worker] Cache failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests (like RSS feeds)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        return fetch(event.request).then((response) => {
          // Don't cache if not a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache the fetched response for future use
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      })
      .catch(() => {
        // Return a custom offline page if needed
        console.log('[Service Worker] Fetch failed, offline mode');
      })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
