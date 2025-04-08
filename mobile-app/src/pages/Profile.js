import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Avatar,
  Button, 
  Divider,
  TextField,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Badge,
  Switch,
  Autocomplete,
  Snackbar
} from '@mui/material';
import {
  Edit as EditIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  VerifiedUser as VerifiedIcon,
  AddCircle as AddIcon,
  Close as CloseIcon,
  Camera as CameraIcon,
  CheckCircle as CheckCircleIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

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

// List of interests/causes for the interests autocomplete
const INTERESTS_LIST = [
  'Education', 'Health', 'Environment', 'Animal Welfare', 
  'Community Development', 'Poverty Alleviation', 'Hunger Relief', 
  'Homelessness', 'Elderly Care', 'Youth Development', 'Arts & Culture', 
  'Disaster Relief', 'Disability Support', 'Women Empowerment', 
  'LGBTQ+ Rights', 'Racial Justice', 'Human Rights', 'Refugee Support', 
  'Mental Health', 'Substance Abuse', 'Veterans Support', 'Technology', 
  'Sports & Recreation', 'Religious Activities', 'Economic Development'
];

function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateUser, isAuthenticated, refreshToken } = useAuth();
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editField, setEditField] = useState('');
  const [editValue, setEditValue] = useState('');
  const [tempSkill, setTempSkill] = useState('');
  const [tempInterests, setTempInterests] = useState([]);
  
  // Initialize with the known user data
  const initialProfileData = useMemo(() => ({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || '',
    // Other fields will be populated from API
  }), [user]);

  // Track online status
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Check online status
  useEffect(() => {
    const handleOnlineStatusChange = () => {
      setIsOffline(!navigator.onLine);
    };
    
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);

  // Load profile data on component mount
  useEffect(() => {
    const PROFILE_STORAGE_KEY = 'seekup_profile_data';

    const fetchProfile = async () => {
      if (!user) {
        setError('You need to be logged in to view your profile.');
        setLoading(false);
        return;
      }
      
      // If not authenticated, don't attempt to fetch
      if (!isAuthenticated) {
        setError('You need to be logged in to view your profile.');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // If we're offline, use cached data if available
        if (isOffline) {
          const cachedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
          if (cachedProfile) {
            try {
              const parsedProfile = JSON.parse(cachedProfile);
              setProfileData(parsedProfile);
              setError('Using cached profile data. Some information may not be up to date.');
            } catch (parseError) {
              console.error('Error parsing cached profile data:', parseError);
              setProfileData(initialProfileData);
              setError('Error loading cached profile. Using basic information.');
            }
          } else {
            // If no cached data, use whatever we have from context
            setProfileData(initialProfileData);
            setError('You are offline. Using basic profile information.');
          }
          setLoading(false);
          return;
        }
        
        // Online flow - fetch from API
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        const response = await axios.get('/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const fetchedProfile = response.data.user || response.data;
        
        // Cache the profile data for offline use
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(fetchedProfile));
        
        setProfileData(fetchedProfile);
        setLoading(false);
        
      } catch (err) {
        console.error('Error fetching profile:', err);
        
        // Check if it's an authentication error
        if (err.response && err.response.status === 401) {
          // Try to refresh the token and retry
          try {
            await refreshToken();
            
            // Retry the API call with the new token
            const newToken = localStorage.getItem('token');
            if (newToken) {
              const response = await axios.get('/api/users/profile', {
                headers: {
                  'Authorization': `Bearer ${newToken}`
                }
              });
              
              const fetchedProfile = response.data.user || response.data;
              localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(fetchedProfile));
              setProfileData(fetchedProfile);
              setLoading(false);
              return;
            }
          } catch (refreshError) {
            console.error('Error refreshing token:', refreshError);
            // Continue to fallback below
          }
        }
        
        // Fallback to cached data if available
        const cachedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
        if (cachedProfile) {
          try {
            setProfileData(JSON.parse(cachedProfile));
            setError('Failed to update profile. Using cached data.');
          } catch (parseError) {
            console.error('Error parsing cached profile:', parseError);
            setProfileData(initialProfileData);
            setError('Error loading profile. Using basic information.');
          }
        } else {
          // Last resort - use basic data from auth context
          setProfileData(initialProfileData);
          setError('An error occurred. Using basic profile information.');
        }
        setLoading(false);
      }
    };
    
    fetchProfile();
    // Include all dependencies used in the effect
  }, [initialProfileData, user, isOffline, isAuthenticated, refreshToken]);
  
  // Handle edit dialog
  const handleOpenEditDialog = (field, value) => {
    setEditField(field);
    setEditValue(value || '');
    setEditDialogOpen(true);
  };
  
  // Handle save changes
  const handleSaveChanges = async () => {
    try {
      if (!editField) return;
      
      setSaving(true);
      setError(null);
      
      // Update the profile data locally first
      let updatedProfile = { ...profileData };
      
      // Handle nested fields with dot notation
      if (editField.includes('.')) {
        const [parent, child] = editField.split('.');
        updatedProfile[parent] = {
          ...updatedProfile[parent],
          [child]: editValue
        };
      } else {
        updatedProfile[editField] = editValue;
      }
      
          // Call API to update profile
      await axios.put('/api/users/profile', { 
        [editField]: editValue 
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Update local state
      setProfileData(updatedProfile);
      setSaving(false);
      setEditDialogOpen(false);
      setSuccess(true);
      
      // Update user in context if needed
      if (['name', 'email', 'phone'].includes(editField)) {
        updateUser({ [editField]: editValue });
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
      setSaving(false);
    }
  };
  
  // Handle skill management
  const handleAddSkill = async () => {
    if (!tempSkill.trim()) return;
    
    try {
      setSaving(true);
      
      // Update locally
      const updatedSkills = [...(profileData.skills || []), tempSkill];
      setProfileData({ ...profileData, skills: updatedSkills });
      
      // Send to API
      await axios.put('/api/users/profile', { 
        skills: updatedSkills 
      });
      
      setTempSkill('');
      setSaving(false);
      setSuccess(true);
    } catch (err) {
      console.error('Error adding skill:', err);
      setError('Failed to add skill. Please try again.');
      setSaving(false);
    }
  };
  
  const handleRemoveSkill = async (skillToRemove) => {
    try {
      setSaving(true);
      
      // Update locally
      const updatedSkills = profileData.skills.filter(skill => skill !== skillToRemove);
      setProfileData({ ...profileData, skills: updatedSkills });
      
      // Send to API
      await axios.put('/api/users/profile', { 
        skills: updatedSkills 
      });
      
      setSaving(false);
      setSuccess(true);
    } catch (err) {
      console.error('Error removing skill:', err);
      setError('Failed to remove skill. Please try again.');
      setSaving(false);
    }
  };
  
  // Handle interests management
  const handleSaveInterests = async () => {
    try {
      setSaving(true);
      
      // Update locally
      setProfileData({ ...profileData, interests: tempInterests });
      
      // Send to API
      await axios.put('/api/users/profile', { 
        interests: tempInterests 
      });
      
      setSaving(false);
      setEditDialogOpen(false);
      setSuccess(true);
    } catch (err) {
      console.error('Error updating interests:', err);
      setError('Failed to update interests. Please try again.');
      setSaving(false);
    }
  };
  
  // Handle notifications toggle
  const handleToggleNotifications = async (event) => {
    const newValue = event.target.checked;
    
    try {
      // Update locally
      setProfileData({ 
        ...profileData, 
        settings: { ...profileData.settings, notifications: newValue } 
      });
      
      // Send to API
      await axios.put('/api/users/settings', { 
        notifications: newValue 
      });
      
      setSuccess(true);
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Failed to update settings. Please try again.');
      
      // Revert local change
      setProfileData({ 
        ...profileData, 
        settings: { ...profileData.settings, notifications: !newValue } 
      });
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  if (loading) {
    return (
      <Box className="page-content" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // No profile data case
  if (!profileData) {
    return (
      <Box className="page-content">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Failed to load profile data.'}
        </Alert>
        <Button 
          variant="contained"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }
  
  return (
    <Box className="page-content">
      {/* Profile Header */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        position: 'relative',
        mb: 3
      }}>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            <IconButton 
              size="small" 
              sx={{ 
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider'
              }}
              onClick={() => handleOpenEditDialog('avatar', profileData.avatar)}
            >
              <CameraIcon fontSize="small" />
            </IconButton>
          }
        >
          <Avatar 
            src={profileData.avatar} 
            alt={profileData.name}
            sx={{ width: 100, height: 100, mb: 2 }}
          />
        </Badge>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          mb: 0.5
        }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 500 }}>
            {profileData.name}
          </Typography>
          
          {/* Verified icon for organizations */}
          {user?.userType === 'organization' && 
          profileData.organizationDetails?.verificationStatus === 'verified' && (
            <VerifiedIcon color="primary" sx={{ ml: 1 }} />
          )}
        </Box>
        
        {user?.userType === 'volunteer' ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Level {profileData.level || 1} • {profileData.points || 0} Points
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Organization • {profileData.organizationDetails?.memberCount || 0} Members
          </Typography>
        )}
      </Box>
      
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Success Snackbar */}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        message="Saved successfully"
        action={
          <IconButton 
            size="small" 
            color="inherit" 
            onClick={() => setSuccess(false)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
      
      {/* Profile Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          TabIndicatorProps={{ sx: { height: 3, borderRadius: 3 } }}
        >
          <Tab label="Profile" />
          <Tab label="Settings" />
        </Tabs>
      </Box>
      
      {/* Profile Info Tab */}
      {activeTab === 0 && (
        <>
          {/* Personal Information Card */}
          <Card sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
              }}>
                <Typography variant="h6">
                  {user?.userType === 'volunteer' ? 'Personal Information' : 'Organization Details'}
                </Typography>
              </Box>
              
              <List sx={{ pt: 0 }}>
                <ListItem
                  secondaryAction={
                    <IconButton edge="end" onClick={() => handleOpenEditDialog('name', profileData.name)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemText 
                    primary="Name" 
                    secondary={profileData.name} 
                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
                
                <Divider component="li" />
                
                <ListItem
                  secondaryAction={
                    <IconButton edge="end" onClick={() => handleOpenEditDialog('email', profileData.email)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemText 
                    primary="Email" 
                    secondary={profileData.email}
                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
                
                <Divider component="li" />
                
                <ListItem
                  secondaryAction={
                    <IconButton edge="end" onClick={() => handleOpenEditDialog('phone', profileData.phone)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemText 
                    primary="Phone" 
                    secondary={profileData.phone || 'Not provided'}
                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
                
                {user?.userType === 'volunteer' && (
                  <>
                    <Divider component="li" />
                    
                    <ListItem
                      secondaryAction={
                        <IconButton edge="end" onClick={() => handleOpenEditDialog('bio', profileData.bio)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      }
                    >
                      <ListItemText 
                        primary="Bio" 
                        secondary={profileData.bio || 'Not provided'}
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body1' }}
                      />
                    </ListItem>
                  </>
                )}
                
                {user?.userType === 'organization' && (
                  <>
                    <Divider component="li" />
                    
                    <ListItem
                      secondaryAction={
                        <IconButton edge="end" onClick={() => handleOpenEditDialog('organizationDetails.description', profileData.organizationDetails?.description)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      }
                    >
                      <ListItemText 
                        primary="About" 
                        secondary={profileData.organizationDetails?.description || 'Not provided'}
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body1' }}
                      />
                    </ListItem>
                    
                    <Divider component="li" />
                    
                    <ListItem
                      secondaryAction={
                        <IconButton edge="end" onClick={() => handleOpenEditDialog('organizationDetails.website', profileData.organizationDetails?.website)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      }
                    >
                      <ListItemText 
                        primary="Website" 
                        secondary={profileData.organizationDetails?.website || 'Not provided'}
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body1' }}
                      />
                    </ListItem>
                  </>
                )}
              </List>
            </CardContent>
          </Card>
          
          {/* Skills Card - For Volunteers */}
          {user?.userType === 'volunteer' && (
            <Card sx={{ mb: 3, borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2
                }}>
                  <Typography variant="h6">Skills</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {profileData.skills && profileData.skills.length > 0 ? (
                    profileData.skills.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        onDelete={() => handleRemoveSkill(skill)}
                        sx={{ m: 0.5 }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No skills added yet
                    </Typography>
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Autocomplete
                    freeSolo
                    options={SKILLS_LIST.filter(skill => 
                      !profileData.skills?.includes(skill)
                    )}
                    value={tempSkill}
                    onChange={(event, newValue) => {
                      setTempSkill(newValue || '');
                    }}
                    inputValue={tempSkill}
                    onInputChange={(event, newInputValue) => {
                      setTempSkill(newInputValue);
                    }}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Add a skill" 
                        variant="outlined" 
                        size="small"
                        fullWidth
                      />
                    )}
                    sx={{ flexGrow: 1 }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddSkill}
                    disabled={!tempSkill.trim() || saving}
                    startIcon={saving ? <CircularProgress size={16} /> : <AddIcon />}
                  >
                    Add
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
          
          {/* Interests Card - For Volunteers */}
          {user?.userType === 'volunteer' && (
            <Card sx={{ mb: 3, borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2
                }}>
                  <Typography variant="h6">Interests</Typography>
                  <Button
                    variant="text"
                    onClick={() => {
                      setTempInterests(profileData.interests || []);
                      handleOpenEditDialog('interests', profileData.interests);
                    }}
                  >
                    Edit
                  </Button>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {profileData.interests && profileData.interests.length > 0 ? (
                    profileData.interests.map((interest, index) => (
                      <Chip
                        key={index}
                        label={interest}
                        variant="outlined"
                        sx={{ m: 0.5 }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No interests added yet
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          )}
          
          {/* Verification Status Card - For Organizations */}
          {user?.userType === 'organization' && (
            <Card sx={{ mb: 3, borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Verification Status
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  p: 2,
                  bgcolor: 'background.default',
                  borderRadius: 2
                }}>
                  {profileData.organizationDetails?.verificationStatus === 'verified' ? (
                    <>
                      <CheckCircleIcon color="success" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          Verified Organization
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Your organization has been verified
                        </Typography>
                      </Box>
                    </>
                  ) : profileData.organizationDetails?.verificationStatus === 'pending' ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          Verification Pending
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Your verification request is being reviewed
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    <>
                      <VerifiedIcon color="action" sx={{ mr: 2 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          Not Verified
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Verify your organization to build trust
                        </Typography>
                      </Box>
                      <Button 
                        variant="contained" 
                        size="small"
                        onClick={() => navigate('/verification')}
                      >
                        Verify
                      </Button>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          )}
          
          {/* Logout Button */}
          <Button
            variant="outlined"
            color="error"
            fullWidth
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ mt: 2, mb: 1 }}
          >
            Logout
          </Button>
        </>
      )}
      
      {/* Settings Tab */}
      {activeTab === 1 && (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>
              App Settings
            </Typography>
            
            <List>
              <ListItem button>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Settings" 
                  secondary="App preferences"
                />
              </ListItem>
              
              <ListItem button onClick={() => navigate('/notifications/settings')}>
                <ListItemIcon>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Notification Settings" 
                  secondary="Manage notification preferences"
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Push Notifications" 
                  secondary="Receive alerts about events"
                />
                <Switch
                  edge="end"
                  checked={profileData.settings?.notifications || false}
                  onChange={handleToggleNotifications}
                />
              </ListItem>
              
              <Divider component="li" />
              
              <ListItem button onClick={() => handleOpenEditDialog('password')}>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Change Password" 
                  secondary="Update your account password"
                />
              </ListItem>
              
              <Divider component="li" />
              
              <ListItem button onClick={() => navigate('/help')}>
                <ListItemIcon>
                  <HelpIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Help & Support" 
                  secondary="FAQs, contact support"
                />
              </ListItem>
              
              <Divider component="li" />
              
              <ListItem button onClick={() => navigate('/terms')}>
                <ListItemIcon>
                  <HelpIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Terms & Privacy" 
                  secondary="Legal information"
                />
              </ListItem>
            </List>
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              align="center" 
              sx={{ mt: 3 }}
            >
              SEEKUP v1.0.0
            </Typography>
          </CardContent>
        </Card>
      )}
      
      {/* Edit Dialog */}
      <Dialog 
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editField === 'password' 
            ? 'Change Password' 
            : editField === 'interests'
              ? 'Edit Interests'
              : `Edit ${editField?.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim() || ''}`}
        </DialogTitle>
        <DialogContent>
          {editField === 'password' ? (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Current Password"
                type="password"
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="New Password"
                type="password"
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Confirm New Password"
                type="password"
                fullWidth
                variant="outlined"
              />
            </>
          ) : editField === 'interests' ? (
            <Autocomplete
              multiple
              options={INTERESTS_LIST}
              value={tempInterests}
              onChange={(event, newValue) => {
                setTempInterests(newValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Select interests"
                  placeholder="Add interests"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                  />
                ))
              }
              sx={{ mt: 1 }}
            />
          ) : editField === 'bio' || editField === 'organizationDetails.description' ? (
            <TextField
              autoFocus
              margin="dense"
              label={editField === 'bio' ? 'Bio' : 'About Organization'}
              type="text"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
            />
          ) : (
            <TextField
              autoFocus
              margin="dense"
              label={editField?.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim() || ''}
              type={editField === 'email' ? 'email' : 'text'}
              fullWidth
              variant="outlined"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={editField === 'interests' ? handleSaveInterests : handleSaveChanges} 
            variant="contained"
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Profile;
