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
  console.log('[ServiceWorker] Background sync event:', event.tag);
  
  if (event.tag === 'sync-offline-data') {
    // Sync all offline data (comprehensive sync) - explicitly invoke the function here
    event.waitUntil(
      (async () => {
        console.log('[ServiceWorker] Starting comprehensive offline sync');
        const checkInsResult = await syncPendingCheckIns();
        const registrationsResult = await syncPendingRegistrations();
        return checkInsResult && registrationsResult;
      })()
    );
  } else if (event.tag === 'sync-event-checkin') {
    // Sync only check-ins
    event.waitUntil(syncPendingCheckIns());
  } else if (event.tag === 'sync-events-registration') {
    // Sync only registrations
    event.waitUntil(syncPendingRegistrations());
  }
});

// Sync pending check-ins with the server
async function syncPendingCheckIns() {
  try {
    // Get cached pending check-ins
    const db = await openDatabase();
    const pendingCheckIns = await db.getAllFromIndex('checkins', 'status', 'pending');
    
    if (!pendingCheckIns || pendingCheckIns.length === 0) {
      console.log('[ServiceWorker] No pending check-ins to sync');
      return true;
    }
    
    console.log(`[ServiceWorker] Syncing ${pendingCheckIns.length} pending check-ins`);
    
    // Process each pending check-in
    for (const checkIn of pendingCheckIns) {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json'
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch('/api/events/check-in', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            eventId: checkIn.eventId,
            userId: checkIn.userId,
            timestamp: checkIn.timestamp
          })
        });
        
        if (response.ok) {
          console.log(`[ServiceWorker] Check-in synced successfully for ID: ${checkIn.id}`);
          
          // For successful check-ins, after a certain time we can clean up old records
          // to prevent IndexedDB from growing too large
          if (checkIn.attemptCount && checkIn.attemptCount > 3) {
            // Clean up old records that have been repeatedly processed
            await deletePendingItem(db, 'checkins', checkIn.id);
            console.log(`[ServiceWorker] Removed old check-in record ${checkIn.id} after multiple sync attempts`);
          } else {
            // Update status in IndexedDB
            const tx = db.transaction('checkins', 'readwrite');
            checkIn.status = 'synced';
            checkIn.syncedAt = new Date().toISOString();
            await tx.store.put(checkIn);
            await tx.done;
          }
          
          // Show notification to user
          await showSyncNotification('Check-in Synced', 'Your offline check-in has been successfully synchronized.');
        } else {
          console.error(`[ServiceWorker] Failed to sync check-in: ${response.status}`);
          
          // If it's a client error (4xx), mark as failed; otherwise, keep as pending
          const tx = db.transaction('checkins', 'readwrite');
          checkIn.status = response.status >= 400 && response.status < 500 ? 'failed' : 'pending';
          checkIn.lastAttempt = new Date().toISOString();
          checkIn.attemptCount = (checkIn.attemptCount || 0) + 1;
          checkIn.lastError = `HTTP Status: ${response.status}`;
          await tx.store.put(checkIn);
          await tx.done;
        }
      } catch (error) {
        console.error(`[ServiceWorker] Error syncing check-in ${checkIn.id}:`, error);
        
        // Update the record with error info
        try {
          const tx = db.transaction('checkins', 'readwrite');
          checkIn.lastAttempt = new Date().toISOString();
          checkIn.attemptCount = (checkIn.attemptCount || 0) + 1;
          checkIn.lastError = error.message;
          await tx.store.put(checkIn);
          await tx.done;
        } catch (dbError) {
          console.error('[ServiceWorker] Error updating check-in status:', dbError);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('[ServiceWorker] Sync check-ins failed:', error);
    return false;
  }
}

// Sync pending event registrations with the server
async function syncPendingRegistrations() {
  try {
    const db = await openDatabase();
    const pendingRegistrations = await getPendingItems(db, 'pendingRegistrations');
    
    if (!pendingRegistrations || pendingRegistrations.length === 0) {
      console.log('[ServiceWorker] No pending registrations to sync');
      return true;
    }
    
    console.log(`[ServiceWorker] Syncing ${pendingRegistrations.length} pending registrations`);
    
    // Process each pending registration
    for (const registration of pendingRegistrations) {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json'
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`/api/events/${registration.eventId}/register`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            userId: registration.userId,
            timestamp: registration.timestamp
          })
        });
        
        if (response.ok) {
          console.log(`[ServiceWorker] Registration synced successfully for event ${registration.eventId}`);
          
          // Update status in IndexedDB
          const tx = db.transaction('pendingRegistrations', 'readwrite');
          await tx.store.delete(registration.id);
          await tx.done;
          
          // Show notification to user
          await showSyncNotification('Registration Synced', 'Your offline registration has been successfully synchronized.');
        } else {
          console.error(`[ServiceWorker] Failed to sync registration: ${response.status}`);
          
          // If it's a client error (4xx), mark as failed; otherwise, keep as pending
          const tx = db.transaction('pendingRegistrations', 'readwrite');
          registration.status = response.status >= 400 && response.status < 500 ? 'failed' : 'pending';
          registration.lastAttempt = new Date().toISOString();
          registration.attemptCount = (registration.attemptCount || 0) + 1;
          registration.lastError = `HTTP Status: ${response.status}`;
          await tx.store.put(registration);
          await tx.done;
        }
      } catch (err) {
        console.error(`[ServiceWorker] Failed to sync registration:`, err);
      }
    }
  } catch (err) {
    console.error('[ServiceWorker] Failed to sync registrations:', err);
  }
}

