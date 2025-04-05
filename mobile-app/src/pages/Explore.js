import React, { useState, useEffect } from 'react';
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
  Stack,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import axios from 'axios';

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
  
  // Filter states
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    distance: 50, // Default max distance in km/miles
    skillLevel: '',
    date: ''
  });
  
  // Load events on component mount or when filters change
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        
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
        setEvents(response.data.events || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again.');
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [activeTab, searchQuery, filters]);
  
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
        <Alert severity="error" sx={{ mb: 2 }}>
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
              key={event._id} 
              event={event} 
              onClick={() => navigate(`/events/${event._id}`)} 
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
    </Box>
  );
}

export default Explore;
