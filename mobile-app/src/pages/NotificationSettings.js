import React from 'react';
import { Typography, Box, Paper, Divider } from '@mui/material';
import NotificationPreferences from '../components/notifications/NotificationPreferences';

/**
 * NotificationSettings page component
 * Allows users to manage their notification preferences and settings
 */
function NotificationSettings() {
  return (
    <Box className="page-content" sx={{ p: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Notification Settings
      </Typography>
      
      <Paper sx={{ p: 2, mb: 4, borderRadius: 2 }}>
        <Typography variant="body1" paragraph>
          Manage how and when you receive notifications from SEEKUP. 
          Configure your preferences for event reminders, check-ins, and more.
        </Typography>
      </Paper>
      
      <Divider sx={{ my: 3 }} />
      
      <NotificationPreferences />
    </Box>
  );
}

export default NotificationSettings;