// Utility function to show notification to user about sync status
async function showSyncNotification(title, message) {
  try {
    await self.registration.showNotification(title, {
      body: message,
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: 'sync-notification'
    });
    return true;
  } catch (error) {
    console.error('[ServiceWorker] Failed to show sync notification:', error);
    return false;
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
    try {
      const transaction = db.transaction(storeName, 'readwrite');
      const objectStore = transaction.objectStore(storeName);
      const request = objectStore.delete(id);
      
      request.onerror = () => {
        console.error(`[ServiceWorker] Error deleting item ${id} from ${storeName}:`, request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        console.log(`[ServiceWorker] Successfully deleted item ${id} from ${storeName}`);
        resolve(true);
      };
      
      // Handle transaction errors
      transaction.onerror = (event) => {
        console.error(`[ServiceWorker] Transaction error for ${storeName}:`, event.target.error);
        reject(event.target.error);
      };
    } catch (err) {
      console.error(`[ServiceWorker] Exception in deletePendingItem:`, err);
      reject(err);
    }
  });
}

// Store notification in IndexedDB for offline access
async function storeNotification(notification) {
  try {
    const db = await openDatabase();
    
    // Create notifications store if it doesn't exist
    if (!db.objectStoreNames.contains('notifications')) {
      db.close();
      const dbRequest = indexedDB.open('seekupOfflineDB', 2); // Increment version
      
      dbRequest.onupgradeneeded = event => {
        const newDb = event.target.result;
        newDb.createObjectStore('notifications', {
          keyPath: 'id',
          autoIncrement: true
        });
      };
      
      await new Promise((resolve, reject) => {
        dbRequest.onsuccess = () => resolve(dbRequest.result);
        dbRequest.onerror = () => reject(dbRequest.error);
      });
      
      // Reopen database with new schema
      db.close();
      const updatedDb = await openDatabase();
      return saveNotificationToDb(updatedDb, notification);
    }
    
    return saveNotificationToDb(db, notification);
  } catch (err) {
    console.error('[ServiceWorker] Failed to store notification:', err);
    return false;
  }
}

// Save notification to IndexedDB
function saveNotificationToDb(db, notification) {
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction('notifications', 'readwrite');
      const store = transaction.objectStore('notifications');
      
      // Add timestamp and read status to notification
      const notificationToStore = {
        ...notification,
        timestamp: new Date().toISOString(),
        read: false
      };
      
      const request = store.add(notificationToStore);
      
      request.onsuccess = () => {
        console.log('[ServiceWorker] Notification stored successfully');
        resolve(true);
      };
      
      request.onerror = () => {
        console.error('[ServiceWorker] Failed to store notification in DB');
        reject(request.error);
      };
    } catch (err) {
      console.error('[ServiceWorker] Error in saveNotificationToDb:', err);
      reject(err);
    }
  });
}

// Broadcast notification to client - used when showing notifications
function broadcastNotification(notification) {
  return self.clients.matchAll().then(clients => {
    if (!clients || !clients.length) {
      return false;
    }
    
    // Send notification data to all connected clients
    clients.forEach(client => {
      client.postMessage({
        type: 'NEW_NOTIFICATION',
        notification
      });
    });
    return true;
  });
}

// Mark notification as read in IndexedDB
async function markNotificationAsRead(notificationId) {
  try {
    const db = await openDatabase();
    const tx = db.transaction('notifications', 'readwrite');
    const store = tx.objectStore('notifications');
    
    // Get the notification
    const getRequest = tx.store.get(notificationId);
    
    return new Promise((resolve, reject) => {
      getRequest.onerror = () => {
        console.error(`[ServiceWorker] Error getting notification ${notificationId}:`, getRequest.error);
        reject(getRequest.error);
      };
      
      getRequest.onsuccess = () => {
        const notification = getRequest.result;
        
        if (notification) {
          notification.read = true;
          notification.readAt = new Date().toISOString();
          
          const putRequest = store.put(notification);
          
          putRequest.onerror = () => {
            console.error(`[ServiceWorker] Error updating notification ${notificationId}:`, putRequest.error);
            reject(putRequest.error);
          };
          
          putRequest.onsuccess = () => {
            console.log(`[ServiceWorker] Marked notification ${notificationId} as read`);
            resolve();
          };
        } else {
          // Notification not found, just resolve
          resolve();
        }
      };
    });
  } catch (error) {
    console.error('[ServiceWorker] Error marking notification as read:', error);
    return Promise.reject(error);
  }
}

