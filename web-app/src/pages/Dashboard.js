import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button, 
  Divider,
  Paper,
  CircularProgress,
  Alert,
  Avatar
} from '@mui/material';
import {
  EventAvailable as EventIcon,
  Person as PersonIcon,
  Verified as VerifiedIcon,
  EmojiEvents as BadgeIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => (
  <Paper
    elevation={2}
    sx={{
      p: 3,
      borderRadius: 3,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      bgcolor: color,
      color: 'white',
      textAlign: 'center'
    }}
  >
    <Box sx={{ mb: 1 }}>
      {icon}
    </Box>
    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
      {value}
    </Typography>
    <Typography variant="body1">
      {title}
    </Typography>
  </Paper>
);

// Event Card Component
const EventCard = ({ event, isOrganizer }) => {
  const navigate = useNavigate();
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="div" gutterBottom>
          {event.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {formatDate(event.startDate)}
        </Typography>
        <Typography variant="body2">
          {event.description.substring(0, 100)}
          {event.description.length > 100 ? '...' : ''}
        </Typography>
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          onClick={() => navigate(`/events/${event._id}`)}
        >
          View Details
        </Button>
        {isOrganizer && (
          <Button 
            size="small" 
            color="primary"
            onClick={() => navigate(`/events/${event._id}/manage`)}
          >
            Manage
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Different API endpoints based on user type
        if (user?.userType === 'volunteer') {
          // Fetch volunteer dashboard data
          const eventsRes = await axios.get('/api/events?upcoming=true&limit=4');
          const statsRes = await axios.get('/api/users/volunteer-passport');
          
          setEvents(eventsRes.data.events);
          setStats({
            eventsAttended: statsRes.data.passport.eventsAttended,
            totalHours: statsRes.data.passport.totalHours,
            points: user.points || 0,
            level: user.level || 1
          });
        } else if (user?.userType === 'organization') {
          // Fetch organization dashboard data
          const eventsRes = await axios.get('/api/organizations/events?upcoming=true&limit=4');
          const statsRes = await axios.get('/api/organizations/metrics');
          
          setEvents(eventsRes.data.events);
          setStats({
            totalEvents: statsRes.data.metrics.totalEvents,
            totalVolunteers: statsRes.data.metrics.totalVolunteers,
            totalVolunteerHours: statsRes.data.metrics.totalVolunteerHours,
            verificationStatus: user.organizationDetails?.verificationStatus || 'not-submitted'
          });
        } else if (user?.userType === 'admin') {
          // Fetch admin dashboard data
          const eventsRes = await axios.get('/api/events?limit=4');
          const statsRes = await axios.get('/api/admin/metrics');
          
          setEvents(eventsRes.data.events);
          setStats({
            totalUsers: statsRes.data.metrics.totalUsers,
            totalEvents: statsRes.data.metrics.totalEvents,
            pendingVerifications: statsRes.data.metrics.pendingVerifications,
            activeVolunteers: statsRes.data.metrics.activeVolunteers
          });
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data');
        setLoading(false);
        console.error('Dashboard data fetch error:', err);
      }
    };
    
    if (user && !authLoading) {
      fetchDashboardData();
    }
  }, [user, authLoading]);
  
  // Render loading state
  if (authLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Box sx={{ mt: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Welcome, {user?.name}!
        </Typography>
        
        {/* Action button based on user type */}
        {user?.userType === 'volunteer' && (
          <Button 
            variant="contained" 
            onClick={() => navigate('/events')}
            startIcon={<EventIcon />}
          >
            Find Events
          </Button>
        )}
        
        {user?.userType === 'organization' && (
          <Button 
            variant="contained" 
            onClick={() => navigate('/events/create')}
            startIcon={<AddIcon />}
          >
            Create Event
          </Button>
        )}
      </Box>
      
      {/* Stats Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {user?.userType === 'volunteer' && stats && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Events Attended" 
                value={stats.eventsAttended} 
                icon={<EventIcon fontSize="large" />}
                color="#4CAF50"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Volunteer Hours" 
                value={stats.totalHours} 
                icon={<PersonIcon fontSize="large" />}
                color="#2196F3"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Points Earned" 
                value={stats.points} 
                icon={<EmojiEvents fontSize="large" />}
                color="#FF9800"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Current Level" 
                value={stats.level} 
                icon={<BadgeIcon fontSize="large" />}
                color="#9C27B0"
              />
            </Grid>
          </>
        )}
        
        {user?.userType === 'organization' && stats && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Total Events" 
                value={stats.totalEvents} 
                icon={<EventIcon fontSize="large" />}
                color="#4CAF50"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Total Volunteers" 
                value={stats.totalVolunteers} 
                icon={<PersonIcon fontSize="large" />}
                color="#2196F3"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Volunteer Hours" 
                value={stats.totalVolunteerHours} 
                icon={<BadgeIcon fontSize="large" />}
                color="#FF9800"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  bgcolor: stats.verificationStatus === 'verified' ? '#4CAF50' : 
                           stats.verificationStatus === 'pending' ? '#FFC107' : '#F44336',
                  color: 'white',
                  textAlign: 'center'
                }}
              >
                <Box sx={{ mb: 1 }}>
                  <VerifiedIcon fontSize="large" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, textTransform: 'capitalize' }}>
                  {stats.verificationStatus.replace('-', ' ')}
                </Typography>
                <Typography variant="body2">
                  Verification Status
                </Typography>
              </Paper>
            </Grid>
          </>
        )}
        
        {user?.userType === 'admin' && stats && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Total Users" 
                value={stats.totalUsers} 
                icon={<PersonIcon fontSize="large" />}
                color="#4CAF50"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Total Events" 
                value={stats.totalEvents} 
                icon={<EventIcon fontSize="large" />}
                color="#2196F3"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Pending Verifications" 
                value={stats.pendingVerifications} 
                icon={<VerifiedIcon fontSize="large" />}
                color="#FF9800"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Active Volunteers" 
                value={stats.activeVolunteers} 
                icon={<BadgeIcon fontSize="large" />}
                color="#9C27B0"
              />
            </Grid>
          </>
        )}
      </Grid>
      
      {/* Events Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            {user?.userType === 'volunteer' ? 'Upcoming Events' : 
             user?.userType === 'organization' ? 'Your Events' : 'Recent Events'}
          </Typography>
          <Button 
            variant="text" 
            onClick={() => navigate('/events')}
          >
            View All
          </Button>
        </Box>
        
        {events.length > 0 ? (
          <Grid container spacing={3}>
            {events.map((event) => (
              <Grid item key={event._id} xs={12} sm={6} md={4} lg={3}>
                <EventCard 
                  event={event} 
                  isOrganizer={user?.userType === 'organization'} 
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography variant="body1" color="text.secondary">
              {user?.userType === 'volunteer' ? 'No upcoming events found. Explore the events page to find opportunities!' : 
               user?.userType === 'organization' ? 'You haven\'t created any events yet. Create your first event to get started!' :
               'No recent events found.'}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Dashboard;
