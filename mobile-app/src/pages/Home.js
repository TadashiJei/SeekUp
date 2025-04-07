import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActionArea,
  Button, 
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Stack,
  IconButton
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  ArrowForwardIos as ArrowIcon,
  NotificationsOutlined as NotificationIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { getCachedEvents, cacheEvents } from '../utils/offlineDataManager';

// Event Card Component
const EventCard = ({ event, onClick }) => {
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };
  
  // Default placeholder image if none is provided
  const eventImage = event.image || 'https://images.unsplash.com/photo-1588681805300-516bdf3e1539';
  
  return (
    <Card 
      sx={{ 
        mb: 2,
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
      className="event-card-swipeable"
    >
      <CardActionArea onClick={onClick}>
        <CardMedia
          component="img"
          height="120"
          image={eventImage}
          alt={event.title}
        />
        <CardContent sx={{ p: 2 }}>
          <Typography variant="h6" component="div" sx={{ mb: 1, fontSize: '1.1rem' }}>
            {event.title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TimeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {formatDate(event.startDate)} • {formatTime(event.startDate)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationIcon fontSize="small" color="action" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              {event.location?.city || 'Location not specified'}
            </Typography>
            
            {event.category && (
              <Chip 
                label={event.category.replace(/-/g, ' ')} 
                size="small" 
                color="primary"
                variant="outlined"
                sx={{ ml: 'auto', textTransform: 'capitalize' }}
              />
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

function Home() {
  const { user, isAuthenticated } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Fetch events on component mount
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check network connection first
        if (!navigator.onLine) {
          // Try to get data from cache if offline
          const cachedEvents = await getCachedEvents();
          if (cachedEvents && cachedEvents.length > 0) {
            // Filter for upcoming events
            const today = new Date();
            const upcoming = cachedEvents.filter(event => 
              new Date(event.startDate) > today
            );
            setUpcomingEvents(upcoming.slice(0, 3));
            setRecommendedEvents(cachedEvents.slice(0, 5));
          } else {
            setError('You are offline and no cached events are available');
          }
          setLoading(false);
          return;
        }

        // Development mode check - same as in other components
        const isDevelopmentMode = true; // TEMPORARY: Set to true for testing
        
        if (isDevelopmentMode) {
          // Use mock data in development mode
          const mockEvents = [
            {
              id: '1',
              title: 'Community Park Cleanup',
              description: 'Join us for a day of cleaning up the local park.',
              organization: 'Green City Initiative',
              startDate: '2025-04-15T09:00:00',
              image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d',
              location: {
                city: 'San Francisco',
                address: '123 Green Park Ave'
              },
              category: 'environment'
            },
            {
              id: '2',
              title: 'Food Drive Volunteer',
              description: 'Help distribute food to those in need.',
              organization: 'City Food Bank',
              startDate: '2025-04-20T10:00:00',
              image: 'https://images.unsplash.com/photo-1593113646773-028c64a8f1b8',
              location: {
                city: 'Oakland',
                address: '456 Charity Street'
              },
              category: 'community-service'
            },
            {
              id: '3',
              title: 'After-School Tutoring',
              description: 'Tutor elementary school students in math and reading.',
              organization: 'Education for All',
              startDate: '2025-04-22T15:00:00',
              image: 'https://images.unsplash.com/photo-1503676382389-4809596d5290',
              location: {
                city: 'Berkeley',
                address: '789 Learning Center Blvd'
              },
              category: 'education'
            }
          ];
          
          setUpcomingEvents(mockEvents);
          setRecommendedEvents([...mockEvents, 
            {
              id: '4',
              title: 'Elderly Care Visit',
              description: 'Visit and assist elderly residents at local care homes.',
              organization: 'Elder Care Alliance',
              startDate: '2025-04-25T14:00:00',
              image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
              location: {
                city: 'San Jose',
                address: '101 Senior Care Drive'
              },
              category: 'healthcare'
            }
          ]);
          
          // Cache mock events for offline access
          await cacheEvents(mockEvents);
          
          setLoading(false);
          return;
        }

        // Different API endpoints based on user type
        if (user?.userType === 'volunteer') {
          try {
            // Fetch upcoming events the volunteer is registered for
            const registeredRes = await axios.get('/api/users/events?status=registered&limit=3');
            setUpcomingEvents(registeredRes.data.events || []);
          } catch (err) {
            console.log('Unable to fetch registered events:', err);
            // Fallback to recommended events if registered events fail
            setUpcomingEvents([]);
          }
          
          try {
            // Fetch recommended events based on user profile
            const recommendedRes = await axios.get('/api/events/recommended?limit=5');
            setRecommendedEvents(recommendedRes.data.events || []);
          } catch (err) {
            console.log('Unable to fetch recommended events:', err);
            setRecommendedEvents([]);
          }
        } else if (user?.userType === 'organization') {
          try {
            // Fetch organization's upcoming events
            const eventsRes = await axios.get('/api/organizations/events?upcoming=true&limit=5');
            setUpcomingEvents(eventsRes.data.events || []);
          } catch (err) {
            console.log('Unable to fetch organization events:', err);
            setUpcomingEvents([]);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Home data fetch error:', err);
        setError('Failed to load events');
        setLoading(false);
      }
    };
    
    if (isAuthenticated && user) {
      fetchHomeData();
    }
  }, [isAuthenticated, user]);

  // Skeleton loading component
  const LoadingSkeleton = () => (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    </Box>
  );

  if (loading) {
    return (
      <Box className="page-content">
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3 
        }}>
          <Typography variant="h5" component="h1">
            {greeting}, {user?.name?.split(' ')[0] || 'there'}!
          </Typography>
          <IconButton>
            <NotificationIcon />
          </IconButton>
        </Box>
        <LoadingSkeleton />
      </Box>
    );
  }

  return (
    <Box className="page-content">
      {/* Header with greeting and notifications */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3 
      }}>
        <Typography variant="h5" component="h1">
          {greeting}, {user?.name?.split(' ')[0] || 'there'}!
        </Typography>
        <IconButton aria-label="notifications">
          <NotificationIcon />
        </IconButton>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Volunteer View */}
      {user?.userType === 'volunteer' && (
        <>
          {/* Your Upcoming Events Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 2 
            }}>
              <Typography variant="h6" component="h2">
                Your Upcoming Events
              </Typography>
              {upcomingEvents.length > 0 && (
                <Button 
                  endIcon={<ArrowIcon />} 
                  size="small"
                  onClick={() => navigate('/passport')}
                >
                  View All
                </Button>
              )}
            </Box>
            
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <EventCard 
                  key={event._id || event.id} 
                  event={event} 
                  onClick={() => navigate(`/events/${event._id || event.id}`)} 
                />
              ))
            ) : (
              <Card sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  You haven't registered for any events yet.
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={() => navigate('/explore')}
                >
                  Find Events
                </Button>
              </Card>
            )}
          </Box>
          
          {/* Volunteer Stats Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
              Your Impact
            </Typography>
            
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack 
                  direction="row" 
                  spacing={2} 
                  divider={<Divider orientation="vertical" flexItem />}
                  justifyContent="space-around"
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                      {user.points || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Points
                    </Typography>
                  </Box>
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                      {user.level || 1}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Level
                    </Typography>
                  </Box>
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                      {user.registeredEvents?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Events
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>
          
          {/* Recommended Events Section */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 2 
            }}>
              <Typography variant="h6" component="h2">
                Recommended For You
              </Typography>
              <Button 
                endIcon={<ArrowIcon />} 
                size="small"
                onClick={() => navigate('/explore')}
              >
                Explore
              </Button>
            </Box>
            
            {recommendedEvents.length > 0 ? (
              recommendedEvents.map((event) => (
                <EventCard 
                  key={event._id || event.id} 
                  event={event} 
                  onClick={() => navigate(`/events/${event._id || event.id}`)} 
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No recommendations available yet. Complete your profile to get personalized suggestions.
              </Typography>
            )}
          </Box>
        </>
      )}
      
      {/* Organization View */}
      {user?.userType === 'organization' && (
        <>
          {/* Organization Verification Status */}
          {user.organizationDetails?.verificationStatus !== 'verified' && (
            <Alert 
              severity={user.organizationDetails?.verificationStatus === 'pending' ? 'info' : 'warning'} 
              sx={{ mb: 3 }}
              action={
                user.organizationDetails?.verificationStatus !== 'pending' && (
                  <Button 
                    color="inherit" 
                    size="small"
                    onClick={() => navigate('/profile')}
                  >
                    Verify
                  </Button>
                )
              }
            >
              {user.organizationDetails?.verificationStatus === 'pending' 
                ? 'Your organization verification is pending review.' 
                : 'Verify your organization to build trust with volunteers.'}
            </Alert>
          )}
          
          {/* Your Upcoming Events Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 2 
            }}>
              <Typography variant="h6" component="h2">
                Your Events
              </Typography>
              <Button 
                variant="contained" 
                size="small"
                onClick={() => navigate('/events/create')}
              >
                Create Event
              </Button>
            </Box>
            
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <EventCard 
                  key={event._id || event.id} 
                  event={event} 
                  onClick={() => navigate(`/events/${event._id || event.id}`)} 
                />
              ))
            ) : (
              <Card sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  You haven't created any events yet.
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={() => navigate('/events/create')}
                >
                  Create Event
                </Button>
              </Card>
            )}
          </Box>
          
          {/* Quick Access Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
              Quick Access
            </Typography>
            
            <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1 }} className="hide-scrollbar">
              <Card sx={{ minWidth: 140, borderRadius: 3 }}>
                <CardActionArea onClick={() => navigate('/events')}>
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Manage Events
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
              
              <Card sx={{ minWidth: 140, borderRadius: 3 }}>
                <CardActionArea onClick={() => navigate('/analytics')}>
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Analytics
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
              
              <Card sx={{ minWidth: 140, borderRadius: 3 }}>
                <CardActionArea onClick={() => navigate('/profile')}>
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Organization
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Stack>
          </Box>
        </>
      )}
    </Box>
  );
}

export default Home;
