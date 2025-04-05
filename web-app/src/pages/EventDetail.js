import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Chip, 
  Divider, 
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Category as CategoryIcon,
  Check as CheckIcon,
  Share as ShareIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [qrCode, setQrCode] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`/api/events/${id}`);
        setEvent(response.data.event);
        
        // Check if user is already registered for this event
        if (user && user.userType === 'volunteer') {
          const isRegistered = response.data.event.attendees.some(
            attendee => attendee.userId === user.id && 
            (attendee.status === 'registered' || attendee.status === 'attended')
          );
          setRegistered(isRegistered);
          
          // Get QR code if registered
          if (isRegistered) {
            const attendee = response.data.event.attendees.find(
              a => a.userId === user.id && 
              (a.status === 'registered' || a.status === 'attended')
            );
            if (attendee) setQrCode(attendee.qrCode);
          }
        }
        
        // Fetch organization details
        const orgResponse = await axios.get(`/api/organizations/${response.data.event.organization}`);
        setOrganization(orgResponse.data.organization);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load event details');
        setLoading(false);
        console.error('Event details fetch error:', err);
      }
    };
    
    fetchEventDetails();
  }, [id, user]);
  
  const handleRegister = async () => {
    try {
      setRegistering(true);
      const response = await axios.post(`/api/events/${id}/register`);
      setRegistered(true);
      setQrCode(response.data.qrCode);
      setOpenDialog(true);
      setRegistering(false);
    } catch (err) {
      setError('Failed to register for the event. Please try again.');
      setRegistering(false);
      console.error('Event registration error:', err);
    }
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: `Join me at ${event?.title} - a volunteer event by ${organization?.name}`,
        url: window.location.href
      })
      .catch(err => console.error('Share failed:', err));
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Event link copied to clipboard!'))
        .catch(err => console.error('Copy failed:', err));
    }
  };
  
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ mt: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          startIcon={<BackIcon />} 
          onClick={() => navigate('/events')}
          sx={{ mt: 2 }}
        >
          Back to Events
        </Button>
      </Box>
    );
  }
  
  if (!event) {
    return (
      <Box sx={{ mt: 3 }}>
        <Alert severity="info">Event not found</Alert>
        <Button 
          startIcon={<BackIcon />} 
          onClick={() => navigate('/events')}
          sx={{ mt: 2 }}
        >
          Back to Events
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ py: 3 }}>
      {/* Back button */}
      <Button 
        startIcon={<BackIcon />} 
        onClick={() => navigate('/events')}
        sx={{ mb: 3 }}
      >
        Back to Events
      </Button>
      
      {/* Event Header */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h1" gutterBottom>
              {event.title}
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Chip 
                icon={<CategoryIcon />} 
                label={event.category.replace(/-/g, ' ')} 
                color="primary" 
              />
              {event.requiredSkills?.map((skill, index) => (
                <Chip 
                  key={index} 
                  label={skill} 
                  variant="outlined" 
                  size="small" 
                />
              ))}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CalendarIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="body1">
                {formatDate(event.startDate)}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TimeIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="body1">
                {formatTime(event.startDate)} - {formatTime(event.endDate)}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="body1">
                {event.location.address}, {event.location.city}, {event.location.state}, {event.location.country}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PersonIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="body1">
                {event.attendees?.filter(a => a.status === 'registered' || a.status === 'attended').length || 0} 
                {event.maxVolunteers ? ` / ${event.maxVolunteers}` : ''} volunteers registered
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {user?.userType === 'volunteer' && (
              <>
                {registered ? (
                  <Button 
                    variant="contained" 
                    color="success" 
                    size="large" 
                    fullWidth
                    startIcon={<CheckIcon />}
                    onClick={() => setOpenDialog(true)}
                  >
                    Registered
                  </Button>
                ) : (
                  <Button 
                    variant="contained" 
                    size="large" 
                    fullWidth
                    disabled={registering || (event.maxVolunteers && event.attendees?.length >= event.maxVolunteers)}
                    onClick={handleRegister}
                  >
                    {registering ? <CircularProgress size={24} /> : 'Register Now'}
                  </Button>
                )}
              </>
            )}
            
            <Button 
              variant="outlined" 
              fullWidth
              startIcon={<ShareIcon />}
              onClick={handleShare}
            >
              Share
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Event Details and Organization Info */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              About This Event
            </Typography>
            <Typography variant="body1" paragraph>
              {event.description}
            </Typography>
            
            {event.requiredSkills && event.requiredSkills.length > 0 && (
              <>
                <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
                  Required Skills
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  {event.requiredSkills.map((skill, index) => (
                    <Chip 
                      key={index} 
                      label={skill} 
                      color="primary" 
                      variant="outlined" 
                    />
                  ))}
                </Box>
              </>
            )}
            
            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
              Event Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Duration
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {event.duration || Math.round((new Date(event.endDate) - new Date(event.startDate)) / (1000 * 60 * 60))} hours
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Points for Attendance
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {event.pointsForAttendance || 10} points
                </Typography>
              </Grid>
              {event.maxVolunteers && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Maximum Volunteers
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {event.maxVolunteers} spots
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          {organization && (
            <Card sx={{ mb: 4, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  Organized By
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    src={organization.organizationDetails?.logo} 
                    alt={organization.name}
                    sx={{ width: 60, height: 60, mr: 2 }}
                  >
                    {organization.name?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" component="div">
                      {organization.name}
                    </Typography>
                    {organization.organizationDetails?.isVerified && (
                      <Chip 
                        icon={<CheckIcon />} 
                        label="Verified" 
                        size="small" 
                        color="success" 
                        sx={{ mt: 0.5 }}
                      />
                    )}
                  </Box>
                </Box>
                {organization.organizationDetails?.description && (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {organization.organizationDetails.description.substring(0, 150)}
                    {organization.organizationDetails.description.length > 150 ? '...' : ''}
                  </Typography>
                )}
                <Button 
                  variant="outlined" 
                  fullWidth
                  size="small"
                  onClick={() => navigate(`/organizations/${organization._id}`)}
                >
                  View Organization
                </Button>
              </CardContent>
            </Card>
          )}
          
          {event.attendees && event.attendees.length > 0 && (
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  Volunteers
                </Typography>
                <List>
                  {event.attendees
                    .filter(a => a.status === 'registered' || a.status === 'attended')
                    .slice(0, 5)
                    .map((attendee, index) => (
                      <ListItem key={index} disableGutters>
                        <ListItemAvatar>
                          <Avatar>
                            {attendee.userId.name?.charAt(0) || 'V'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={attendee.userId.name} 
                          secondary={attendee.status === 'attended' ? 'Attended' : 'Registered'}
                        />
                      </ListItem>
                    ))
                  }
                </List>
                {event.attendees.length > 5 && (
                  <Typography variant="body2" color="text.secondary" align="center">
                    +{event.attendees.length - 5} more volunteers
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
      
      {/* Registration Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        <DialogTitle>
          {registered ? "You're Registered!" : "Registration Failed"}
        </DialogTitle>
        <DialogContent>
          {registered ? (
            <>
              <DialogContentText paragraph>
                You have successfully registered for "{event.title}".
              </DialogContentText>
              <DialogContentText paragraph>
                Please keep this QR code to check in at the event:
              </DialogContentText>
              <Box sx={{ textAlign: 'center', my: 2 }}>
                {/* In a real app, this would be an actual QR code image */}
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    display: 'inline-block', 
                    bgcolor: '#f5f5f5',
                    borderRadius: 2 
                  }}
                >
                  <Typography variant="h6" sx={{ wordBreak: 'break-all' }}>
                    {qrCode}
                  </Typography>
                </Paper>
              </Box>
              <DialogContentText>
                Event details have been added to your volunteer passport.
              </DialogContentText>
            </>
          ) : (
            <DialogContentText>
              There was an issue with your registration. Please try again later.
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EventDetail;
