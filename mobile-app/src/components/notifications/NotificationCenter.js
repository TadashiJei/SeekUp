import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemButton,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Badge,
  Divider,
  Drawer,
  Tabs,
  Tab,
  Chip,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  MarkChatRead as MarkReadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';

// Mock data for offline/development mode
const mockNotifications = [
  {
    id: '1',
    type: 'event_reminder',
    title: 'Event Tomorrow',
    message: 'Don\'t forget your volunteer shift at Community Park Cleanup',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    data: { eventId: '1' }
  },
  {
    id: '2',
    type: 'check_in_success',
    title: 'Check-in Successful',
    message: 'You have successfully checked in to Food Drive Volunteer',
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    data: { eventId: '2' }
  },
  {
    id: '3',
    type: 'new_event',
    title: 'New Event Available',
    message: 'A new volunteering opportunity has been posted: Tree Planting Day',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    data: { eventId: '5' }
  },
  {
    id: '4',
    type: 'registration_confirmed',
    title: 'Registration Confirmed',
    message: 'Your registration for After-School Tutoring has been confirmed',
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    data: { eventId: '3' }
  }
];

// Notification icon mapping
const getNotificationIcon = (type) => {
  switch (type) {
    case 'event_reminder':
      return <EventIcon color="primary" />;
    case 'check_in_success':
      return <CheckCircleIcon color="success" />;
    case 'new_event':
      return <InfoIcon color="info" />;
    case 'registration_confirmed':
      return <CheckCircleIcon color="success" />;
    default:
      return <NotificationsIcon color="action" />;
  }
};

// Storage key for notifications
const NOTIFICATIONS_STORAGE_KEY = 'seekup_notifications';

/**
 * Notification Center component - manages and displays user notifications
 */
