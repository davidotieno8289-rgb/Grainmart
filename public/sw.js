/// <reference lib="webworker" />

const CACHE_NAME = 'grainmart-v1';
const STATIC_CACHE = 'grainmart-static-v1';
const DYNAMIC_CACHE = 'grainmart-dynamic-v1';
const IMAGE_CACHE = 'grainmart-images-v1';

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
];

// API routes that should use network-first strategy
const API_ROUTES = [
  '/api/',
  'firestore.googleapis.com',
  'identitytoolkit.googleapis.com',
];

// Image domains to cache
const IMAGE_DOMAINS = [
  'firebasestorage.googleapis.com',
  'images.unsplash.com',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name.startsWith('grainmart-') && 
                   name !== STATIC_CACHE && 
                   name !== DYNAMIC_CACHE && 
                   name !== IMAGE_CACHE;
          })
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - handle requests with appropriate strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // API requests - Network first, fall back to cache
  if (API_ROUTES.some(route => request.url.includes(route))) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    return;
  }

  // Images - Cache first, fall back to network
  if (IMAGE_DOMAINS.some(domain => request.url.includes(domain)) || 
      request.destination === 'image') {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // HTML pages - Network first for fresh content
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstWithOffline(request));
    return;
  }

  // Static assets (JS, CSS, fonts) - Stale while revalidate
  if (request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'font') {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }

  // Default - Network first
  event.respondWith(networkFirst(request, DYNAMIC_CACHE));
});

// Strategy: Cache First
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Return cached response and update cache in background
    updateCache(request, cacheName);
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return placeholder for images
    if (request.destination === 'image') {
      return new Response(
        `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
          <rect fill="#FDF0D5" width="200" height="200"/>
          <text fill="#7A6040" font-family="sans-serif" font-size="48" x="50%" y="50%" text-anchor="middle" dy=".3em">🌾</text>
        </svg>`,
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    throw error;
  }
}

// Strategy: Network First
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Strategy: Network First with Offline Fallback
async function networkFirstWithOffline(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page
    const offlineResponse = await caches.match('/offline.html');
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Fallback HTML
    return new Response(
      `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - GrainMart</title>
        <style>
          body { font-family: 'DM Sans', sans-serif; background: #FBF5E6; color: #1A1208; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; text-align: center; padding: 20px; }
          .container { max-width: 400px; }
          .logo { font-size: 4rem; margin-bottom: 1rem; }
          h1 { font-family: 'Fraunces', serif; color: #2D5016; margin-bottom: 0.5rem; }
          p { color: #7A6040; margin-bottom: 1.5rem; }
          button { background: #C8851A; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 1rem; cursor: pointer; }
          button:hover { background: #F0A830; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">🌾</div>
          <h1>You're Offline</h1>
          <p>Check your internet connection and try again.</p>
          <button onclick="location.reload()">Retry</button>
        </div>
      </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}

// Strategy: Stale While Revalidate
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  const networkPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => null);

  return cachedResponse || networkPromise;
}

// Helper: Update cache in background
async function updateCache(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse);
    }
  } catch (error) {
    // Silently fail - we have cached version
  }
}

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now(),
    },
    actions: data.actions || [
      { action: 'open', title: 'Open' },
      { action: 'close', title: 'Dismiss' },
    ],
    tag: data.tag || 'grainmart-notification',
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'GrainMart', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Check if there's already a window open
      for (const client of clients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-cart') {
    event.waitUntil(syncCart());
  }
  
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders());
  }
});

// Sync cart when back online
async function syncCart() {
  try {
    const cache = await caches.open('grainmart-pending');
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('/cart')) {
        const response = await cache.match(request);
        if (response) {
          const data = await response.json();
          await fetch(request, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          await cache.delete(request);
        }
      }
    }
  } catch (error) {
    console.error('[SW] Cart sync failed:', error);
  }
}

// Sync orders when back online
async function syncOrders() {
  try {
    const cache = await caches.open('grainmart-pending');
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('/orders')) {
        const response = await cache.match(request);
        if (response) {
          const data = await response.json();
          await fetch(request, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          await cache.delete(request);
        }
      }
    }
  } catch (error) {
    console.error('[SW] Orders sync failed:', error);
  }
}

console.log('[SW] Service worker loaded');
