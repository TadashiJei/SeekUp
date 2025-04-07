// Notification Utilities for SEEKUP

/**
 * Request notification permission and register service worker for push notifications
 * @returns {Promise<boolean>} Whether permission was granted
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.error('This browser does not support desktop notification');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Register service worker and subscribe to push notifications
 * @returns {Promise<PushSubscription|null>} Push subscription object or null if failed
 */
export const subscribeToPushNotifications = async () => {
  try {
    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker is not supported in this browser');
    }
    
    // Register service worker if not already registered
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    
    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();
    
    // If already subscribed, return the subscription
    if (subscription) {
      return subscription;
    }
    
    // Get the server's public key for VAPID
    // In development mode, use a placeholder key
    const isDevelopmentMode = true; // TEMPORARY: Set to true for testing
    let publicKey;
    
    if (isDevelopmentMode) {
      // This is a placeholder public key for development
      publicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
    } else {
      // In production, fetch the public key from the server
      const response = await fetch('/api/notifications/public-key');
      const data = await response.json();
      publicKey = data.publicKey;
    }
    
    // Convert the public key to a Uint8Array
    const applicationServerKey = urlBase64ToUint8Array(publicKey);
    
    // Subscribe to push notifications
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    });
    
    // Send the subscription to the server
    if (!isDevelopmentMode) {
      await saveSubscription(subscription);
    } else {
      console.log('Development mode: subscription created but not sent to server', subscription);
    }
    
    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
};

/**
 * Send push subscription to server
 * @param {PushSubscription} subscription The push subscription object
 * @returns {Promise<boolean>} Whether the subscription was saved successfully
 */
export const saveSubscription = async (subscription) => {
  try {
    const response = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ subscription })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save subscription');
    }
    
    return true;
  } catch (error) {
    console.error('Error saving subscription:', error);
    return false;
  }
};

/**
 * Unsubscribe from push notifications
 * @returns {Promise<boolean>} Whether unsubscription was successful
 */
export const unsubscribeFromPushNotifications = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      return true; // Already unsubscribed
    }
    
    // Unsubscribe client-side
    await subscription.unsubscribe();
    
    // Notify server (except in development mode)
    const isDevelopmentMode = true; // TEMPORARY: Set to true for testing
    if (!isDevelopmentMode) {
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ endpoint: subscription.endpoint })
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
};

/**
 * Send a test notification through the service worker
 * @param {string} title Notification title
 * @param {string} body Notification body text
 */
export const sendTestNotification = async (title, body) => {
  if (!('serviceWorker' in navigator)) {
    alert('Service workers are not supported in this browser');
    return;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    registration.showNotification(title, {
      body,
      icon: '/logo192.png',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      data: {
        dateOfArrival: Date.now(),
        url: window.location.origin
      },
      actions: [
        {
          action: 'explore',
          title: 'View Events'
        },
        {
          action: 'close',
          title: 'Close'
        }
      ]
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
  }
};

/**
 * Convert a base64 string to a Uint8Array for push subscription
 * @param {string} base64String Base64 encoded string
 * @returns {Uint8Array} Converted array
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

/**
 * Check if the browser is online
 * @returns {boolean} Whether the browser is online
 */
export const isOnline = () => {
  return navigator.onLine;
};

/**
 * Add listeners for online/offline events
 * @param {Function} onlineCallback Callback when device goes online
 * @param {Function} offlineCallback Callback when device goes offline
 * @returns {Function} Cleanup function to remove listeners
 */
export const addConnectivityListeners = (onlineCallback, offlineCallback) => {
  window.addEventListener('online', onlineCallback);
  window.addEventListener('offline', offlineCallback);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', onlineCallback);
    window.removeEventListener('offline', offlineCallback);
  };
};
