import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Chip,
  OutlinedInput,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  IconButton
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function CreateEvent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '17:00',
    address: '',
    city: '',
    state: '',
    country: '',
    requiredSkills: [],
    maxVolunteers: '',
    pointsForAttendance: '10',
    image: ''
  });
  
  // New skill input state
  const [newSkill, setNewSkill] = useState('');
  
  // Form validation errors
  const [formErrors, setFormErrors] = useState({});
  
  // Categories for dropdown
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
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  // Add a new skill
  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.requiredSkills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        requiredSkills: [...formData.requiredSkills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };
  
  // Remove a skill
  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      requiredSkills: formData.requiredSkills.filter(skill => skill !== skillToRemove)
    });
  };
  
  // Form validation
  const validateForm = () => {
    const errors = {};
    let isValid = true;
    
    // Title validation
    if (!formData.title.trim()) {
      errors.title = 'Event title is required';
      isValid = false;
    }
    
    // Description validation
    if (!formData.description.trim()) {
      errors.description = 'Event description is required';
      isValid = false;
    }
    
    // Category validation
    if (!formData.category) {
      errors.category = 'Please select a category';
      isValid = false;
    }
    
    // Date/time validation
    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
      isValid = false;
    }
    
    if (!formData.endDate) {
      errors.endDate = 'End date is required';
      isValid = false;
    }
    
    // Check if end date/time is after start date/time
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
    
    if (endDateTime <= startDateTime) {
      errors.endDate = 'End date/time must be after start date/time';
      isValid = false;
    }
    
    // Location validation
    if (!formData.city.trim()) {
      errors.city = 'City is required';
      isValid = false;
    }
    
    if (!formData.country.trim()) {
      errors.country = 'Country is required';
      isValid = false;
    }
    
    // Max volunteers validation (if provided)
    if (formData.maxVolunteers && (isNaN(formData.maxVolunteers) || parseInt(formData.maxVolunteers) <= 0)) {
      errors.maxVolunteers = 'Please enter a valid number';
      isValid = false;
    }
    
    // Points validation
    if (isNaN(formData.pointsForAttendance) || parseInt(formData.pointsForAttendance) < 0) {
      errors.pointsForAttendance = 'Please enter a valid number';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Prepare data for API
      const eventData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        startDate: new Date(`${formData.startDate}T${formData.startTime}`).toISOString(),
        endDate: new Date(`${formData.endDate}T${formData.endTime}`).toISOString(),
        location: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country
        },
        requiredSkills: formData.requiredSkills,
        pointsForAttendance: parseInt(formData.pointsForAttendance),
        image: formData.image
      };
      
      // Add maxVolunteers only if provided
      if (formData.maxVolunteers) {
        eventData.maxVolunteers = parseInt(formData.maxVolunteers);
      }
      
      // Send request to API
      const response = await axios.post('/api/events', eventData);
      
      setSuccess(true);
      setLoading(false);
      
      // Redirect to the new event page after a short delay
      setTimeout(() => {
        navigate(`/events/${response.data.event._id}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event. Please try again.');
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
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
      
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Event
        </Typography>
        
        {success && (
          <Alert severity="success" sx={{ my: 2 }}>
            Event created successfully! Redirecting to event page...
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          {/* Event Basic Information */}
          <Typography variant="h5" component="h2" gutterBottom>
            Basic Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Event Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={!!formErrors.title}
                helperText={formErrors.title}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={!!formErrors.description}
                helperText={formErrors.description}
                multiline
                rows={4}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.category} required>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  name="category"
                  value={formData.category}
                  label="Category"
                  onChange={handleChange}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.category && (
                  <Typography variant="caption" color="error">
                    {formErrors.category}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Event Image URL (optional)"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 4 }} />
          
          {/* Event Date and Time */}
          <Typography variant="h5" component="h2" gutterBottom>
            Date and Time
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Start Date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                error={!!formErrors.startDate}
                helperText={formErrors.startDate}
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Start Time"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="End Date"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                error={!!formErrors.endDate}
                helperText={formErrors.endDate}
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="End Time"
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 4 }} />
          
          {/* Event Location */}
          <Typography variant="h5" component="h2" gutterBottom>
            Location
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street address"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                error={!!formErrors.city}
                helperText={formErrors.city}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="State/Province"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                error={!!formErrors.country}
                helperText={formErrors.country}
                required
              />
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 4 }} />
          
          {/* Additional Information */}
          <Typography variant="h5" component="h2" gutterBottom>
            Additional Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Required Skills
              </Typography>
              <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ mb: 2 }}>
                {formData.requiredSkills.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    onDelete={() => handleRemoveSkill(skill)}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Stack>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  label="Add a skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  sx={{ flexGrow: 1 }}
                />
                <Button
                  startIcon={<AddIcon />}
                  variant="outlined"
                  onClick={handleAddSkill}
                >
                  Add
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Maximum Volunteers (optional)"
                name="maxVolunteers"
                type="number"
                value={formData.maxVolunteers}
                onChange={handleChange}
                error={!!formErrors.maxVolunteers}
                helperText={formErrors.maxVolunteers || "Leave blank for unlimited spots"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Points for Attendance"
                name="pointsForAttendance"
                type="number"
                value={formData.pointsForAttendance}
                onChange={handleChange}
                error={!!formErrors.pointsForAttendance}
                helperText={formErrors.pointsForAttendance}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/events')}
              sx={{ mr: 2 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Event'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default CreateEvent;
