import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Chip,
  IconButton,
  InputAdornment,
  Autocomplete,
  Stack,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Grid
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  Image as ImageIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

// Event categories
const EVENT_CATEGORIES = [
  { value: 'education', label: 'Education' },
  { value: 'environmental', label: 'Environmental' },
  { value: 'health', label: 'Health & Wellness' },
  { value: 'animal-welfare', label: 'Animal Welfare' },
  { value: 'community', label: 'Community Service' },
  { value: 'disaster-relief', label: 'Disaster Relief' },
  { value: 'arts-culture', label: 'Arts & Culture' },
  { value: 'technology', label: 'Technology' },
  { value: 'sports-recreation', label: 'Sports & Recreation' },
  { value: 'social-services', label: 'Social Services' }
];

// List of skills for the skills autocomplete
const SKILLS_LIST = [
  'Teaching', 'Mentoring', 'Coaching', 'Public Speaking', 'Writing', 
  'Editing', 'Research', 'Data Analysis', 'Project Management', 
  'Event Planning', 'Fundraising', 'Marketing', 'Social Media', 
  'Graphic Design', 'Web Development', 'Programming', 'Photography', 
  'Videography', 'First Aid', 'CPR', 'Cooking', 'Gardening', 
  'Construction', 'Painting', 'Music', 'Art', 'Languages', 'Translation', 
  'Counseling', 'Administrative Support', 'Customer Service', 'Healthcare'
];