function NotificationCenter({ 
  isOpen, 
  onClose, 
  onNotificationClick = () => {},
  anchorDirection = 'right'
}) {
  // Extract user context for user-specific notifications
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  // State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Check online status
  useEffect(() => {
    const handleOnlineStatusChange = () => {
      setIsOffline(!navigator.onLine);
    };
    
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);

  // Define development mode flag at component level
  const isDevelopmentMode = true; // TEMPORARY: Set to true for testing

  // Fetch notifications from IndexedDB
  const fetchNotificationsFromIndexedDB = useCallback(async () => {
    if (!('indexedDB' in window)) {
      console.error('IndexedDB not supported');
      return null;
    }
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('seekup-db', 1);
      
      request.onerror = (event) => {
        console.error('Error opening IndexedDB:', event.target.error);
        reject(event.target.error);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('notifications')) {
          db.createObjectStore('notifications', { keyPath: 'id' });
        }
      };
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['notifications'], 'readonly');
        const store = transaction.objectStore('notifications');
        const getAll = store.getAll();
        
        getAll.onerror = (event) => {
          console.error('Error fetching notifications from IndexedDB:', event.target.error);
          reject(event.target.error);
        };
        
        getAll.onsuccess = (event) => {
          resolve(event.target.result || []);
        };
      };
    });
  }, []);
  
  // Update notification in IndexedDB
  const updateNotificationInIndexedDB = useCallback(async (notificationId, updates) => {
    if (!('indexedDB' in window)) {
      console.error('IndexedDB not supported');
      return false;
    }
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('seekup-db', 1);
      
      request.onerror = (event) => {
        console.error('Error opening IndexedDB:', event.target.error);
        reject(event.target.error);
      };
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['notifications'], 'readwrite');
        const store = transaction.objectStore('notifications');
        
        // First get the notification to update
        const getRequest = store.get(notificationId);
        
        getRequest.onerror = (event) => {
          console.error('Error getting notification from IndexedDB:', event.target.error);
          reject(event.target.error);
        };
        
        getRequest.onsuccess = (event) => {
          const notification = event.target.result;
          
          if (notification) {
            // Apply updates to the notification
            const updatedNotification = { ...notification, ...updates };
            
            // Put the updated notification back
            const putRequest = store.put(updatedNotification);
            
            putRequest.onerror = (event) => {
              console.error('Error updating notification in IndexedDB:', event.target.error);
              reject(event.target.error);
            };
            
            putRequest.onsuccess = () => {
              console.log('Successfully updated notification in IndexedDB');
              resolve(true);
            };
          } else {
            console.warn('Notification not found in IndexedDB:', notificationId);
            resolve(false);
          }
        };
      };
    });
  }, []);
  
  // Delete notification from IndexedDB
  const deleteNotificationFromIndexedDB = useCallback(async (notificationId) => {
    if (!('indexedDB' in window)) {
      console.error('IndexedDB not supported');
      return false;
    }
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('seekup-db', 1);
      
      request.onerror = (event) => {
        console.error('Error opening IndexedDB:', event.target.error);
        reject(event.target.error);
      };
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['notifications'], 'readwrite');
        const store = transaction.objectStore('notifications');
        
        const deleteRequest = store.delete(notificationId);
        
        deleteRequest.onerror = (event) => {
          console.error('Error deleting notification from IndexedDB:', event.target.error);
          reject(event.target.error);
        };
        
        deleteRequest.onsuccess = () => {
          console.log('Successfully deleted notification from IndexedDB');
          resolve(true);
        };
      };
    });
  }, []);
  
  // Main fetch notifications function
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First, try to get notifications from IndexedDB
      let fetchedNotifications = [];
      
      try {
        const indexedDBNotifications = await fetchNotificationsFromIndexedDB();
        
        if (indexedDBNotifications && indexedDBNotifications.length > 0) {
          console.log('Loaded', indexedDBNotifications.length, 'notifications from IndexedDB');
          
          // Filter notifications for the current user if userId is available
          if (currentUser && currentUser.id) {
            fetchedNotifications = indexedDBNotifications.filter(
              n => !n.userId || n.userId === currentUser.id
            );
          } else {
            fetchedNotifications = indexedDBNotifications;
          }
          
          setNotifications(fetchedNotifications);
          setUnreadCount(fetchedNotifications.filter(n => !n.read).length);
          setLoading(false);
          return;
        }
      } catch (dbError) {
        console.error('Error fetching from IndexedDB:', dbError);
      }
      
      // If offline and no IndexedDB notifications, fallback to localStorage
      if (!navigator.onLine) {
        try {
          const storedNotifications = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
          if (storedNotifications) {
            const parsed = JSON.parse(storedNotifications);
            setNotifications(parsed);
            setUnreadCount(parsed.filter(n => !n.read).length);
            setLoading(false);
            return;
          }
        } catch (localStorageError) {
          console.error('Error retrieving from localStorage:', localStorageError);
          setNotifications(mockNotifications);
          setUnreadCount(mockNotifications.filter(n => !n.read).length);
        }
        setLoading(false);
        return;
      }
      
      // If online but in development mode
      if (isDevelopmentMode) {
        // If we already have IndexedDB notifications, use those
        if (fetchedNotifications.length > 0) {
          setNotifications(fetchedNotifications);
          setUnreadCount(fetchedNotifications.filter(n => !n.read).length);
          setLoading(false);
          return;
        }
        
        // Otherwise use mock data
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.read).length);
        setLoading(false);
        return;
      }
      
      // Production mode - fetch from API
      const response = await axios.get('/api/notifications', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const apiNotifications = response.data.notifications || [];
      setNotifications(apiNotifications);
      setUnreadCount(apiNotifications.filter(n => !n.read).length);
      
      // Update localStorage for offline usage
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(apiNotifications));
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
      setLoading(false);
      
      // Fallback to local storage or mock data
      try {
        const storedNotifications = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        if (storedNotifications) {
          const parsed = JSON.parse(storedNotifications);
          setNotifications(parsed);
          setUnreadCount(parsed.filter(n => !n.read).length);
        } else {
          setNotifications(mockNotifications);
          setUnreadCount(mockNotifications.filter(n => !n.read).length);
        }
      } catch (storageError) {
        console.error('Error loading from local storage:', storageError);
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.read).length);
      }
    }
  }, [fetchNotificationsFromIndexedDB, isDevelopmentMode, currentUser]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    // Find the notification - it could use either id or notificationId
    const notification = notifications.find(n => 
      n.id === notificationId || n.notificationId === notificationId
    );
    const actualId = notification?.id || notification?.notificationId;
    
    if (!notification || notification.read) return;
    
    try {
      // Try to update in IndexedDB first if available
      if ('indexedDB' in window) {
        try {
          await updateNotificationInIndexedDB(actualId, { 
            read: true, 
            readAt: new Date().toISOString(),
            userId: currentUser?.id // Associate with current user
          });
        } catch (dbError) {
          console.error('Failed to update notification in IndexedDB:', dbError);
        }
      }
      
      // Update locally 
      setNotifications(prev => 
        prev.map(n => 
          (n.id === actualId || n.notificationId === actualId) ? { ...n, read: true } : n
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Store updated notifications in localStorage
      const updatedNotifications = notifications.map(n => 
        (n.id === actualId || n.notificationId === actualId) ? { ...n, read: true } : n
      );
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
      
      // In production, update on server
      if (!isOffline && !isDevelopmentMode) {
        await axios.patch(`/api/notifications/${actualId}/read`, {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Failed to update notification');
    }
  }, [notifications, isOffline, isDevelopmentMode, updateNotificationInIndexedDB, currentUser]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      // Update all notifications in IndexedDB
      if ('indexedDB' in window) {
        for (const notification of notifications.filter(n => !n.read)) {
          try {
            await updateNotificationInIndexedDB(notification.id || notification.notificationId, {
              read: true,
              readAt: new Date().toISOString(),
              userId: currentUser?.id
            });
          } catch (dbError) {
            console.error('Error updating notification in IndexedDB:', dbError);
          }
        }
      }
      
      // Update locally
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
      
      // Store updated notifications in localStorage
      const updatedNotifications = notifications.map(notification => 
        ({ ...notification, read: true })
      );
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
      
      // In production, update on server
      if (!isOffline && !isDevelopmentMode) {
        await axios.put('/api/notifications/read-all', {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError('Failed to update notifications');
    }
  }, [notifications, isOffline, isDevelopmentMode, updateNotificationInIndexedDB, currentUser]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    // Find the notification - it could use either id or notificationId
    const notification = notifications.find(n => 
      n.id === notificationId || n.notificationId === notificationId
    );
    const actualId = notification?.id || notification?.notificationId;
    
    if (!notification) return;
    
    try {
      // Try to delete from IndexedDB first
      if ('indexedDB' in window) {
        try {
          await deleteNotificationFromIndexedDB(actualId);
        } catch (dbError) {
          console.error('Failed to delete notification from IndexedDB:', dbError);
        }
      }
      
      // Remove locally first
      setNotifications(prev => 
        prev.filter(n => n.id !== actualId && n.notificationId !== actualId)
      );
      
      // Update unread count if needed
      if (!notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // Update localStorage
      const updatedNotifications = notifications.filter(n => 
        n.id !== actualId && n.notificationId !== actualId
      );
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
      
      // In production, update on server
      if (!isOffline && !isDevelopmentMode) {
        await axios.delete(`/api/notifications/${actualId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError('Failed to delete notification');
    }
  }, [notifications, isOffline, isDevelopmentMode, deleteNotificationFromIndexedDB]);

  // Handle notification click
  const handleNotificationClick = useCallback((notification) => {
    // Mark as read if not already
    if (!notification.read) {
      markAsRead(notification.id || notification.notificationId);
    }
    
    // Navigate based on notification type
    if (notification.data && notification.data.eventId) {
      // Navigate to event detail
      navigate(`/events/${notification.data.eventId}`);
    } else if (notification.data && notification.data.url) {
      // Navigate to specified URL
      navigate(notification.data.url);
    }
    
    // Invoke parent callback
    onNotificationClick(notification);
    
    // Close notification center
    onClose();
  }, [navigate, markAsRead, onNotificationClick, onClose]);

  // Handle tab change
  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
  }, []);

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    switch (activeTab) {
      case 0: // All
        return true;
      case 1: // Unread
        return !notification.read;
      case 2: // Events
        return notification.type === 'event_reminder' || 
               notification.type === 'new_event' || 
               notification.type === 'registration_confirmed';
      default:
        return true;
    }
  });

  // Format timestamp to relative time
  const formatTimestamp = useCallback((timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  }, []);

  // Listen for service worker messages
  useEffect(() => {
    const handleServiceWorkerMessage = (event) => {
      // Handle new notifications from service worker
      if (event.data && event.data.type === 'NEW_NOTIFICATION') {
        const newNotification = event.data.notification;
        console.log('Received new notification from service worker:', newNotification);
        
        // Add the new notification to the state
        setNotifications(prevNotifications => {
          // Check if this notification already exists
          const existingIndex = prevNotifications.findIndex(n => 
            n.id === newNotification.id || n.notificationId === newNotification.notificationId
          );
          
          if (existingIndex !== -1) {
            // Update existing notification
            const updatedNotifications = [...prevNotifications];
            updatedNotifications[existingIndex] = newNotification;
            return updatedNotifications;
          } else {
            // Add new notification to the beginning
            return [newNotification, ...prevNotifications];
          }
        });
        
        // Update unread count
        setUnreadCount(prevCount => prevCount + 1);
      }
      
      // Handle notification click events from service worker
      if (event.data && event.data.type === 'NOTIFICATION_CLICKED') {
        const { notificationId } = event.data;
        
        if (notificationId) {
          markAsRead(notificationId);
        }
      }
    };
    
    // Add event listener for messages from service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }
    
    return () => {
      // Clean up event listener
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, [markAsRead]);

  // Initial load of notifications
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  return (
    <Drawer 
      anchor={anchorDirection} 
      open={isOpen} 
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 }, maxWidth: '100%' }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ 
          p: 2, 
          borderBottom: '1px solid', 
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6" component="div">
            Notifications
          </Typography>
          {notifications.length > 0 && (
            <Button 
              size="small" 
              startIcon={<MarkReadIcon />}
              onClick={markAllAsRead}
            >
              Mark All Read
            </Button>
          )}
        </Box>
        
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label="All" 
            icon={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography>All</Typography>
                {notifications.length > 0 && (
                  <Chip 
                    label={notifications.length} 
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
            } 
          />
          <Tab 
            label="Unread" 
            icon={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography>Unread</Typography>
                {unreadCount > 0 && (
                  <Chip 
                    label={unreadCount} 
                    size="small" 
                    color="primary"
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
            } 
          />
          <Tab label="Events" />
        </Tabs>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {error && (
            <Alert severity="error" sx={{ m: 2 }}>
              {error}
            </Alert>
          )}
          
          {isOffline && (
            <Alert severity="warning" sx={{ m: 2 }}>
              You're offline. Showing cached notifications.
            </Alert>
          )}
          
          {filteredNotifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="textSecondary">
                No notifications to display
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {filteredNotifications.map((notification, index) => (
                <React.Fragment key={notification.id || notification.notificationId || index}>
                  {index > 0 && <Divider component="li" />}
                  <ListItem 
                    disablePadding
                    sx={{
                      bgcolor: notification.read ? 'inherit' : 'action.hover'
                    }}
                  >
                    <ListItemButton onClick={() => handleNotificationClick(notification)}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: notification.read ? 'action.disabledBackground' : 'primary.light' }}>
                          {getNotificationIcon(notification.type)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              fontWeight: notification.read ? 'normal' : 'bold',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            {notification.title}
                            {!notification.read && (
                              <Chip 
                                label="New" 
                                size="small" 
                                color="primary" 
                                sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
                              />
                            )}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" sx={{ color: 'text.primary', mb: 0.5 }}>
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {formatTimestamp(notification.timestamp)}
                            </Typography>
                          </>
                        }
                        secondaryTypographyProps={{
                          component: 'div'
                        }}
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id || notification.notificationId);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItemButton>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </>
      )}
    </Drawer>
  );
}

export default NotificationCenter;
