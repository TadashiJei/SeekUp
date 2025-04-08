import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Chip, 
  Divider, 
  CircularProgress, 
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  LocationOn as LocationIcon,
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { getCachedEvent, storePendingRegistration } from '../utils/offlineDataManager';

function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // States
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [networkStatus, setNetworkStatus] = useState(navigator.onLine);

  // Form states
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    specialRequirements: ''
  });

  // Function to check if an event ID is for an offline event
  const isOfflineEventId = useCallback((id) => {
    return id && typeof id === 'string' && id.startsWith('temp_');
  }, []);

  // Function to get offline events
  const getOfflineEvents = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem('seekup_offline_events') || '[]');
    } catch (error) {
      console.error('Error parsing offline events:', error);
      return [];
    }
  }, []);

  // Function to get an offline event by ID
  const getOfflineEventById = useCallback((id) => {
    const offlineEvents = getOfflineEvents();
    return offlineEvents.find(event => event.id === id);
  }, [getOfflineEvents]);

  // Fetch event data
  useEffect(() => {
    let isMounted = true;
    
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if eventId is valid
        if (!eventId) {
          if (isMounted) {
            setError('Invalid event ID. Please go back and try again.');
            setLoading(false);
          }
          return;
        }
        
        // Check if this is an offline/temporary event
        if (isOfflineEventId(eventId)) {
          const offlineEvent = getOfflineEventById(eventId);
          if (offlineEvent && isMounted) {
            setEvent({
              ...offlineEvent,
              // Add any necessary derived fields for display
              spotsRemaining: offlineEvent.maxVolunteers || 10,
              spots: offlineEvent.maxVolunteers || 10,
              skillsRequired: offlineEvent.requiredSkills || []
            });
            setLoading(false);
            setError('This is an offline-created event that will be synchronized when you connect to the internet.');
            return;
          } else if (isMounted) {
            setError('Could not find the offline event. It may have been removed.');
            setLoading(false);
            return;
          }
        }
        
        // If offline, try to get from cache
        if (!navigator.onLine) {
          // First check regular cache
          const cachedEvent = await getCachedEvent(eventId);
          if (cachedEvent && isMounted) {
            setEvent(cachedEvent);
            setLoading(false);
            return;
          } 
          
          // Then check if it's in our localStorage offline events
          const offlineEvents = getOfflineEvents();
          const matchingEvent = offlineEvents.find(e => e.id === eventId);
          if (matchingEvent && isMounted) {
            setEvent({
              ...matchingEvent,
              spotsRemaining: matchingEvent.maxVolunteers || 10,
              spots: matchingEvent.maxVolunteers || 10,
              skillsRequired: matchingEvent.requiredSkills || []
            });
            setLoading(false);
            return;
          } else if (isMounted) {
            setError('You are offline and this event is not available in your cache.');
            setLoading(false);
            return;
          }
        }
        
        // Before making API call, ensure we have a token
        const token = localStorage.getItem('token');
        if (!token) {
          if (isMounted) {
            setError('Authentication required. Please log in to view event details.');
            setLoading(false);
          }
          return;
        }
        
        // Online - fetch from API
        const response = await axios.get(`/api/events/${eventId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (isMounted) {
          // Check if response data is valid
          if (!response.data) {
            throw new Error('Invalid response from server');
          }
          
          // Handle different response formats
          if (response.data.event) {
            // Some APIs nest the event data
            setEvent(response.data.event);
          } else {
            // Direct event data in response
            setEvent(response.data);
          }
          
          // Cache the event for offline access
          try {
            localStorage.setItem(`event_${eventId}`, JSON.stringify(response.data));
          } catch (cacheErr) {
            console.warn('Failed to cache event data:', cacheErr);
          }
        }
      } catch (err) {
        console.error('Error fetching event details:', err);
        
        // Handle specific error types
        if (err.response) {
          if (err.response.status === 401) {
            if (isMounted) {
              setError('Your session has expired. Please log in again to view this event.');
            }
          } else if (err.response.status === 404) {
            if (isMounted) {
              setError('Event not found. It may have been removed or you may not have permission to view it.');
            }
          } else {
            // Try from cache as fallback for other errors
            tryFetchFromCache();
          }
        } else {
          // Network or other error, try cache
          tryFetchFromCache();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    // Helper function to try fetching from cache in error scenarios
    const tryFetchFromCache = async () => {
      try {
        // First check regular cache
        const cachedEvent = await getCachedEvent(eventId);
        if (cachedEvent && isMounted) {
          setEvent(cachedEvent);
          setError('Using cached event data. Some information may not be up to date.');
          return;
        }
        
        // Then check offline events
        const offlineEvent = getOfflineEventById(eventId);
        if (offlineEvent && isMounted) {
          setEvent({
            ...offlineEvent,
            spotsRemaining: offlineEvent.maxVolunteers || 10,
            spots: offlineEvent.maxVolunteers || 10,
            skillsRequired: offlineEvent.requiredSkills || []
          });
          setError('Using offline event data.');
          return;
        }
        
        if (isMounted) {
          setError('Failed to load event details. Please try again later.');
        }
      } catch (cacheErr) {
        if (isMounted) {
          setError('Failed to load event details. Please try again later.');
        }
      }
    };
    
    fetchEventDetails();
    
    return () => {
      isMounted = false;
    };
  }, [eventId, getOfflineEventById, isOfflineEventId, getOfflineEvents]);
  
  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setNetworkStatus(true);
    const handleOffline = () => setNetworkStatus(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle registration
  const handleRegister = async () => {
    try {
      setRegistering(true);
      
      // Check if offline
      if (!networkStatus) {
        await storePendingRegistration(eventId, formData);
        setRegistrationSuccess(true);
        setRegisterDialogOpen(false);
        return;
      }
      
      // Online registration
      await axios.post(`/api/events/${eventId}/register`, formData);
      setRegistrationSuccess(true);
      setRegisterDialogOpen(false);
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to register for this event. Please try again later.');
    } finally {
      setRegistering(false);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  // Share event
  const shareEvent = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Check out this volunteer event: ${event.title}`,
          url: window.location.href
        });
      } catch (err) {
        console.error('Share error:', err);
      }
    } else {
      // Fallback for browsers that don't support sharing
      navigator.clipboard.writeText(window.location.href);
      alert('Event URL copied to clipboard!');
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100vh',
          p: 3
        }}
      >
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading event details...</Typography>
      </Box>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '90vh',
          p: 3
        }}
      >
        <Alert severity="error" sx={{ width: '100%', maxWidth: 500 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate(-1)} 
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Box>
    );
  }
  
  // No event found
  if (!event) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '90vh',
          p: 3
        }}
      >
        <Alert severity="warning" sx={{ width: '100%', maxWidth: 500 }}>
          Event not found
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/explore')} 
          sx={{ mt: 2 }}
        >
          Explore Events
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ pb: 7 }}>
      {/* Top navigation */}
      <Box 
        sx={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 10,
          bgcolor: 'background.paper', 
          p: 2, 
          display: 'flex', 
          alignItems: 'center',
          boxShadow: 1
        }}
      >
        <IconButton onClick={() => navigate(-1)} edge="start">
          <BackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ ml: 2, flexGrow: 1 }}>Event Details</Typography>
        <IconButton onClick={shareEvent}>
          <ShareIcon />
        </IconButton>
      </Box>
      
      {/* Event header with image */}
      <Box sx={{ position: 'relative', width: '100%', height: '200px', overflow: 'hidden' }}>
        <Box
          component="img"
          src={event.image || 'https://images.unsplash.com/photo-1559150894-59c353f35fc0'}
          alt={event.title}
          sx={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
          }}
        />
        {/* Gradient overlay */}
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: 0, 
            width: '100%', 
            backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
            p: 2,
            boxSizing: 'border-box'
          }}
        >
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
            {event.title}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'white' }}>
            {event.organization}
          </Typography>
        </Box>
      </Box>
      
      {/* Event details */}
      <Paper sx={{ m: 2, p: 2, borderRadius: 2 }}>
        {/* Category chip */}
        <Box sx={{ mb: 2 }}>
          <Chip 
            label={event.category} 
            color="primary" 
            size="small" 
            sx={{ textTransform: 'capitalize' }}
          />
          {event.spotsRemaining < 5 && (
            <Chip 
              label={`Only ${event.spotsRemaining} spots left!`} 
              color="error" 
              size="small" 
              sx={{ ml: 1 }}
            />
          )}
        </Box>
        
        {/* Description */}
        <Typography variant="body1" paragraph>
          {event.description}
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Event details list */}
        <Grid container spacing={2}>
          {/* Date */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarIcon color="primary" sx={{ mr: 1 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">Date</Typography>
                <Typography variant="body1">{formatDate(event.startDate)}</Typography>
              </Box>
            </Box>
          </Grid>
          
          {/* Time */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TimeIcon color="primary" sx={{ mr: 1 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">Time</Typography>
                <Typography variant="body1">
                  {formatTime(event.startDate)} - {formatTime(event.endDate)}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          {/* Location */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationIcon color="primary" sx={{ mr: 1 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">Location</Typography>
                <Typography variant="body1">
                  {event.location?.address}, {event.location?.city}, {event.location?.state} {event.location?.zip}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          {/* Spots */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon color="primary" sx={{ mr: 1 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">Spots</Typography>
                <Typography variant="body1">
                  {event.spotsRemaining} of {event.spots} remaining
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Skills and requirements */}
      {event.skillsRequired && (
        <Paper sx={{ m: 2, p: 2, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>Skills & Requirements</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {event.skillsRequired.map((skill, index) => (
              <Chip key={index} label={skill} size="small" />
            ))}
          </Box>
        </Paper>
      )}
      
      {/* Register button */}
      <Box sx={{ m: 2 }}>
        <Button 
          variant="contained" 
          color="primary" 
          fullWidth 
          size="large"
          onClick={() => setRegisterDialogOpen(true)}
          disabled={event.spotsRemaining <= 0}
        >
          {event.spotsRemaining > 0 ? 'Register Now' : 'Event Full'}
        </Button>
      </Box>
      
      {/* Registration dialog */}
      <Dialog open={registerDialogOpen} onClose={() => setRegisterDialogOpen(false)} fullWidth>
        <DialogTitle>Register for {event.title}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Full Name"
            type="text"
            fullWidth
            variant="outlined"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
            required
          />
          <TextField
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            name="email"
            value={formData.email}
            onChange={handleFormChange}
            required
          />
          <TextField
            margin="dense"
            label="Phone Number"
            type="tel"
            fullWidth
            variant="outlined"
            name="phone"
            value={formData.phone}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Special Requirements or Notes"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            name="specialRequirements"
            value={formData.specialRequirements}
            onChange={handleFormChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegisterDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleRegister} 
            variant="contained"
            disabled={registering}
          >
            {registering ? 'Registering...' : 'Register'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success snackbar */}
      <Snackbar
        open={registrationSuccess}
        autoHideDuration={6000}
        onClose={() => setRegistrationSuccess(false)}
      >
        <Alert 
          onClose={() => setRegistrationSuccess(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {networkStatus 
            ? 'Successfully registered for this event!' 
            : 'Registration saved. Will be processed when you\'re back online.'}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default EventDetails;