function CreateEvent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Step management
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Event Details', 'Location & Time', 'Requirements'];
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    startDate: null,
    endDate: null,
    durationHours: '',
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States'
    },
    maxVolunteers: '',
    requiredSkills: [],
    skillLevel: 'beginner',
    image: null,
    imagePreviewUrl: ''
  });
  
  // Form validation
  const [errors, setErrors] = useState({});
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  // Temp states for multi-select fields
  const [tempSkill, setTempSkill] = useState('');
  
  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested location fields
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear field-specific error when changing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Handle date changes
  const handleDateChange = (date, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
    
    // Clear field-specific error when changing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };
  
  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file is an image and not too large (5MB)
    if (!file.type.match('image.*')) {
      setErrors(prev => ({
        ...prev,
        image: 'Please upload an image file'
      }));
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        image: 'Image should be less than 5MB'
      }));
      return;
    }
    
    // Create image preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreviewUrl: reader.result
      }));
    };
    reader.readAsDataURL(file);
    
    // Clear error
    if (errors.image) {
      setErrors(prev => ({
        ...prev,
        image: ''
      }));
    }
  };
  
  // Handle adding a skill
  const handleAddSkill = () => {
    if (!tempSkill.trim()) return;
    
    if (formData.requiredSkills.includes(tempSkill)) {
      setErrors(prev => ({
        ...prev,
        requiredSkills: 'This skill is already added'
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      requiredSkills: [...prev.requiredSkills, tempSkill]
    }));
    
    setTempSkill('');
    
    // Clear error
    if (errors.requiredSkills) {
      setErrors(prev => ({
        ...prev,
        requiredSkills: ''
      }));
    }
  };
  
  // Handle removing a skill
  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(skill => skill !== skillToRemove)
    }));
  };
  
  // Validate step
  const validateStep = () => {
    const stepErrors = {};
    let isValid = true;
    
    if (activeStep === 0) {
      // Validate basic event details
      if (!formData.title.trim()) {
        stepErrors.title = 'Event title is required';
        isValid = false;
      }
      
      if (!formData.description.trim()) {
        stepErrors.description = 'Event description is required';
        isValid = false;
      } else if (formData.description.length < 20) {
        stepErrors.description = 'Description should be at least 20 characters';
        isValid = false;
      }
      
      if (!formData.category) {
        stepErrors.category = 'Category is required';
        isValid = false;
      }
    } 
    else if (activeStep === 1) {
      // Validate location and time
      if (!formData.location.address.trim()) {
        stepErrors['location.address'] = 'Address is required';
        isValid = false;
      }
      
      if (!formData.location.city.trim()) {
        stepErrors['location.city'] = 'City is required';
        isValid = false;
      }
      
      if (!formData.location.state.trim()) {
        stepErrors['location.state'] = 'State is required';
        isValid = false;
      }
      
      if (!formData.location.zipCode.trim()) {
        stepErrors['location.zipCode'] = 'ZIP code is required';
        isValid = false;
      }
      
      if (!formData.startDate) {
        stepErrors.startDate = 'Start date is required';
        isValid = false;
      }
      
      if (!formData.endDate) {
        stepErrors.endDate = 'End date is required';
        isValid = false;
      } else if (formData.startDate && formData.endDate <= formData.startDate) {
        stepErrors.endDate = 'End date must be after start date';
        isValid = false;
      }
      
      if (!formData.durationHours) {
        stepErrors.durationHours = 'Duration is required';
        isValid = false;
      } else if (isNaN(formData.durationHours) || formData.durationHours <= 0) {
        stepErrors.durationHours = 'Duration must be a positive number';
        isValid = false;
      }
    }
    else if (activeStep === 2) {
      // Validate requirements
      if (!formData.maxVolunteers) {
        stepErrors.maxVolunteers = 'Maximum number of volunteers is required';
        isValid = false;
      } else if (isNaN(formData.maxVolunteers) || formData.maxVolunteers <= 0) {
        stepErrors.maxVolunteers = 'Please enter a valid number';
        isValid = false;
      }
      
      if (!formData.skillLevel) {
        stepErrors.skillLevel = 'Skill level is required';
        isValid = false;
      }
    }
    
    setErrors(stepErrors);
    return isValid;
  };
  
  // Handle next step
  const handleNextStep = () => {
    if (validateStep()) {
      setActiveStep(prev => prev + 1);
    }
  };
  
  // Handle back step
  const handleBackStep = () => {
    setActiveStep(prev => prev - 1);
  };
  
  // Function to store event locally for offline use
  const storeLocalEvent = async (eventData) => {
    try {
      const localEvents = JSON.parse(localStorage.getItem('seekup_offline_events') || '[]');
      
      // Generate a temporary ID for the event
      const tempId = `temp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;      
      const newEvent = {
        id: tempId,
        ...eventData,
        createdAt: new Date().toISOString(),
        createdBy: user?.id || 'unknown',
        organizerName: user?.name || 'Unknown Organizer',
        organizerLogo: user?.avatar || null,
        isPending: true, // Flag to indicate this event is pending sync
      };
      
      localEvents.push(newEvent);
      localStorage.setItem('seekup_offline_events', JSON.stringify(localEvents));
      
      return tempId;
    } catch (error) {
      console.error('Error storing event locally:', error);
      return null;
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    // Validate the final step
    if (!validateStep()) {
      return;
    }
    
    setLoading(true);
    setSubmitError(null);
    
    // Check if we're offline
    const isOffline = !navigator.onLine;
    
    // Prepare event data object (not FormData yet)
    const eventDataObj = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      startDate: formData.startDate.toISOString(),
      endDate: formData.endDate.toISOString(),
      durationHours: formData.durationHours,
      location: formData.location,
      maxVolunteers: formData.maxVolunteers,
      skillLevel: formData.skillLevel,
      requiredSkills: formData.requiredSkills,
      // We can't store the actual File object in localStorage, but we can store the preview URL
      imagePreviewUrl: formData.imagePreviewUrl
    };
    
    // If offline, store locally and navigate
    if (isOffline) {
      try {
        const tempId = await storeLocalEvent(eventDataObj);
        if (tempId) {
          setLoading(false);
          // Navigate to home with success message instead of event detail
          // since the event detail would need to load from the API
          navigate('/', { 
            state: { 
              message: 'Event created and saved offline. It will be synced when you reconnect.',
              severity: 'info'
            }
          });
        } else {
          throw new Error('Failed to store event locally');
        }
      } catch (error) {
        console.error('Error in offline event creation:', error);
        setSubmitError('Failed to save event offline. Please check your device storage.');
        setLoading(false);
      }
      return;
    }
    
    // Online flow - create FormData for API call
    try {
      // Create form data for file upload
      const eventData = new FormData();
      
      // Append basic fields
      eventData.append('title', formData.title);
      eventData.append('description', formData.description);
      eventData.append('category', formData.category);
      eventData.append('startDate', formData.startDate.toISOString());
      eventData.append('endDate', formData.endDate.toISOString());
      eventData.append('durationHours', formData.durationHours);
      
      // Append location as JSON string
      eventData.append('location', JSON.stringify(formData.location));
      
      // Append other fields
      eventData.append('maxVolunteers', formData.maxVolunteers);
      eventData.append('skillLevel', formData.skillLevel);
      
      // Append required skills as JSON array
      eventData.append('requiredSkills', JSON.stringify(formData.requiredSkills));
      
      // Append image if available
      if (formData.image) {
        eventData.append('eventImage', formData.image);
      }
      
      // Ensure we have an authorization token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      // Send request to create event
      const response = await axios.post('/api/events', eventData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Check if the response contains a valid event ID
      if (response.data && response.data.id) {
        // Navigate to the newly created event page
        navigate(`/events/${response.data.id}`);
      } else if (response.data && response.data._id) {
        // Some APIs return _id instead of id
        navigate(`/events/${response.data._id}`);
      } else {
        console.error('Invalid response format:', response.data);
        // Navigate to home with success message if we can't get the ID
        navigate('/', { 
          state: { 
            message: 'Event created successfully!',
            severity: 'success'
          }
        });
      }
    } catch (err) {
      console.error('Error creating event:', err);
      
      // Check if it's an authentication error
      if (err.response && err.response.status === 401) {
        setSubmitError('Authentication error. Please log in again.');
      } else {
        setSubmitError(err.response?.data?.message || 'Failed to create event. Please try again.');
      }
      
      setLoading(false);
    }
  };
  
  // Render step content
  const getStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Event Details
            </Typography>
            
            <TextField
              fullWidth
              label="Event Title"
              name="title"
              variant="outlined"
              value={formData.title}
              onChange={handleChange}
              error={!!errors.title}
              helperText={errors.title}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Description"
              name="description"
              variant="outlined"
              value={formData.description}
              onChange={handleChange}
              error={!!errors.description}
              helperText={errors.description}
              margin="normal"
              multiline
              rows={4}
              required
            />
            
            <FormControl 
              fullWidth 
              margin="normal" 
              error={!!errors.category}
              required
            >
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                id="category"
                name="category"
                value={formData.category}
                label="Category"
                onChange={handleChange}
              >
                {EVENT_CATEGORIES.map(category => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.category && (
                <FormHelperText>{errors.category}</FormHelperText>
              )}
            </FormControl>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" gutterBottom>
                Event Image (Optional)
              </Typography>
              <input
                accept="image/*"
                id="image-upload"
                type="file"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<ImageIcon />}
                >
                  Upload Image
                </Button>
              </label>
              {errors.image && (
                <FormHelperText error>{errors.image}</FormHelperText>
              )}
              
              {formData.imagePreviewUrl && (
                <Box sx={{ mt: 2 }}>
                  <img 
                    src={formData.imagePreviewUrl} 
                    alt="Event preview" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: 200, 
                      borderRadius: 8 
                    }} 
                  />
                </Box>
              )}
            </Box>
          </Box>
        );
      
      case 1:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Location & Time
            </Typography>
            
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Stack spacing={3}>
                <DateTimePicker
                  label="Start Date & Time"
                  value={formData.startDate}
                  onChange={(date) => handleDateChange(date, 'startDate')}
                  slotProps={{
                    textField: {
                      margin: 'normal',
                      fullWidth: true,
                      error: !!errors.startDate,
                      helperText: errors.startDate,
                    }
                  }}
                />
                
                <DateTimePicker
                  label="End Date & Time"
                  value={formData.endDate}
                  onChange={(date) => handleDateChange(date, 'endDate')}
                  slotProps={{
                    textField: {
                      margin: 'normal',
                      fullWidth: true,
                      error: !!errors.endDate,
                      helperText: errors.endDate,
                    }
                  }}
                />
              </Stack>
            </LocalizationProvider>
            
            <TextField
              fullWidth
              label="Duration (hours)"
              name="durationHours"
              variant="outlined"
              value={formData.durationHours}
              onChange={handleChange}
              error={!!errors.durationHours}
              helperText={errors.durationHours}
              margin="normal"
              type="number"
              InputProps={{
                inputProps: { min: 0.5, step: 0.5 },
                endAdornment: <InputAdornment position="end">hours</InputAdornment>,
              }}
              required
            />
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Event Location
              </Typography>
              
              <TextField
                fullWidth
                label="Street Address"
                name="location.address"
                variant="outlined"
                value={formData.location.address}
                onChange={handleChange}
                error={!!errors['location.address']}
                helperText={errors['location.address']}
                margin="normal"
                required
              />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    name="location.city"
                    variant="outlined"
                    value={formData.location.city}
                    onChange={handleChange}
                    error={!!errors['location.city']}
                    helperText={errors['location.city']}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="State"
                    name="location.state"
                    variant="outlined"
                    value={formData.location.state}
                    onChange={handleChange}
                    error={!!errors['location.state']}
                    helperText={errors['location.state']}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="ZIP Code"
                    name="location.zipCode"
                    variant="outlined"
                    value={formData.location.zipCode}
                    onChange={handleChange}
                    error={!!errors['location.zipCode']}
                    helperText={errors['location.zipCode']}
                    margin="normal"
                    required
                  />
                </Grid>
              </Grid>
              
              <TextField
                fullWidth
                label="Country"
                name="location.country"
                variant="outlined"
                value={formData.location.country}
                onChange={handleChange}
                margin="normal"
                disabled
              />
            </Box>
          </Box>
        );
      
      case 2:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Requirements
            </Typography>
            
            <TextField
              fullWidth
              label="Maximum Volunteers"
              name="maxVolunteers"
              variant="outlined"
              value={formData.maxVolunteers}
              onChange={handleChange}
              error={!!errors.maxVolunteers}
              helperText={errors.maxVolunteers}
              margin="normal"
              type="number"
              InputProps={{
                inputProps: { min: 1 },
                startAdornment: (
                  <InputAdornment position="start">
                    <PeopleIcon />
                  </InputAdornment>
                ),
              }}
              required
            />
            
            <FormControl 
              fullWidth 
              margin="normal" 
              error={!!errors.skillLevel}
              required
            >
              <InputLabel id="skill-level-label">Required Skill Level</InputLabel>
              <Select
                labelId="skill-level-label"
                id="skillLevel"
                name="skillLevel"
                value={formData.skillLevel}
                label="Required Skill Level"
                onChange={handleChange}
              >
                <MenuItem value="beginner">Beginner - No experience required</MenuItem>
                <MenuItem value="intermediate">Intermediate - Some experience helpful</MenuItem>
                <MenuItem value="advanced">Advanced - Experienced volunteers needed</MenuItem>
              </Select>
              {errors.skillLevel && (
                <FormHelperText>{errors.skillLevel}</FormHelperText>
              )}
            </FormControl>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Required Skills (Optional)
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                <Autocomplete
                  freeSolo
                  options={SKILLS_LIST}
                  value={tempSkill}
                  onInputChange={(event, newValue) => {
                    setTempSkill(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Add required skills" 
                      variant="outlined"
                      fullWidth
                      error={!!errors.requiredSkills}
                      helperText={errors.requiredSkills}
                    />
                  )}
                  sx={{ flexGrow: 1, mr: 1 }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddSkill}
                  disabled={!tempSkill.trim()}
                  sx={{ height: 56 }}
                >
                  <AddIcon />
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {formData.requiredSkills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    onDelete={() => handleRemoveSkill(skill)}
                  />
                ))}
              </Box>
            </Box>
            
            {submitError && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {submitError}
              </Alert>
            )}
          </Box>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <Box className="page-content">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton edge="start" onClick={() => navigate(-1)}>
          <BackIcon />
        </IconButton>
        <Typography variant="h5" component="h1" sx={{ ml: 1 }}>
          Create Event
        </Typography>
      </Box>
      
      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {/* Step Content */}
      <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        {getStepContent()}
      </Paper>
      
      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, mb: 3 }}>
        <Button
          variant="outlined"
          onClick={activeStep === 0 ? () => navigate(-1) : handleBackStep}
        >
          {activeStep === 0 ? 'Cancel' : 'Back'}
        </Button>
        
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Create Event'}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNextStep}
          >
            Next
          </Button>
        )}
      </Box>
    </Box>
  );
}

export default CreateEvent;
