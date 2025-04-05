import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  CardMedia,
  Button, 
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Pagination,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Fab
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  LocationOn as LocationIcon,
  Category as CategoryIcon,
  Close as CloseIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

// Event Card Component
const EventCard = ({ event }) => {
  const navigate = useNavigate();
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Default placeholder image if none is provided
  const eventImage = event.image || 'https://source.unsplash.com/random/300x200/?volunteer';
  
  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
      }
    }}>
      <CardMedia
        component="img"
        height="140"
        image={eventImage}
        alt={event.title}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="div" gutterBottom>
          {event.title}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          <Chip 
            icon={<CategoryIcon fontSize="small" />} 
            label={event.category.replace(/-/g, ' ')} 
            size="small" 
            color="primary" 
            variant="outlined" 
          />
          <Chip 
            icon={<LocationIcon fontSize="small" />} 
            label={event.location.city} 
            size="small" 
            variant="outlined" 
          />
        </Stack>
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
      </CardActions>
    </Card>
  );
};

// Filter Panel Component
const FilterPanel = ({ filters, setFilters, categories, locations, onApplyFilters, open, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleClearFilters = () => {
    setLocalFilters({
      category: '',
      location: '',
      date: ''
    });
  };
  
  const handleApplyFilters = () => {
    setFilters(localFilters);
    onApplyFilters(localFilters);
    onClose();
  };
  
  if (!open) return null;
  
  return (
    <Box sx={{ 
      p: 3, 
      mb: 3, 
      bgcolor: 'background.paper', 
      borderRadius: 2,
      boxShadow: 3
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h3">
          Filter Events
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth size="small">
            <InputLabel id="category-filter-label">Category</InputLabel>
            <Select
              labelId="category-filter-label"
              id="category"
              name="category"
              value={localFilters.category}
              label="Category"
              onChange={handleFilterChange}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.value} value={category.value}>
                  {category.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth size="small">
            <InputLabel id="location-filter-label">Location</InputLabel>
            <Select
              labelId="location-filter-label"
              id="location"
              name="location"
              value={localFilters.location}
              label="Location"
              onChange={handleFilterChange}
            >
              <MenuItem value="">All Locations</MenuItem>
              {locations.map((location) => (
                <MenuItem key={location} value={location}>
                  {location}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            id="date"
            name="date"
            label="Event Date"
            type="date"
            value={localFilters.date}
            onChange={handleFilterChange}
            size="small"
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
      </Grid>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
        <Button 
          variant="outlined" 
          onClick={handleClearFilters}
        >
          Clear
        </Button>
        <Button 
          variant="contained" 
          onClick={handleApplyFilters}
        >
          Apply Filters
        </Button>
      </Box>
    </Box>
  );
};

function EventsList() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    date: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  // Categories list
  const categories = [
    { value: 'education', label: 'Education' },
    { value: 'environment', label: 'Environment' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'social-services', label: 'Social Services' },
    { value: 'disaster-relief', label: 'Disaster Relief' },
    { value: 'animal-welfare', label: 'Animal Welfare' },
    { value: 'community-development', label: 'Community Development' },
    { value: 'arts-culture', label: 'Arts & Culture' },
    { value: 'sports-recreation', label: 'Sports & Recreation' },
    { value: 'other', label: 'Other' }
  ];

  // Extract available locations from events (would be fetched from API in real implementation)
  const [locations, setLocations] = useState([]);

  const fetchEvents = async (pageNum = 1, searchTermParam = searchTerm, filtersParam = filters) => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = {
        page: pageNum,
        limit: 12,
      };
      
      if (searchTermParam) {
        params.keyword = searchTermParam;
      }
      
      if (filtersParam.category) {
        params.category = filtersParam.category;
      }
      
      if (filtersParam.location) {
        params.location = filtersParam.location;
      }
      
      if (filtersParam.date) {
        params.date = filtersParam.date;
      }
      
      const response = await axios.get('/api/events', { params });
      
      setEvents(response.data.events);
      
      // Calculate total pages based on total events count and limit per page
      const total = Math.ceil(response.data.count / 12);
      setTotalPages(total > 0 ? total : 1);
      
      // Extract unique locations for filter dropdown
      if (response.data.events.length > 0) {
        const uniqueLocations = [...new Set(response.data.events.map(event => event.location.city))];
        setLocations(uniqueLocations);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load events');
      setLoading(false);
      console.error('Events fetch error:', err);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    fetchEvents(1, searchTerm, filters);
  };

  // Handle filter apply
  const handleApplyFilters = (newFilters) => {
    setPage(1); // Reset to first page on new filters
    fetchEvents(1, searchTerm, newFilters);
  };

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
    fetchEvents(value, searchTerm, filters);
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' },
        flexDirection: { xs: 'column', sm: 'row' },
        mb: 4 
      }}>
        <Typography variant="h4" component="h1" sx={{ mb: { xs: 2, sm: 0 } }}>
          Volunteer Events
        </Typography>
        
        {/* Only show create event button for organizations */}
        {user?.userType === 'organization' && (
          <Fab 
            color="primary" 
            aria-label="add"
            onClick={() => navigate('/events/create')}
            sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}
          >
            <AddIcon />
          </Fab>
        )}
      </Box>
      
      {/* Search and Filter Section */}
      <Box sx={{ mb: 4 }}>
        <form onSubmit={handleSearch}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={8}>
              <TextField
                fullWidth
                placeholder="Search events by keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <Button 
                variant="contained" 
                fullWidth 
                type="submit"
              >
                Search
              </Button>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <Button 
                variant="outlined" 
                fullWidth
                startIcon={<FilterIcon />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
      
      {/* Filter Panel */}
      <FilterPanel 
        filters={filters}
        setFilters={setFilters}
        categories={categories}
        locations={locations}
        onApplyFilters={handleApplyFilters}
        open={showFilters}
        onClose={() => setShowFilters(false)}
      />
      
      {/* Active Filters */}
      {(filters.category || filters.location || filters.date) && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Active Filters:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {filters.category && (
              <Chip 
                label={`Category: ${categories.find(c => c.value === filters.category)?.label || filters.category}`}
                onDelete={() => {
                  const newFilters = { ...filters, category: '' };
                  setFilters(newFilters);
                  handleApplyFilters(newFilters);
                }}
                size="small"
              />
            )}
            {filters.location && (
              <Chip 
                label={`Location: ${filters.location}`}
                onDelete={() => {
                  const newFilters = { ...filters, location: '' };
                  setFilters(newFilters);
                  handleApplyFilters(newFilters);
                }}
                size="small"
              />
            )}
            {filters.date && (
              <Chip 
                label={`Date: ${new Date(filters.date).toLocaleDateString()}`}
                onDelete={() => {
                  const newFilters = { ...filters, date: '' };
                  setFilters(newFilters);
                  handleApplyFilters(newFilters);
                }}
                size="small"
              />
            )}
          </Stack>
        </Box>
      )}
      
      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Error State */}
      {error && !loading && (
        <Alert severity="error" sx={{ my: 3 }}>{error}</Alert>
      )}
      
      {/* Empty State */}
      {!loading && !error && events.length === 0 && (
        <Box sx={{ 
          textAlign: 'center', 
          py: 5, 
          bgcolor: 'background.paper', 
          borderRadius: 2 
        }}>
          <Typography variant="h6" gutterBottom>
            No events found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Try changing your search or filter criteria
          </Typography>
        </Box>
      )}
      
      {/* Events Grid */}
      {!loading && !error && events.length > 0 && (
        <>
          <Grid container spacing={3}>
            {events.map((event) => (
              <Grid item key={event._id} xs={12} sm={6} md={4} lg={3}>
                <EventCard event={event} />
              </Grid>
            ))}
          </Grid>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

export default EventsList;
