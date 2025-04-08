import React, { useState, useEffect } from 'react';
import { 
  Snackbar, 
  Alert, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Badge,
  IconButton,
  CircularProgress,
  Box
} from '@mui/material';
import {
  Sync as SyncIcon,
  SignalWifiOff as OfflineIcon,
  SignalWifi4Bar as OnlineIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { 
  requestNotificationPermission, 
  subscribeToPushNotifications,
  sendTestNotification,
  addConnectivityListeners
} from '../utils/notificationUtils';
import {
  syncWithServer,
  getPendingOperationCounts
} from '../utils/offlineDataManager';
import NotificationCenter from './notifications/NotificationCenter';

/**
 * Component responsible for managing app features like notifications and offline support
 */
function AppFeatureManager() {
  // Feature states
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingOperations, setPendingOperations] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // UI states
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  const [showOnlineAlert, setShowOnlineAlert] = useState(false);
  const [showSyncAlert, setShowSyncAlert] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(true);
  
  // Check for notification permission on mount
  useEffect(() => {
    const checkNotificationPermission = async () => {
      if ('Notification' in window) {
        // Only show prompt if permission is not determined yet
        if (Notification.permission === 'default') {
          // Wait a bit before showing the prompt
          setTimeout(() => setShowNotificationPrompt(true), 5000);
        }
      }
    };
    
    checkNotificationPermission();
  }, []);
  
  // Set up connectivity listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineAlert(true);
      checkPendingOperations();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineAlert(true);
    };
    
    const cleanup = addConnectivityListeners(handleOnline, handleOffline);
    
    // Check for pending operations on mount
    checkPendingOperations();
    
    return cleanup;
  }, []);
  
  // Check for pending operations that need to be synced
  const checkPendingOperations = async () => {
    try {
      const counts = await getPendingOperationCounts();
      setPendingOperations(counts.total);
    } catch (error) {
      console.error('Error checking pending operations:', error);
    }
  };
  
  // Handle notification permission request
  const handleRequestNotifications = async () => {
    setShowNotificationPrompt(false);
    
    try {
      const permissionGranted = await requestNotificationPermission();
      
      if (permissionGranted) {
        // Subscribe to push notifications
        const subscription = await subscribeToPushNotifications();
        
        if (subscription) {
          // Show test notification
          setTimeout(() => {
            sendTestNotification(
              'SEEKUP Notifications Enabled', 
              'You will now receive updates about your volunteering activities'
            );
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };
  
  // Sync pending operations with server
  const handleSync = async () => {
    if (!isOnline || isSyncing) return;
    
    setIsSyncing(true);
    
    try {
      const result = await syncWithServer();
      setSyncSuccess(result);
      setShowSyncAlert(true);
      
      // Refresh pending operations count
      await checkPendingOperations();
    } catch (error) {
      console.error('Error syncing with server:', error);
      setSyncSuccess(false);
      setShowSyncAlert(true);
    } finally {
      setIsSyncing(false);
    }
  };
  
  return (
    <>
      {/* Floating connectivity & sync status (only shown when needed) */}
      {(!isOnline || pendingOperations > 0) && (
        <Box 
          sx={{ 
            position: 'fixed', 
            bottom: 70, // Above bottom navigation
            right: 20,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 1
          }}
        >
          {!isOnline && (
            <IconButton
              size="small"
              sx={{ 
                bgcolor: 'warning.light', 
                color: 'warning.contrastText',
                '&:hover': { bgcolor: 'warning.main' }
              }}
            >
              <OfflineIcon />
            </IconButton>
          )}
          
          {pendingOperations > 0 && isOnline && (
            <IconButton
              onClick={handleSync}
              disabled={isSyncing}
              size="small"
              sx={{ 
                bgcolor: 'primary.light', 
                color: 'primary.contrastText',
                '&:hover': { bgcolor: 'primary.main' } 
              }}
            >
              {isSyncing ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <Badge badgeContent={pendingOperations} color="error">
                  <SyncIcon />
                </Badge>
              )}
            </IconButton>
          )}
          
          <IconButton
            onClick={() => setShowNotificationCenter(true)}
            size="small"
            sx={{ 
              bgcolor: 'info.light', 
              color: 'info.contrastText',
              '&:hover': { bgcolor: 'info.main' } 
            }}
          >
            <NotificationsIcon />
          </IconButton>
        </Box>
      )}
      
      {/* Notification permission dialog */}
      <Dialog
        open={showNotificationPrompt}
        onClose={() => setShowNotificationPrompt(false)}
      >
        <DialogTitle>Enable Notifications</DialogTitle>
        <DialogContent>
          <DialogContentText>
            SEEKUP would like to send you notifications about your upcoming volunteer events, 
            check-in reminders, and other important updates.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNotificationPrompt(false)}>Not Now</Button>
          <Button onClick={handleRequestNotifications} variant="contained">
            Enable Notifications
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Online/Offline status alerts */}
      <Snackbar 
        open={showOfflineAlert} 
        autoHideDuration={3000} 
        onClose={() => setShowOfflineAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="warning" 
          onClose={() => setShowOfflineAlert(false)}
          icon={<OfflineIcon />}
        >
          You're offline. Some features may be limited.
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={showOnlineAlert} 
        autoHideDuration={3000} 
        onClose={() => setShowOnlineAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          onClose={() => setShowOnlineAlert(false)}
          icon={<OnlineIcon />}
        >
          You're back online!
        </Alert>
      </Snackbar>
      
      {/* Sync alert */}
      <Snackbar 
        open={showSyncAlert} 
        autoHideDuration={3000} 
        onClose={() => setShowSyncAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={syncSuccess ? "success" : "error"} 
          onClose={() => setShowSyncAlert(false)}
        >
          {syncSuccess 
            ? "Sync completed successfully!" 
            : "Failed to sync some items. Please try again."}
        </Alert>
      </Snackbar>
      
      {/* Notification Center */}
      <NotificationCenter 
        isOpen={showNotificationCenter}
        onClose={() => setShowNotificationCenter(false)}
        onNotificationClick={(notification) => {
          // Handle notification click based on type
          console.log('Notification clicked:', notification);
        }}
      />
    </>
  );
}

export default AppFeatureManager;
