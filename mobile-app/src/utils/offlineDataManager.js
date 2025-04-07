// Offline Data Manager for SEEKUP
// Handles data persistence and synchronization for offline functionality

import { openDB } from 'idb';

// Initialize the IndexedDB database
const initDB = async () => {
  return openDB('seekup-offline-db', 1, {
    upgrade(db) {
      // Create object stores for different data types
      if (!db.objectStoreNames.contains('events')) {
        const eventsStore = db.createObjectStore('events', { keyPath: 'id' });
        eventsStore.createIndex('status', 'status');
        eventsStore.createIndex('date', 'startDate');
      }
      
      if (!db.objectStoreNames.contains('registrations')) {
        const registrationsStore = db.createObjectStore('registrations', { keyPath: 'id', autoIncrement: true });
        registrationsStore.createIndex('eventId', 'eventId');
        registrationsStore.createIndex('status', 'status');
      }
      
      if (!db.objectStoreNames.contains('checkins')) {
        const checkinsStore = db.createObjectStore('checkins', { keyPath: 'id', autoIncrement: true });
        checkinsStore.createIndex('eventId', 'eventId');
        checkinsStore.createIndex('status', 'status');
      }
      
      if (!db.objectStoreNames.contains('profile')) {
        db.createObjectStore('profile', { keyPath: 'userId' });
      }
    }
  });
};

// Cache events for offline access
export const cacheEvents = async (events) => {
  try {
    const db = await initDB();
    const tx = db.transaction('events', 'readwrite');
    
    // Add each event to the store
    for (const event of events) {
      await tx.store.put(event);
    }
    
    await tx.done;
    console.log('Events cached successfully');
    return true;
  } catch (error) {
    console.error('Error caching events:', error);
    return false;
  }
};

// Get all cached events
export const getCachedEvents = async () => {
  try {
    const db = await initDB();
    return db.getAll('events');
  } catch (error) {
    console.error('Error getting cached events:', error);
    return [];
  }
};

// Get a specific cached event
export const getCachedEvent = async (eventId) => {
  try {
    const db = await initDB();
    return db.get('events', eventId);
  } catch (error) {
    console.error(`Error getting cached event ${eventId}:`, error);
    return null;
  }
};

// Store a pending event registration to be synced when online
export const storePendingRegistration = async (eventId, userData) => {
  try {
    const db = await initDB();
    await db.add('registrations', {
      eventId,
      userData,
      timestamp: Date.now(),
      status: 'pending'
    });
    
    // Request background sync if supported
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-events-registration');
    }
    
    return true;
  } catch (error) {
    console.error('Error storing pending registration:', error);
    return false;
  }
};

// Store a pending event check-in to be synced when online
export const storePendingCheckIn = async (eventId) => {
  try {
    const db = await initDB();
    await db.add('checkins', {
      eventId,
      timestamp: Date.now(),
      status: 'pending'
    });
    
    // Request background sync if supported
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-event-checkin');
    }
    
    return true;
  } catch (error) {
    console.error('Error storing pending check-in:', error);
    return false;
  }
};

// Get all pending registrations
export const getPendingRegistrations = async () => {
  try {
    const db = await initDB();
    return db.getAllFromIndex('registrations', 'status', 'pending');
  } catch (error) {
    console.error('Error getting pending registrations:', error);
    return [];
  }
};

// Get all pending check-ins
export const getPendingCheckIns = async () => {
  try {
    const db = await initDB();
    return db.getAllFromIndex('checkins', 'status', 'pending');
  } catch (error) {
    console.error('Error getting pending check-ins:', error);
    return [];
  }
};

// Update registration status after sync
export const updateRegistrationStatus = async (id, status) => {
  try {
    const db = await initDB();
    const tx = db.transaction('registrations', 'readwrite');
    const registration = await tx.store.get(id);
    
    if (registration) {
      registration.status = status;
      await tx.store.put(registration);
    }
    
    await tx.done;
    return true;
  } catch (error) {
    console.error('Error updating registration status:', error);
    return false;
  }
};

// Update check-in status after sync
export const updateCheckInStatus = async (id, status) => {
  try {
    const db = await initDB();
    const tx = db.transaction('checkins', 'readwrite');
    const checkin = await tx.store.get(id);
    
    if (checkin) {
      checkin.status = status;
      await tx.store.put(checkin);
    }
    
    await tx.done;
    return true;
  } catch (error) {
    console.error('Error updating check-in status:', error);
    return false;
  }
};

// Cache user profile data
export const cacheUserProfile = async (profile) => {
  try {
    const db = await initDB();
    await db.put('profile', profile);
    return true;
  } catch (error) {
    console.error('Error caching user profile:', error);
    return false;
  }
};

// Get cached user profile
export const getCachedUserProfile = async (userId) => {
  try {
    const db = await initDB();
    return db.get('profile', userId);
  } catch (error) {
    console.error('Error getting cached user profile:', error);
    return null;
  }
};

// Clear all cached data (useful for logout)
export const clearCachedData = async () => {
  try {
    const db = await initDB();
    const stores = ['events', 'registrations', 'checkins', 'profile'];
    
    for (const storeName of stores) {
      await db.clear(storeName);
    }
    
    return true;
  } catch (error) {
    console.error('Error clearing cached data:', error);
    return false;
  }
};

// Synchronize pending operations with the server
export const syncWithServer = async () => {
  // Only proceed if online
  if (!navigator.onLine) {
    console.log('Cannot sync while offline');
    return false;
  }
  
  try {
    // Sync pending registrations
    const pendingRegistrations = await getPendingRegistrations();
    for (const registration of pendingRegistrations) {
      try {
        const response = await fetch(`/api/events/${registration.eventId}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(registration.userData)
        });
        
        if (response.ok) {
          await updateRegistrationStatus(registration.id, 'synced');
        } else {
          await updateRegistrationStatus(registration.id, 'failed');
        }
      } catch (error) {
        console.error(`Error syncing registration ${registration.id}:`, error);
      }
    }
    
    // Sync pending check-ins
    const pendingCheckIns = await getPendingCheckIns();
    for (const checkin of pendingCheckIns) {
      try {
        const response = await fetch(`/api/events/${checkin.eventId}/check-in`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          await updateCheckInStatus(checkin.id, 'synced');
        } else {
          await updateCheckInStatus(checkin.id, 'failed');
        }
      } catch (error) {
        console.error(`Error syncing check-in ${checkin.id}:`, error);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error during server synchronization:', error);
    return false;
  }
};

// Check if there are any pending operations to sync
export const hasPendingOperations = async () => {
  try {
    const pendingRegistrations = await getPendingRegistrations();
    const pendingCheckIns = await getPendingCheckIns();
    
    return pendingRegistrations.length > 0 || pendingCheckIns.length > 0;
  } catch (error) {
    console.error('Error checking pending operations:', error);
    return false;
  }
};

// Get counts of pending operations by type
export const getPendingOperationCounts = async () => {
  try {
    const pendingRegistrations = await getPendingRegistrations();
    const pendingCheckIns = await getPendingCheckIns();
    
    return {
      registrations: pendingRegistrations.length,
      checkIns: pendingCheckIns.length,
      total: pendingRegistrations.length + pendingCheckIns.length
    };
  } catch (error) {
    console.error('Error getting pending operation counts:', error);
    return { registrations: 0, checkIns: 0, total: 0 };
  }
};
