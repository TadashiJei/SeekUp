import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Chip, 
  CircularProgress, 
  Alert,
  Card,
  CardContent,
  Divider,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  ArrowBack as BackIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  VerifiedUser as VerifiedIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [attendeesDialogOpen, setAttendeesDialogOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`/api/events/${eventId}`);
        setEvent(response.data);
        
        // Check if user is registered for this event
        if (user) {
          const userStatus = response.data.attendees?.find(
            a => a.userId === user.id
          )?.status || null;
          setRegistrationStatus(userStatus);
          
          // Check if event is bookmarked
          const bookmarksResponse = await axios.get('/api/users/bookmarks');
          const isBookmarked = bookmarksResponse.data.some(
            bookmark => bookmark.eventId === eventId
          );
          setBookmarked(isBookmarked);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event details. Please try again.');
        setLoading(false);
      }
    };
    
    fetchEventDetails();
  }, [eventId, user]);
  
  // Format date and time
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };
  
  // Register for event
  const handleRegister = async () => {
    try {
      setRegisterLoading(true);
      
      await axios.post(`/api/events/${eventId}/register`);
      setRegistrationStatus('registered');
      
      // Update the attendees count in the local state
      setEvent(prev => ({
        ...prev,
        attendeesCount: (prev.attendeesCount || 0) + 1
      }));
      
      setRegisterLoading(false);
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to register for event. Please try again.');
      setRegisterLoading(false);
    }
  };
  
  // Cancel registration
  const handleCancelRegistration = async () => {
    try {
      setRegisterLoading(true);
      
      await axios.delete(`/api/events/${eventId}/register`);
      setRegistrationStatus(null);
      
      // Update the attendees count in the local state
      setEvent(prev => ({
        ...prev,
        attendeesCount: Math.max(0, (prev.attendeesCount || 0) - 1)
      }));
      
      setRegisterLoading(false);
    } catch (err) {
      console.error('Cancellation error:', err);
      setError('Failed to cancel registration. Please try again.');
      setRegisterLoading(false);
    }
  };
  
  // Toggle bookmark status
  const handleToggleBookmark = async () => {
    try {
      if (bookmarked) {
        await axios.delete(`/api/users/bookmarks/${eventId}`);
      } else {
        await axios.post('/api/users/bookmarks', { eventId });
      }
      setBookmarked(!bookmarked);
    } catch (err) {
      console.error('Bookmark error:', err);
      setError('Failed to update bookmark. Please try again.');
    }
  };
  
  // Handle share event
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: event.title,
          text: `Check out this volunteer event: ${event.title}`,
          url: window.location.href
        });
      } else {
        // Fallback for browsers that don't support the Share API
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Share error:', err);
    }
  };
  
  if (loading) {
    return (
      <Box className="page-content" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box className="page-content">
        <IconButton 
          onClick={() => navigate(-1)} 
          edge="start" 
          sx={{ mb: 2 }}
        >
          <BackIcon />
        </IconButton>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  
  if (!event) {
    return (
      <Box className="page-content">
        <IconButton 
          onClick={() => navigate(-1)} 
          edge="start" 
          sx={{ mb: 2 }}
        >
          <BackIcon />
        </IconButton>
        <Alert severity="info">Event not found</Alert>
      </Box>
    );
  }
  
  // Check if event is full
  const isEventFull = event.maxVolunteers && event.attendeesCount >= event.maxVolunteers;
  // Check if event has already passed
  const isEventPassed = new Date(event.endDate) < new Date();
  
  return (
    <Box className="page-content" sx={{ pb: 8 }}>
      {/* Top Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <IconButton 
          onClick={() => navigate(-1)} 
          edge="start"
        >
          <BackIcon />
        </IconButton>
        <Box>
          <IconButton onClick={handleToggleBookmark}>
            {bookmarked ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
          </IconButton>
          <IconButton onClick={handleShare}>
            <ShareIcon />
          </IconButton>
        </Box>
      </Box>
      
      {/* Event Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ mb: 1, fontWeight: 'bold' }}>
          {event.title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
            <PeopleIcon fontSize="small" sx={{ mr: 0.5 }} />
            {event.attendeesCount || 0} / {event.maxVolunteers || '∞'} spots filled
          </Typography>
          
          <Chip 
            label={event.category?.replace(/-/g, ' ')} 
            size="small" 
            color="primary"
            variant="outlined"
            sx={{ ml: 'auto', textTransform: 'capitalize' }}
          />
        </Box>
        
        {/* Event Image */}
        <Box 
          sx={{ 
            height: 200, 
            borderRadius: 3, 
            overflow: 'hidden',
            mb: 2,
            position: 'relative'
          }}
        >
          <img 
            src={event.image || 'https://source.unsplash.com/random/600x300/?volunteer'} 
            alt={event.title}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover' 
            }}
          />
          {/* Organization avatar */}
          {event.organization && (
            <Box 
              sx={{ 
                position: 'absolute', 
                bottom: 16, 
                left: 16, 
                display: 'flex', 
                alignItems: 'center', 
                bgcolor: 'rgba(255,255,255,0.8)', 
                borderRadius: 8,
                padding: '4px 8px',
                maxWidth: '75%'
              }}
            >
              <Avatar 
                src={event.organization.avatar}
                alt={event.organization.name}
                sx={{ width: 28, height: 28, mr: 1 }}
              />
              <Typography variant="body2" sx={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {event.organization.name}
              </Typography>
              {event.organization.verified && (
                <VerifiedIcon color="primary" fontSize="small" sx={{ ml: 0.5 }} />
              )}
            </Box>
          )}
        </Box>
      </Box>
      
      {/* Event Info Cards */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <TimeIcon color="action" sx={{ mr: 2, mt: 0.5 }} />
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Date & Time
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDate(event.startDate)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatTime(event.startDate)} - {formatTime(event.endDate)}
              </Typography>
              {event.duration && (
                <Typography variant="body2" color="text.secondary">
                  {event.duration} {event.duration === 1 ? 'hour' : 'hours'}
                </Typography>
              )}
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <LocationIcon color="action" sx={{ mr: 2, mt: 0.5 }} />
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Location
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {event.location?.address}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {event.location?.city}, {event.location?.state} {event.location?.zipCode}
              </Typography>
              
              {/* Add map link */}
              <Button 
                variant="text" 
                size="small" 
                sx={{ mt: 1, pl: 0 }}
                onClick={() => {
                  const mapUrl = `https://maps.google.com/?q=${encodeURIComponent(
                    `${event.location?.address}, ${event.location?.city}, ${event.location?.state}`
                  )}`;
                  window.open(mapUrl, '_blank');
                }}
              >
                View on Map
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
      
      {/* Event Description */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          About This Event
        </Typography>
        <Typography variant="body2">
          {event.description}
        </Typography>
      </Box>
      
      {/* Skills Required */}
      {event.requiredSkills && event.requiredSkills.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Skills Required
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {event.requiredSkills.map((skill, index) => (
              <Chip 
                key={index} 
                label={skill} 
                variant="outlined"
                size="small"
              />
            ))}
          </Box>
        </Box>
      )}
      
      {/* Attendees */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6">
            Attendees
          </Typography>
          {event.attendees && event.attendees.length > 0 && (
            <Button 
              variant="text" 
              size="small"
              onClick={() => setAttendeesDialogOpen(true)}
            >
              View All
            </Button>
          )}
        </Box>
        
        {event.attendees && event.attendees.length > 0 ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {event.attendees.slice(0, 5).map((attendee, index) => (
              <Avatar 
                key={index} 
                src={attendee.avatar}
                alt={attendee.name}
                sx={{ width: 32, height: 32 }}
              />
            ))}
            {event.attendees.length > 5 && (
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                +{event.attendees.length - 5}
              </Avatar>
            )}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No attendees yet. Be the first to register!
          </Typography>
        )}
      </Box>
      
      {/* Registration Button */}
      {user?.userType === 'volunteer' && (
        <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 2, backgroundColor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
          {registrationStatus === 'registered' ? (
            <Button
              variant="outlined"
              color="error"
              fullWidth
              onClick={handleCancelRegistration}
              disabled={registerLoading || isEventPassed}
              sx={{ borderRadius: 3, py: 1.5 }}
            >
              {registerLoading ? <CircularProgress size={24} /> : 'Cancel Registration'}
            </Button>
          ) : (
            <Button
              variant="contained"
              fullWidth
              onClick={handleRegister}
              disabled={registerLoading || isEventFull || isEventPassed}
              sx={{ borderRadius: 3, py: 1.5 }}
            >
              {registerLoading ? (
                <CircularProgress size={24} />
              ) : isEventFull ? (
                'Event Full'
              ) : isEventPassed ? (
                'Event has ended'
              ) : (
                'Register Now'
              )}
            </Button>
          )}
        </Box>
      )}
      
      {/* Attendees Dialog */}
      <Dialog 
        open={attendeesDialogOpen} 
        onClose={() => setAttendeesDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Attendees ({event?.attendees?.length || 0})</DialogTitle>
        <DialogContent dividers>
          {event?.attendees && event.attendees.length > 0 ? (
            <List sx={{ pt: 0 }}>
              {event.attendees.map((attendee, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar src={attendee.avatar} alt={attendee.name} />
                  </ListItemAvatar>
                  <ListItemText 
                    primary={attendee.name}
                    secondary={attendee.role || 'Volunteer'}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" sx={{ py: 2, textAlign: 'center' }}>
              No attendees yet
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAttendeesDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EventDetail;