// Handle push notifications
self.addEventListener('push', event => {
  console.log('[ServiceWorker] Push notification received');
  
  let notification = {
    title: 'SEEKUP',
    body: 'New notification from SEEKUP',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: {
      url: '/',
      notificationType: 'general',
      timestamp: new Date().toISOString(),
      notificationId: `notification-${Date.now()}`
    },
    // Action buttons for different responses
    actions: [
      {
        action: 'view',
        title: 'View'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  // Try to parse notification data if available
  if (event.data) {
    try {
      const data = event.data.json();
      notification.title = data.title || notification.title;
      notification.body = data.body || notification.body;
      
      // Merge data with existing notification settings
      if (data.data) {
        notification.data = { ...notification.data, ...data.data };
      }
      
      // Handle event reminder notifications
      if (data.notificationType === 'event_reminder') {
        notification.data.url = `/events/${data.eventId}`;
        notification.data.notificationType = 'event_reminder';
        notification.data.eventId = data.eventId;
        notification.actions = [
          {
            action: 'view',
            title: 'View Event'
          },
          {
            action: 'dismiss',
            title: 'Dismiss'
          }
        ];
      }
      // Handle check-in reminders
      else if (data.notificationType === 'checkin_reminder') {
        notification.data.url = `/scan`;
        notification.data.notificationType = 'checkin_reminder';
        notification.data.eventId = data.eventId;
        notification.actions = [
          {
            action: 'checkin',
            title: 'Check In'
          },
          {
            action: 'view',
            title: 'View Event'
          }
        ];
      }
    } catch (error) {
      console.error('[ServiceWorker] Error parsing notification data:', error);
      // If JSON parsing fails, try to use the data as simple text
      notification.body = event.data.text() || notification.body;
    }
  }
  
  // Store the notification in IndexedDB for offline access and broadcast to clients
  Promise.all([
    storeNotification(notification)
      .then(() => console.log('[ServiceWorker] Notification stored in IndexedDB'))
      .catch(err => console.error('[ServiceWorker] Failed to store notification:', err)),
    broadcastNotification(notification)
      .then(success => {
        if (success) {
          console.log('[ServiceWorker] Notification broadcasted to clients');
        }
      })
  ]);
  
  // Show the notification
  event.waitUntil(
    self.registration.showNotification(notification.title, notification)
  );
});

// Notification click event handler
self.addEventListener('notificationclick', event => {
  console.log('[ServiceWorker] Notification click received');
  
  const notificationData = event.notification.data;
  const action = event.action;
  
  // Close the notification
  event.notification.close();
  
  // Default target URL is home
  let targetUrl = '/';
  
  // Handle specific actions
  if (action === 'view' || !action) {
    // Default action is to open the URL from the notification data
    if (notificationData && notificationData.url) {
      targetUrl = notificationData.url;
    }
  } else if (action === 'checkin') {
    // Direct to QR scanner for check-in
    targetUrl = '/scan';
  } else if (action === 'dismiss') {
    // Just dismiss, no navigation needed
    return;
  }
  
  // Mark notification as read in IndexedDB if it has an ID
  const markAsReadPromise = notificationData?.notificationId ? 
    markNotificationAsRead(notificationData.notificationId) : 
    Promise.resolve();
  
  event.waitUntil(
    Promise.all([
      // Focus or open window with target URL
      self.clients.matchAll({ type: 'window' })
        .then(windowClients => {
          // If a window client already exists, focus it and navigate
          for (const client of windowClients) {
            if (client.url === targetUrl && 'focus' in client) {
              return client.focus();
            }
          }
          // Otherwise open a new window
          return self.clients.openWindow(targetUrl);
        }),
      
      // Mark as read in IndexedDB
      markAsReadPromise,
      
      // Notify clients of notification interaction
      self.clients.matchAll().then(clients => {
        if (clients && clients.length) {
          clients.forEach(client => {
            client.postMessage({
              type: 'NOTIFICATION_CLICKED',
              notificationId: notificationData?.notificationId,
              action: action || 'default'
            });
          });
        }
      })
    ])
  );
});

// Handle notification close
self.addEventListener('notificationclose', event => {
  // Can track metrics on dismissed notifications if needed
  console.log('[ServiceWorker] Notification was closed without interaction');
});
