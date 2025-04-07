/* eslint-disable no-restricted-globals */
// Tell ESLint that using 'self' in service workers is okay

const CACHE_NAME = 'seekup-cache-v1';
const DATA_CACHE_NAME = 'seekup-data-cache-v1';
const OFFLINE_URL = '/offline.html';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo192.png',
  '/offline.html',
  '/static/media/placeholder-logo.png'
  // Don't include dynamic JS chunks that might not be available during install
  // These will be cached when they're actually requested
];

// Comment out unused variable to fix the lint error
// const API_ROUTES_TO_CACHE = [
//   '/api/events',
//   '/api/events/recommended'
// ];

// Install the service worker and cache the app shell
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Caching app shell');
        return Promise.all(
          STATIC_ASSETS.map(url => 
            cache.add(url).catch(error => {
              console.log(`[ServiceWorker] Failed to cache: ${url}`, error);
              // Continue despite failure for individual assets
              return null;
            })
          )
        );
      })
      .then(() => {
        console.log('[ServiceWorker] App shell cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[ServiceWorker] Cache installation failed:', error);
        // Continue with service worker installation even if caching fails
        return self.skipWaiting();
      })
  );
});

// Define different caching strategies based on request type
const strategies = {
  // Cache first, falling back to network
  cacheFirst: async (cacheName, request) => {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    try {
      const networkResponse = await fetch(request);
      if (networkResponse && networkResponse.status === 200) {
        const cache = await caches.open(cacheName);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      return null; // Handle appropriately based on request type
    }
  },
  
  // Network first, falling back to cache
  networkFirst: async (cacheName, request) => {
    try {
      const networkResponse = await fetch(request);
      if (networkResponse && networkResponse.status === 200) {
        const cache = await caches.open(cacheName);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      // If no cached response for API, return appropriate offline response
      if (request.url.includes('/api/')) {
        if (request.url.includes('/api/events')) {
          return new Response(JSON.stringify({ message: 'Offline mode', events: [] }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify({ message: 'You are offline' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return null;
    }
  },
  
  // Stale-while-revalidate strategy
  staleWhileRevalidate: async (cacheName, request) => {
    const cachedResponse = await caches.match(request);
    const fetchPromise = fetch(request).then(async networkResponse => {
      if (networkResponse && networkResponse.status === 200) {
        const cache = await caches.open(cacheName);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    });
    return cachedResponse || fetchPromise;
  }
};

// Cache and return requests with appropriate strategy based on request type
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  
  // Skip cross-origin requests
  if (!requestUrl.origin.includes(self.location.origin)) {
    return;
  }
  
  // Handle API requests - network first with specific fallbacks
  if (requestUrl.pathname.startsWith('/api/')) {
    event.respondWith(strategies.networkFirst(DATA_CACHE_NAME, event.request));
    return;
  }
  
  // For HTML navigation requests - network first
  if (event.request.mode === 'navigate') {
    event.respondWith(
      strategies.networkFirst(CACHE_NAME, event.request)
        .then(response => {
          // If we couldn't fetch the page from network, return offline fallback
          if (!response) {
            return caches.match(OFFLINE_URL);
          }
          return response;
        })
    );
    return;
  }
  
  // For images - cache first strategy
  if (event.request.destination === 'image') {
    event.respondWith(strategies.cacheFirst(CACHE_NAME, event.request));
    return;
  }
  
  // For CSS/JS assets - stale-while-revalidate
  if (['style', 'script'].includes(event.request.destination)) {
    event.respondWith(strategies.staleWhileRevalidate(CACHE_NAME, event.request));
    return;
  }
  
  // Default to cache-first for other requests
  event.respondWith(strategies.cacheFirst(CACHE_NAME, event.request));
});

// Activate the service worker and clean up old caches
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate');
  
  const currentCaches = [CACHE_NAME, DATA_CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!currentCaches.includes(cacheName)) {
            console.log('[ServiceWorker] Removing old cache', cacheName);
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
  
  // Ensure service worker takes control of all clients as soon as it activates
  self.clients.claim();
});

// Background sync for offline form submissions
self.addEventListener('sync', event => {
  console.log('[ServiceWorker] Sync event', event.tag);
  
  if (event.tag === 'sync-events-registration') {
    event.waitUntil(syncEventRegistrations());
  } else if (event.tag === 'sync-event-checkin') {
    event.waitUntil(syncEventCheckIns());
  }
});

// Function to sync pending event registrations when back online
async function syncEventRegistrations() {
  try {
    const db = await openDatabase();
    const pendingRegistrations = await getPendingItems(db, 'pendingRegistrations');
    
    for (const registration of pendingRegistrations) {
      try {
        const response = await fetch(`/api/events/${registration.eventId}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${registration.token}`
          },
          body: JSON.stringify({})
        });
        
        if (response.ok) {
          await deletePendingItem(db, 'pendingRegistrations', registration.id);
          console.log(`[ServiceWorker] Successfully synced registration for event ${registration.eventId}`);
        }
      } catch (err) {
        console.error(`[ServiceWorker] Failed to sync registration:`, err);
      }
    }
  } catch (err) {
    console.error('[ServiceWorker] Failed to sync registrations:', err);
  }
}

// Function to sync pending event check-ins when back online
async function syncEventCheckIns() {
  try {
    const db = await openDatabase();
    const pendingCheckIns = await getPendingItems(db, 'pendingCheckIns');
    
    for (const checkIn of pendingCheckIns) {
      try {
        const response = await fetch(`/api/events/${checkIn.eventId}/check-in`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${checkIn.token}`
          },
          body: JSON.stringify({ qrCode: checkIn.qrCode })
        });
        
        if (response.ok) {
          await deletePendingItem(db, 'pendingCheckIns', checkIn.id);
          console.log(`[ServiceWorker] Successfully synced check-in for event ${checkIn.eventId}`);
        }
      } catch (err) {
        console.error(`[ServiceWorker] Failed to sync check-in:`, err);
      }
    }
  } catch (err) {
    console.error('[ServiceWorker] Failed to sync check-ins:', err);
  }
}

// IndexedDB setup helper functions
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('seekupOfflineDB', 1);
    
    request.onerror = () => reject('Failed to open database');
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      
      // Store for pending event registrations
      if (!db.objectStoreNames.contains('pendingRegistrations')) {
        db.createObjectStore('pendingRegistrations', { keyPath: 'id', autoIncrement: true });
      }
      
      // Store for pending event check-ins
      if (!db.objectStoreNames.contains('pendingCheckIns')) {
        db.createObjectStore('pendingCheckIns', { keyPath: 'id', autoIncrement: true });
      }
      
      // Store for cached events data
      if (!db.objectStoreNames.contains('events')) {
        const eventsStore = db.createObjectStore('events', { keyPath: 'id' });
        eventsStore.createIndex('startDate', 'startDate');
      }
    };
  });
}

function getPendingItems(db, storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onerror = () => reject(`Failed to get items from ${storeName}`);
    request.onsuccess = () => resolve(request.result);
  });
}

function deletePendingItem(db, storeName, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    
    request.onerror = () => reject(`Failed to delete item from ${storeName}`);
    request.onsuccess = () => resolve();
  });
}

// Handle push notifications
self.addEventListener('push', event => {
  let notification = {
    title: 'SEEKUP',
    body: 'New notification from SEEKUP',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: {}
  };
  
  // Try to parse notification data if available
  if (event.data) {
    try {
      const data = event.data.json();
      notification = { ...notification, ...data };
    } catch (e) {
      notification.body = event.data.text();
    }
  }

  event.waitUntil(self.registration.showNotification(notification.title, notification));
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  // Try to extract target URL from notification data
  let url = '/';
  if (event.notification.data && event.notification.data.url) {
    url = event.notification.data.url;
  }
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' })
      .then(windowClients => {
        // If a window client already exists, focus it and navigate
        for (const client of windowClients) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open a new window
        return self.clients.openWindow(url);
      })
  );
});
