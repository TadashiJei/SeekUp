import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField,
  InputAdornment,
  Card, 
  CardContent, 
  CardMedia, 
  CardActionArea,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Drawer,
  Button,
  Slider,
  Divider,
  Snackbar
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  WifiOff as OfflineIcon
} from '@mui/icons-material';
import axios from 'axios';
import { 
  cacheEvents, 
  getCachedEvents 
} from '../utils/offlineDataManager';
import { isOnline } from '../utils/notificationUtils';

// Categories for events
const EVENT_CATEGORIES = [
  'education',
  'environmental',
  'health',
  'animal-welfare',
  'community',
  'disaster-relief',
  'arts-culture',
  'technology',
  'sports-recreation',
  'social-services'
];

// Event Card Component (reused from Home.js with small modifications)
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
  const eventImage = event.image || 'https://source.unsplash.com/random/300x150/?volunteer';
  
  return (
    <Card 
      sx={{ 
        mb: 2,
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
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
              {event.location.city}
            </Typography>
            
            <Chip 
              label={event.category.replace(/-/g, ' ')} 
              size="small" 
              color="primary"
              variant="outlined"
              sx={{ ml: 'auto', textTransform: 'capitalize' }}
            />
          </Box>
          
          {/* Skills required chips */}
          {event.requiredSkills && event.requiredSkills.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
              {event.requiredSkills.slice(0, 2).map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  size="small"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              ))}
              {event.requiredSkills.length > 2 && (
                <Typography variant="caption" sx={{ alignSelf: 'center', ml: 0.5 }}>
                  +{event.requiredSkills.length - 2} more
                </Typography>
              )}
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

function Explore() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [networkStatus, setNetworkStatus] = useState(isOnline());
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  
  // Filter states
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    distance: 50, // Default max distance in km/miles
    skillLevel: '',
    date: ''
  });
  
  // Mock data for development testing - wrapped in useMemo to prevent recreation on each render
  const dummyEvents = useMemo(() => [
    {
      id: '1',
      title: 'Community Park Cleanup',
      description: 'Join us for a day of cleaning up the local park and planting new trees.',
      organization: 'Green City Initiative',
      startDate: '2025-04-15T09:00:00',
      endDate: '2025-04-15T12:00:00',
      location: {
        address: '123 Park Avenue',
        city: 'San Francisco',
        state: 'CA',
        zip: '94107'
      },
      category: 'environmental',
      spots: 25,
      spotsRemaining: 10,
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d'
    },
    {
      id: '2',
      title: 'Food Drive Distribution',
      description: 'Help distribute food to families in need at our monthly food drive.',
      organization: 'City Food Bank',
      startDate: '2025-04-22T10:00:00',
      endDate: '2025-04-22T14:00:00',
      location: {
        address: '456 Main Street',
        city: 'Oakland',
        state: 'CA',
        zip: '94612'
      },
      category: 'community',
      spots: 15,
      spotsRemaining: 5,
      image: 'https://images.unsplash.com/photo-1593113630400-ea4288922497'
    },
    {
      id: '3',
      title: 'Literacy Program for Kids',
      description: 'Volunteer to help children improve their reading skills through our literacy program.',
      organization: 'ReadMore Foundation',
      startDate: '2025-04-18T14:00:00',
      endDate: '2025-04-18T16:00:00',
      location: {
        address: '789 Library Lane',
        city: 'San Jose',
        state: 'CA',
        zip: '95113'
      },
      category: 'education',
      spots: 10,
      spotsRemaining: 3,
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b'
    },
    {
      id: '4',
      title: 'Animal Shelter Care Day',
      description: 'Spend a day caring for animals at our local shelter. Tasks include walking dogs, socializing cats, and cleaning kennels.',
      organization: 'Paws & Claws Rescue',
      startDate: '2025-04-20T09:00:00',
      endDate: '2025-04-20T13:00:00',
      location: {
        address: '567 Pet Boulevard',
        city: 'Sacramento',
        state: 'CA',
        zip: '95814'
      },
      category: 'animal-welfare',
      spots: 12,
      spotsRemaining: 8,
      image: 'https://images.unsplash.com/photo-1601758174114-e711c0cbaa69'
    },
    {
      id: '5',
      title: 'Community Health Fair',
      description: 'Volunteer at our annual health fair providing free health screenings and information to the community.',
      organization: 'HealthyLife Foundation',
      startDate: '2025-04-25T10:00:00',
      endDate: '2025-04-25T16:00:00',
      location: {
        address: '321 Hospital Drive',
        city: 'Fremont',
        state: 'CA',
        zip: '94538'
      },
      category: 'health',
      spots: 20,
      spotsRemaining: 15,
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef'
    }
  ], []);
  
  // Apply client-side filtering to events (used for both cached and mock data)
  const filterEventsClientSide = useCallback((eventsData) => {
    let filteredEvents = [...eventsData];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredEvents = filteredEvents.filter(event => 
        event.title?.toLowerCase().includes(query) || 
        event.description?.toLowerCase().includes(query) ||
        event.category?.toLowerCase().includes(query) ||
        event.organization?.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (filters.category) {
      filteredEvents = filteredEvents.filter(event => 
        event.category === filters.category
      );
    }
    
    // Apply tab filters
    if (activeTab === 1) { // Upcoming events
      const today = new Date();
      filteredEvents = filteredEvents.filter(event => 
        new Date(event.startDate) > today
      );
    } else if (activeTab === 2) { // Popular events (events with few spots remaining)
      filteredEvents = filteredEvents.filter(event => 
        event.spots && event.spotsRemaining && 
        (event.spotsRemaining / event.spots) < 0.5
      );
    }
    
    return filteredEvents;
  }, [searchQuery, filters.category, activeTab]);
  
  // Fetch events function - wrapped in useCallback to avoid dependency issues
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      
      // Development mode check - same as in App.js
      const isDevelopmentMode = true; // TEMPORARY: Set to true for testing

      // Handle offline state first
      if (!networkStatus && !isDevelopmentMode) {
        const cachedData = await getCachedEvents();
        if (cachedData && cachedData.length > 0) {
          // Apply client-side filtering to cached data
          let filteredEvents = filterEventsClientSide(cachedData);
          setEvents(filteredEvents);
          setLoading(false);
          return;
        } else {
          setError('You are offline and no cached events are available.');
          setLoading(false);
          return;
        }
      }

      if (isDevelopmentMode) {
        // Filter mock data based on search query for a better test experience
        let filteredEvents = filterEventsClientSide(dummyEvents);
        setEvents(filteredEvents);
        
        // Cache the mock events for offline access (in development mode)
        await cacheEvents(dummyEvents);
        setLoading(false);
        return;
      }
      
      // Production code below
      // Build query parameters based on filters and tab selection
      let queryParams = new URLSearchParams();
      
      // Apply tab filter
      if (activeTab === 1) {
        queryParams.append('upcoming', 'true');
      } else if (activeTab === 2) {
        queryParams.append('popular', 'true');
      }
      
      // Apply search
      if (searchQuery) {
        queryParams.append('search', searchQuery);
      }
      
      // Apply filters
      if (filters.category) {
        queryParams.append('category', filters.category);
      }
      
      if (filters.skillLevel) {
        queryParams.append('skillLevel', filters.skillLevel);
      }
      
      if (filters.date) {
        queryParams.append('date', filters.date);
      }
      
      // Add location and distance params if available from user profile or device
      // This would typically use geolocation API
      // queryParams.append('lat', userLocation.lat);
      // queryParams.append('lng', userLocation.lng);
      queryParams.append('distance', filters.distance);
      
      const response = await axios.get(`/api/events?${queryParams.toString()}`);
      const fetchedEvents = response.data.events || [];
      setEvents(fetchedEvents);
      
      // Cache events for offline access
      await cacheEvents(fetchedEvents);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching events:', err);
      
      // Try to fetch from cache if network request fails
      try {
        const cachedData = await getCachedEvents();
        if (cachedData && cachedData.length > 0) {
          let filteredEvents = filterEventsClientSide(cachedData);
          setEvents(filteredEvents);
          setError('Using cached events. Some information may not be up to date.');
        } else {
          setError('Failed to load events. Please try again later.');
        }
      } catch (cacheErr) {
        setError('Failed to load events. Please try again later.');
      }
      
      setLoading(false);
    }
  }, [activeTab, searchQuery, filters, networkStatus, filterEventsClientSide, dummyEvents]);
  
  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus(true);
      // Refresh data when coming back online
      fetchEvents();
    };
    
    const handleOffline = () => {
      setNetworkStatus(false);
      setShowOfflineAlert(true);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchEvents]);
  
  // Load events on component mount or when filters change
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);
  
  // Handle search input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
  };
  
  // Update filter values
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      category: '',
      distance: 50,
      skillLevel: '',
      date: ''
    });
  };
  
  return (
    <Box className="page-content">
      {/* Page Header */}
      <Typography variant="h5" component="h1" sx={{ mb: 3 }}>
        Explore Events
      </Typography>
      
      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search events..."
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton edge="end" onClick={handleClearSearch} size="small">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
            sx: { borderRadius: 3 }
          }}
        />
      </Box>
      
      {/* Network Status Indicator (only show when offline) */}
      {!networkStatus && (
        <Alert 
          severity="warning" 
          icon={<OfflineIcon />}
          sx={{ mb: 2 }}
        >
          You're offline. Showing cached events.
        </Alert>
      )}
      
      {/* Tabs and Filters */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          TabIndicatorProps={{ sx: { height: 3, borderRadius: 3 } }}
        >
          <Tab label="All" />
          <Tab label="Upcoming" />
          <Tab label="Popular" />
        </Tabs>
        
        <IconButton onClick={() => setFilterDrawerOpen(true)}>
          <FilterIcon />
        </IconButton>
      </Box>
      
      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Events List */}
      <Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : events.length > 0 ? (
          events.map(event => (
            <EventCard 
              key={event.id} 
              event={event} 
              onClick={() => navigate(`/events/${event.id}`)} 
            />
          ))
        ) : (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              No events found.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your filters or search terms.
            </Typography>
          </Box>
        )}
      </Box>
      
      {/* Filters Drawer */}
      <Drawer
        anchor="bottom"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '80vh'
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Filters</Typography>
            <Button 
              variant="outlined" 
              size="small"
              onClick={handleResetFilters}
            >
              Reset All
            </Button>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          {/* Category Filter */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              value={filters.category}
              label="Category"
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {EVENT_CATEGORIES.map(category => (
                <MenuItem 
                  key={category} 
                  value={category}
                  sx={{ textTransform: 'capitalize' }}
                >
                  {category.replace(/-/g, ' ')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {/* Distance Filter */}
          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>
              Distance: {filters.distance} {filters.distance === 1 ? 'mile' : 'miles'}
            </Typography>
            <Slider
              value={filters.distance}
              min={1}
              max={100}
              step={1}
              onChange={(e, newValue) => handleFilterChange('distance', newValue)}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value} mi`}
            />
          </Box>
          
          {/* Skill Level Filter */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="skill-level-label">Skill Level</InputLabel>
            <Select
              labelId="skill-level-label"
              value={filters.skillLevel}
              label="Skill Level"
              onChange={(e) => handleFilterChange('skillLevel', e.target.value)}
            >
              <MenuItem value="">Any Skill Level</MenuItem>
              <MenuItem value="beginner">Beginner</MenuItem>
              <MenuItem value="intermediate">Intermediate</MenuItem>
              <MenuItem value="advanced">Advanced</MenuItem>
            </Select>
          </FormControl>
          
          {/* Date Filter */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="date-label">Date</InputLabel>
            <Select
              labelId="date-label"
              value={filters.date}
              label="Date"
              onChange={(e) => handleFilterChange('date', e.target.value)}
            >
              <MenuItem value="">Any Date</MenuItem>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="this-week">This Week</MenuItem>
              <MenuItem value="this-weekend">This Weekend</MenuItem>
              <MenuItem value="next-week">Next Week</MenuItem>
              <MenuItem value="this-month">This Month</MenuItem>
            </Select>
          </FormControl>
          
          <Button 
            variant="contained" 
            fullWidth 
            sx={{ mt: 2 }}
            onClick={() => setFilterDrawerOpen(false)}
          >
            Apply Filters
          </Button>
        </Box>
      </Drawer>
      
      {/* Offline Alert Snackbar */}
      <Snackbar
        open={showOfflineAlert}
        autoHideDuration={3000}
        onClose={() => setShowOfflineAlert(false)}
        message="You are offline. Showing cached events."
      />
    </Box>
  );
}

export default Explore;
