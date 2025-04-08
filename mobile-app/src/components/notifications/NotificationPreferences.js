import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Switch,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Event as EventIcon,
  AccessTime as ReminderIcon,
  Email as EmailIcon,
  Update as UpdateIcon,
  CampaignOutlined as CampaignIcon
} from '@mui/icons-material';
import { 
  requestNotificationPermission, 
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  sendTestNotification 
} from '../../utils/notificationUtils';
import axios from 'axios';

// Default notification preferences
const defaultPreferences = {
  pushEnabled: false,
  emailEnabled: false,
  preferences: {
    eventReminders: true,
    checkInReminders: true,
    newEvents: true,
    statusUpdates: true,
    announcements: false
  }
};

// Storage key for notification preferences
const NOTIFICATION_PREFS_STORAGE_KEY = 'seekup_notification_prefs';

function NotificationPreferences() {
  // State
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [permissionStatus, setPermissionStatus] = useState('default');
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [showTestNotificationDialog, setShowTestNotificationDialog] = useState(false);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  
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
  
  // Check notification permission and load preferences
  useEffect(() => {
    const checkPermissionAndLoadPrefs = async () => {
      setLoading(true);
      
      // Check notification permission
      if ('Notification' in window) {
        setPermissionStatus(Notification.permission);
      }
      
      // Load preferences from localStorage first as fallback
      try {
        const storedPrefs = localStorage.getItem(NOTIFICATION_PREFS_STORAGE_KEY);
        if (storedPrefs) {
          setPreferences(JSON.parse(storedPrefs));
        }
      } catch (err) {
        console.error('Error loading preferences from storage:', err);
      }
      
      // If online, try to fetch from server
      if (navigator.onLine) {
        try {
          // Development mode check
          const isDevelopmentMode = true; // TEMPORARY: Set to true for testing
          
          if (!isDevelopmentMode) {
            const response = await axios.get('/api/notifications/preferences', {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
            });
            
            setPreferences(response.data);
            
            // Update local storage
            localStorage.setItem(
              NOTIFICATION_PREFS_STORAGE_KEY, 
              JSON.stringify(response.data)
            );
          }
        } catch (err) {
          console.error('Error fetching notification preferences:', err);
          setError('Failed to load your notification preferences from the server.');
        }
      }
      
      setLoading(false);
    };
    
    checkPermissionAndLoadPrefs();
  }, []);
  
  // Save notification preferences
  const savePreferences = async () => {
    try {
      setLoading(true);
      setSaveStatus(null);
      
      // Update localStorage
      localStorage.setItem(NOTIFICATION_PREFS_STORAGE_KEY, JSON.stringify(preferences));
      
      // If online, update on server
      if (navigator.onLine) {
        // Development mode check
        const isDevelopmentMode = true; // TEMPORARY: Set to true for testing
        
        if (!isDevelopmentMode) {
          await axios.put('/api/notifications/preferences', preferences, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
        }
      } else {
        // Store in pending queue for later sync
        try {
          const pendingOperations = JSON.parse(localStorage.getItem('pendingOperations') || '[]');
          pendingOperations.push({
            type: 'updateNotificationPreferences',
            data: preferences,
            timestamp: new Date().toISOString()
          });
          localStorage.setItem('pendingOperations', JSON.stringify(pendingOperations));
        } catch (err) {
          console.error('Error storing pending operation:', err);
        }
      }
      
      setSaveStatus({
        type: 'success',
        message: 'Notification preferences saved successfully'
      });
    } catch (err) {
      console.error('Error saving notification preferences:', err);
      setSaveStatus({
        type: 'error',
        message: 'Failed to save notification preferences. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Enable or disable push notifications
  const handlePushToggle = async (event) => {
    const enabled = event.target.checked;
    
    if (enabled) {
      // Check permission first
      if (permissionStatus !== 'granted') {
        setShowPermissionDialog(true);
        return;
      }
      
      try {
        const subscription = await subscribeToPushNotifications();
        
        if (subscription) {
          setPreferences(prev => ({
            ...prev,
            pushEnabled: true
          }));
        }
      } catch (err) {
        console.error('Error enabling push notifications:', err);
      }
    } else {
      // Disable push notifications
      try {
        const success = await unsubscribeFromPushNotifications();
        
        if (success) {
          setPreferences(prev => ({
            ...prev,
            pushEnabled: false
          }));
        }
      } catch (err) {
        console.error('Error disabling push notifications:', err);
      }
    }
  };
  
  // Request notification permission
  const requestPermission = async () => {
    setShowPermissionDialog(false);
    
    try {
      const permissionGranted = await requestNotificationPermission();
      
      if (permissionGranted) {
        setPermissionStatus('granted');
        
        // Subscribe to push notifications
        const subscription = await subscribeToPushNotifications();
        
        if (subscription) {
          setPreferences(prev => ({
            ...prev,
            pushEnabled: true
          }));
        }
      } else {
        setPermissionStatus('denied');
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
    }
  };
  
  // Handle test notification
  const sendTestNotif = async () => {
    setShowTestNotificationDialog(false);
    
    try {
      await sendTestNotification(
        'Test Notification', 
        'This is a test notification from SEEKUP'
      );
    } catch (err) {
      console.error('Error sending test notification:', err);
    }
  };
  
  // Handle preference toggle
  const handlePreferenceToggle = (prefKey) => (event) => {
    const checked = event.target.checked;
    
    setPreferences(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [prefKey]: checked
      }
    }));
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box className="page-content">
      <Typography variant="h5" component="h2" gutterBottom>
        Notification Preferences
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {isOffline && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          You're offline. Changes will be synced when you reconnect.
        </Alert>
      )}
      
      {saveStatus && (
        <Alert severity={saveStatus.type} sx={{ mb: 3 }}>
          {saveStatus.message}
        </Alert>
      )}
      
      <Paper sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
        <List>
          <ListItem>
            <ListItemIcon>
              <NotificationsIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Push Notifications" 
              secondary="Receive notifications on this device"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={preferences.pushEnabled}
                onChange={handlePushToggle}
                disabled={permissionStatus === 'denied'}
              />
            </ListItemSecondaryAction>
          </ListItem>
          
          {permissionStatus === 'denied' && (
            <ListItem>
              <Alert severity="warning" sx={{ width: '100%' }}>
                Notifications are blocked. Please enable them in your browser settings.
              </Alert>
            </ListItem>
          )}
          
          <Divider />
          
          <ListItem>
            <ListItemIcon>
              <EmailIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Email Notifications" 
              secondary="Receive important updates via email"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={preferences.emailEnabled}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  emailEnabled: e.target.checked
                }))}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>
      
      <Paper sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
        <List subheader={
          <Box sx={{ px: 2, py: 1.5, bgcolor: 'background.default' }}>
            <Typography variant="subtitle1" fontWeight="medium">
              Notification Types
            </Typography>
          </Box>
        }>
          <ListItem>
            <ListItemIcon>
              <ReminderIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Event Reminders" 
              secondary="Get reminders before your volunteering events"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={preferences.preferences.eventReminders}
                onChange={handlePreferenceToggle('eventReminders')}
              />
            </ListItemSecondaryAction>
          </ListItem>
          
          <Divider variant="inset" component="li" />
          
          <ListItem>
            <ListItemIcon>
              <ReminderIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Check-in Reminders" 
              secondary="Get reminders to check in when you arrive at events"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={preferences.preferences.checkInReminders}
                onChange={handlePreferenceToggle('checkInReminders')}
              />
            </ListItemSecondaryAction>
          </ListItem>
          
          <Divider variant="inset" component="li" />
          
          <ListItem>
            <ListItemIcon>
              <EventIcon />
            </ListItemIcon>
            <ListItemText 
              primary="New Events" 
              secondary="Get notified when new volunteer opportunities are posted"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={preferences.preferences.newEvents}
                onChange={handlePreferenceToggle('newEvents')}
              />
            </ListItemSecondaryAction>
          </ListItem>
          
          <Divider variant="inset" component="li" />
          
          <ListItem>
            <ListItemIcon>
              <UpdateIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Status Updates" 
              secondary="Get notified about registration and check-in confirmations"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={preferences.preferences.statusUpdates}
                onChange={handlePreferenceToggle('statusUpdates')}
              />
            </ListItemSecondaryAction>
          </ListItem>
          
          <Divider variant="inset" component="li" />
          
          <ListItem>
            <ListItemIcon>
              <CampaignIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Announcements" 
              secondary="Receive announcements about the platform and features"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={preferences.preferences.announcements}
                onChange={handlePreferenceToggle('announcements')}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={() => setShowTestNotificationDialog(true)}
          disabled={!preferences.pushEnabled || permissionStatus !== 'granted'}
        >
          Send Test Notification
        </Button>
        
        <Button
          variant="contained"
          onClick={savePreferences}
          disabled={loading}
        >
          Save Preferences
        </Button>
      </Box>
      
      {/* Permission request dialog */}
      <Dialog
        open={showPermissionDialog}
        onClose={() => setShowPermissionDialog(false)}
      >
        <DialogTitle>Enable Push Notifications</DialogTitle>
        <DialogContent>
          <DialogContentText>
            We need your permission to send notifications. You'll receive updates about 
            your upcoming events, reminders, and important announcements.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPermissionDialog(false)}>Cancel</Button>
          <Button onClick={requestPermission} variant="contained">
            Enable Notifications
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Test notification dialog */}
      <Dialog
        open={showTestNotificationDialog}
        onClose={() => setShowTestNotificationDialog(false)}
      >
        <DialogTitle>Send Test Notification</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will send a test notification to verify that notifications are working 
            correctly on your device.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTestNotificationDialog(false)}>Cancel</Button>
          <Button onClick={sendTestNotif} variant="contained">
            Send Test
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default NotificationPreferences;
