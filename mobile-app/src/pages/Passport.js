import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Tabs,
  Tab,
  Card, 
  CardContent, 
  Chip,
  Avatar,
  LinearProgress,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Divider,
  Badge
} from '@mui/material';
import {
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as TimeIcon,
  ArrowBack as BackIcon,
  EmojiEvents as TrophyIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

// Achievement Card Component
const AchievementCard = ({ achievement }) => (
  <Box 
    sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      p: 2,
      m: 1,
      borderRadius: 3,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      bgcolor: achievement.unlocked ? 'background.paper' : 'action.hover',
      width: 110,
      opacity: achievement.unlocked ? 1 : 0.7,
      position: 'relative'
    }}
  >
    {achievement.unlocked && (
      <Badge
        color="primary"
        badgeContent={<CheckCircleIcon fontSize="small" />}
        sx={{ 
          position: 'absolute',
          top: 8,
          right: 8
        }}
      />
    )}
    <Avatar 
      sx={{ 
        width: 56, 
        height: 56, 
        mb: 1,
        bgcolor: achievement.unlocked ? 'primary.main' : 'action.disabled' 
      }}
    >
      {achievement.icon}
    </Avatar>
    <Typography 
      variant="body2" 
      align="center" 
      sx={{ 
        fontWeight: 'medium', 
        fontSize: '0.85rem',
        mt: 1
      }}
    >
      {achievement.name}
    </Typography>
    {!achievement.unlocked && achievement.progress && (
      <Box sx={{ width: '100%', mt: 1 }}>
        <LinearProgress 
          variant="determinate" 
          value={(achievement.progress.current / achievement.progress.total) * 100} 
          sx={{ height: 4, borderRadius: 2 }}
        />
        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}>
          {achievement.progress.current}/{achievement.progress.total}
        </Typography>
      </Box>
    )}
  </Box>
);

// Event Card Component
const EventCard = ({ event, onClick }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Default placeholder image if none is provided
  const eventImage = event.image || 'https://source.unsplash.com/random/300x150/?volunteer';
  
  return (
    <Card 
      sx={{ 
        mb: 2,
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        position: 'relative'
      }}
      onClick={onClick}
    >
      {event.status === 'completed' && (
        <Chip 
          label="Completed" 
          color="success" 
          size="small"
          sx={{ 
            position: 'absolute', 
            top: 12, 
            right: 12,
            zIndex: 1
          }}
        />
      )}
      {event.status === 'registered' && (
        <Chip 
          label="Upcoming" 
          color="primary" 
          size="small"
          sx={{ 
            position: 'absolute', 
            top: 12, 
            right: 12,
            zIndex: 1
          }}
        />
      )}
      
      <Box sx={{ display: 'flex', height: 100 }}>
        <Box 
          sx={{ 
            width: 100, 
            flexShrink: 0,
            backgroundImage: `url(${eventImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <CardContent sx={{ p: 2, flexGrow: 1 }}>
          <Typography variant="h6" component="div" sx={{ fontSize: '1rem', mb: 1, fontWeight: 500 }}>
            {event.title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <TimeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {formatDate(event.date)}
            </Typography>
          </Box>
          
          {event.status === 'completed' && event.hours && (
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'success.main' }}>
              {event.hours} volunteer hours • {event.points} points earned
            </Typography>
          )}
        </CardContent>
      </Box>
    </Card>
  );
};

// Certificate Component
const Certificate = ({ user, stats }) => (
  <Card sx={{ borderRadius: 3, overflow: 'hidden', mb: 3, position: 'relative' }}>
    <Box 
      sx={{ 
        backgroundImage: 'linear-gradient(135deg, #6B8DFE 0%, #4665D8 100%)',
        color: 'white',
        p: 3,
        textAlign: 'center'
      }}
    >
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>
        Volunteer Passport
      </Typography>
      
      <Typography variant="body2" sx={{ mb: 3 }}>
        This certifies that
      </Typography>
      
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
        {user?.name}
      </Typography>
      
      <Box 
        sx={{ 
          display: 'flex',
          justifyContent: 'space-around',
          mb: 2
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {stats?.totalHours || 0}
          </Typography>
          <Typography variant="body2">
            HOURS
          </Typography>
        </Box>
        
        <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {stats?.eventsCompleted || 0}
          </Typography>
          <Typography variant="body2">
            EVENTS
          </Typography>
        </Box>
        
        <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {user?.points || 0}
          </Typography>
          <Typography variant="body2">
            POINTS
          </Typography>
        </Box>
      </Box>
      
      <Typography variant="caption" sx={{ display: 'block', mt: 2 }}>
        SEEKUP VOLUNTEER ID: {user?.id?.slice(-8).toUpperCase() || 'N/A'}
      </Typography>
    </Box>
    
    <IconButton 
      sx={{ position: 'absolute', top: 8, right: 8, color: 'white' }}
      onClick={() => {
        // Share functionality
        if (navigator.share) {
          navigator.share({
            title: 'My SEEKUP Volunteer Passport',
            text: `I've volunteered for ${stats?.eventsCompleted || 0} events and completed ${stats?.totalHours || 0} hours with SEEKUP!`,
            url: window.location.href
          });
        } else {
          alert('Share functionality not available in this browser.');
        }
      }}
    >
      <ShareIcon />
    </IconButton>
  </Card>
);

