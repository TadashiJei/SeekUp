import React, { useState, useEffect, useCallback } from 'react';
import { 
  Badge, 
  IconButton, 
  Tooltip 
} from '@mui/material';
import { 
  Notifications as NotificationsIcon 
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

// Storage key for notifications
const NOTIFICATIONS_STORAGE_KEY = 'seekup_notifications';

/**
 * NotificationBadge - Shows unread notification count and toggles notification center
 * @param {Object} props Component props
 * @param {Function} props.onClick Click handler function
 * @param {string} props.color Badge color
 * @param {boolean} props.disableIconButton If true, renders just the Badge without the IconButton wrapper (useful for navigation)
 */
function NotificationBadge({ onClick, color = "inherit", disableIconButton = false }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  
  // Fetch unread count from localStorage or API
  const fetchUnreadCount = useCallback(async () => {
    try {
      // Check for offline mode
      if (!navigator.onLine) {
        const storedData = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        if (storedData) {
          const notifications = JSON.parse(storedData);
          setUnreadCount(notifications.filter(n => !n.read).length);
        }
        return;
      }
      
      // Development mode check
      const isDevelopmentMode = true; // TEMPORARY: Set to true for testing
      
      if (isDevelopmentMode) {
        // Use mock data for development
        const storedData = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        if (storedData) {
          const notifications = JSON.parse(storedData);
          setUnreadCount(notifications.filter(n => !n.read).length);
        } else {
          // Default mock count if no stored data
          setUnreadCount(2);
        }
        return;
      }
      
      // Production code - real API call
      const response = await axios.get('/api/notifications/unread-count', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setUnreadCount(response.data.count);
    } catch (err) {
      console.error('Error fetching unread notifications count:', err);
      
      // Fallback to localStorage data
      try {
        const storedData = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        if (storedData) {
          const notifications = JSON.parse(storedData);
          setUnreadCount(notifications.filter(n => !n.read).length);
        }
      } catch (storageErr) {
        console.error('Error accessing localStorage:', storageErr);
      }
    }
  }, []);
  
  // Update unread count when route changes
  useEffect(() => {
    fetchUnreadCount();
  }, [location, fetchUnreadCount]);
  
  // Set up listener for storage changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === NOTIFICATIONS_STORAGE_KEY) {
        fetchUnreadCount();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchUnreadCount]);
  
  // Listen for custom notification events
  useEffect(() => {
    const handleNewNotification = () => {
      fetchUnreadCount();
    };
    
    window.addEventListener('seekup:new-notification', handleNewNotification);
    
    return () => {
      window.removeEventListener('seekup:new-notification', handleNewNotification);
    };
  }, [fetchUnreadCount]);
  
  // Render just the Badge without IconButton wrapper if disableIconButton is true
  if (disableIconButton) {
    return (
      <Badge badgeContent={unreadCount} color="error" overlap="rectangular">
        <NotificationsIcon />
      </Badge>
    );
  }
  
  // Regular rendering with IconButton
  return (
    <Tooltip title="Notifications">
      <IconButton color={color} onClick={onClick} size="large">
        <Badge badgeContent={unreadCount} color="error" overlap="rectangular">
          <NotificationsIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
}

export default NotificationBadge;