function Passport() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState(0);
  const [events, setEvents] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch user's volunteer history and achievements
  useEffect(() => {
    const fetchPassportData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Development mode check - same as in App.js
        const isDevelopmentMode = true; // TEMPORARY: Set to true for testing

        if (isDevelopmentMode) {
          // Use mock data for development testing
          setEvents(dummyEvents);
          setAchievements(dummyAchievements);
          setStats(dummyStats);
          setLoading(false);
          return;
        }
        
        // Production code - real API calls
        // Get user's registered and completed events
        const eventsResponse = await axios.get('/api/users/events');
        setEvents(eventsResponse.data.events || []);
        
        // Get user's achievements
        const achievementsResponse = await axios.get('/api/users/achievements');
        setAchievements(achievementsResponse.data.achievements || []);
        
        // Get user's volunteer stats
        const statsResponse = await axios.get('/api/users/stats');
        setStats(statsResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching passport data:', err);
        setError('Failed to load your volunteer history. Please try again.');
        setLoading(false);
      }
    };
    
    fetchPassportData();
  }, []);
  
  // Dummy data for development testing
  const dummyStats = {
    totalHours: 17,
    eventsAttended: 7,
    impactScore: 85,
    skillsUsed: ['Teaching', 'Organization', 'Communication'],
    topCauses: ['Education', 'Environment', 'Community Development']
  };
  
  // Dummy events for development testing
  const dummyEvents = [
    {
      id: '1',
      title: 'Community Park Cleanup',
      organization: 'Green City Initiative',
      date: '2023-05-15T09:00:00',
      location: 'Central Park',
      status: 'completed',
      hours: 3,
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d'
    },
    {
      id: '2',
      title: 'Food Drive Volunteer',
      organization: 'City Food Bank',
      date: '2023-04-22T10:00:00',
      location: 'Downtown Community Center',
      status: 'completed',
      hours: 4,
      image: 'https://images.unsplash.com/photo-1593113630400-ea4288922497'
    },
    {
      id: '3',
      title: 'Literacy Program Helper',
      organization: 'ReadMore Foundation',
      date: '2023-06-05T14:00:00',
      location: 'Public Library',
      status: 'upcoming',
      hours: 2,
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b'
    }
  ];
  
  // Dummy data for achievements
  const dummyAchievements = [
    {
      id: 1,
      name: 'First Timer',
      description: 'Complete your first volunteer event',
      unlocked: true,
      date: '2023-02-15',
      icon: <EventIcon />
    },
    {
      id: 2,
      name: 'Helping Hand',
      description: 'Complete 5 volunteer events',
      unlocked: true,
      date: '2023-04-10',
      icon: <EventIcon />
    },
    {
      id: 3,
      name: 'Dedicated',
      description: 'Complete 10 volunteer events',
      unlocked: false,
      progress: { current: 7, total: 10 },
      icon: <EventIcon />
    },
    {
      id: 4,
      name: '10 Hours',
      description: 'Volunteer for a total of 10 hours',
      unlocked: true,
      date: '2023-03-22',
      icon: <TimeIcon />
    },
    {
      id: 5,
      name: '25 Hours',
      description: 'Volunteer for a total of 25 hours',
      unlocked: false,
      progress: { current: 17, total: 25 },
      icon: <TimeIcon />
    },
    {
      id: 6,
      name: 'Level 5',
      description: 'Reach volunteer level 5',
      unlocked: false,
      progress: { current: 3, total: 5 },
      icon: <TrophyIcon />
    }
  ];
  
  // Filter events based on active tab
  const filteredEvents = () => {
    if (activeTab === 0) return events;
    if (activeTab === 1) return events.filter(event => event.status === 'completed');
    if (activeTab === 2) return events.filter(event => event.status === 'registered');
    return [];
  };
  
  if (loading) {
    return (
      <Box className="page-content" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box className="page-content">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton edge="start" onClick={() => navigate(-1)}>
          <BackIcon />
        </IconButton>
        <Typography variant="h5" component="h1" sx={{ ml: 1 }}>
          My Passport
        </Typography>
      </Box>
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Volunteer Certificate */}
      <Certificate user={user} stats={stats} />
      
      {/* Achievements Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Achievements
        </Typography>
        
        <Box 
          sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'flex-start',
            mx: -1
          }}
        >
          {/* Use real achievements in production */}
          {(achievements.length > 0 ? achievements : dummyAchievements).map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </Box>
      </Box>
      
      {/* Events Section */}
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Event History
        </Typography>
        
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{ mb: 3 }}
          TabIndicatorProps={{ sx: { height: 3, borderRadius: 3 } }}
        >
          <Tab label="All" />
          <Tab label="Completed" />
          <Tab label="Upcoming" />
        </Tabs>
        
        {filteredEvents().length > 0 ? (
          filteredEvents().map((event) => (
            <EventCard 
              key={event.id} 
              event={event} 
              onClick={() => navigate(`/events/${event.id}`)} 
            />
          ))
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              {activeTab === 0 ? "You haven't participated in any events yet" :
               activeTab === 1 ? "You haven't completed any events yet" :
               "You don't have any upcoming events"}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Passport;
