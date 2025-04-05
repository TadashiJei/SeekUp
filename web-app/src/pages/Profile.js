import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  TextField, 
  Button, 
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Stack,
  Tabs,
  Tab
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Event as EventIcon,
  EmojiEvents as BadgeIcon,
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function Profile() {
  const { user, fetchUserProfile } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [eventHistory, setEventHistory] = useState([]);
  const [badges, setBadges] = useState([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  // State for managing skills and interests
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  
  // Load user profile data
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get user profile from backend
        const profileRes = await axios.get('/api/users/profile');
        setProfileData(profileRes.data.user);
        
        // For volunteer users, get additional data
        if (user.userType === 'volunteer') {
          // Get volunteer passport (event history and badges)
          const passportRes = await axios.get('/api/users/volunteer-passport');
          
          setEventHistory(passportRes.data.passport.events || []);
          setBadges(passportRes.data.passport.badges || []);
        }
        
        // For organization users, get their events
        if (user.userType === 'organization') {
          const eventsRes = await axios.get('/api/organizations/events');
          setEventHistory(eventsRes.data.events || []);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load profile data. Please try again.');
        setLoading(false);
        console.error('Profile data load error:', err);
      }
    };
    
    if (user) {
      loadProfileData();
    }
  }, [user]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle profile edit form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested objects (like organizationDetails or location)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfileData({
        ...profileData,
        [parent]: {
          ...profileData[parent],
          [child]: value
        }
      });
    } else {
      setProfileData({
        ...profileData,
        [name]: value
      });
    }
  };
  
  // Handle adding a skill
  const handleAddSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };
  
  // Handle removing a skill
  const handleRemoveSkill = (skillToRemove) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter(skill => skill !== skillToRemove)
    });
  };
  
  // Handle adding an interest
  const handleAddInterest = () => {
    if (newInterest.trim() && !profileData.interests.includes(newInterest.trim())) {
      setProfileData({
        ...profileData,
        interests: [...profileData.interests, newInterest.trim()]
      });
      setNewInterest('');
    }
  };
  
  // Handle removing an interest
  const handleRemoveInterest = (interestToRemove) => {
    setProfileData({
      ...profileData,
      interests: profileData.interests.filter(interest => interest !== interestToRemove)
    });
  };
  
  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      // Prepare data to send to API
      const updateData = { ...profileData };
      
      // Remove fields that shouldn't be updated
      delete updateData._id;
      delete updateData.email;
      delete updateData.userType;
      delete updateData.createdAt;
      delete updateData.updatedAt;
      
      // For organizations, use the organization-specific endpoint
      if (user.userType === 'organization') {
        await axios.put('/api/organizations/profile', updateData);
      } else {
        // For volunteers and admins
        await axios.put('/api/users/profile', updateData);
      }
      
      // Update auth context with new profile data
      await fetchUserProfile();
      
      setSuccess('Profile updated successfully!');
      setEditing(false);
      setSaving(false);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      setSaving(false);
      console.error('Profile update error:', err);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!profileData) {
    return (
      <Box sx={{ mt: 3 }}>
        <Alert severity="error">Failed to load profile data. Please try again later.</Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ py: 3 }}>
      {/* Profile Header */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Profile
          </Typography>
          <Button 
            variant={editing ? "contained" : "outlined"}
            startIcon={editing ? <SaveIcon /> : <EditIcon />}
            onClick={editing ? handleSaveProfile : () => setEditing(true)}
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : (editing ? "Save Changes" : "Edit Profile")}
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                sx={{ width: 120, height: 120, mb: 2, fontSize: '3rem' }}
              >
                {profileData.name ? profileData.name.charAt(0) : 'U'}
              </Avatar>
              
              <Typography variant="h5" gutterBottom>
                {profileData.name}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {profileData.email}
              </Typography>
              
              <Chip 
                label={profileData.userType === 'volunteer' ? 'Volunteer' : 
                       profileData.userType === 'organization' ? 'Organization' : 'Admin'}
                color="primary"
                sx={{ textTransform: 'capitalize', mt: 1 }}
              />
              
              {profileData.userType === 'volunteer' && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Level {profileData.level || 1}
                  </Typography>
                  <Typography variant="h6">
                    {profileData.points || 0} Points
                  </Typography>
                </Box>
              )}
              
              {profileData.userType === 'organization' && 
               profileData.organizationDetails?.verificationStatus && (
                <Box sx={{ mt: 2 }}>
                  <Chip 
                    label={`${profileData.organizationDetails.verificationStatus.replace('-', ' ')}`}
                    color={profileData.organizationDetails.verificationStatus === 'verified' ? 'success' : 
                           profileData.organizationDetails.verificationStatus === 'pending' ? 'warning' : 'error'}
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Box>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={profileData.name || ''}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  value={profileData.email || ''}
                  disabled={true}
                  helperText="Email cannot be changed"
                />
              </Grid>
              
              {/* Volunteer specific fields */}
              {profileData.userType === 'volunteer' && (
                <>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="City"
                      name="location.city"
                      value={profileData.location?.city || ''}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="State/Province"
                      name="location.state"
                      value={profileData.location?.state || ''}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Country"
                      name="location.country"
                      value={profileData.location?.country || ''}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </Grid>
                  
                  {editing && (
                    <>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>
                          Skills
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ mb: 2 }}>
                          {profileData.skills && profileData.skills.map((skill) => (
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
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>
                          Interests
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" spacing={1} sx={{ mb: 2 }}>
                          {profileData.interests && profileData.interests.map((interest) => (
                            <Chip
                              key={interest}
                              label={interest}
                              onDelete={() => handleRemoveInterest(interest)}
                              sx={{ m: 0.5 }}
                            />
                          ))}
                        </Stack>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <TextField
                            label="Add an interest"
                            value={newInterest}
                            onChange={(e) => setNewInterest(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddInterest();
                              }
                            }}
                            sx={{ flexGrow: 1 }}
                          />
                          <Button
                            startIcon={<AddIcon />}
                            variant="outlined"
                            onClick={handleAddInterest}
                          >
                            Add
                          </Button>
                        </Box>
                      </Grid>
                    </>
                  )}
                  
                  {!editing && (
                    <>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>
                          Skills
                        </Typography>
                        <Box>
                          {profileData.skills && profileData.skills.length > 0 ? (
                            <Stack direction="row" flexWrap="wrap" spacing={1}>
                              {profileData.skills.map((skill) => (
                                <Chip
                                  key={skill}
                                  label={skill}
                                  sx={{ m: 0.5 }}
                                  variant="outlined"
                                />
                              ))}
                            </Stack>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No skills added yet.
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>
                          Interests
                        </Typography>
                        <Box>
                          {profileData.interests && profileData.interests.length > 0 ? (
                            <Stack direction="row" flexWrap="wrap" spacing={1}>
                              {profileData.interests.map((interest) => (
                                <Chip
                                  key={interest}
                                  label={interest}
                                  sx={{ m: 0.5 }}
                                  variant="outlined"
                                />
                              ))}
                            </Stack>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No interests added yet.
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    </>
                  )}
                </>
              )}
              
              {/* Organization specific fields */}
              {profileData.userType === 'organization' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      name="organizationDetails.description"
                      value={profileData.organizationDetails?.description || ''}
                      onChange={handleChange}
                      disabled={!editing}
                      multiline
                      rows={3}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Website"
                      name="organizationDetails.website"
                      value={profileData.organizationDetails?.website || ''}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Logo URL"
                      name="organizationDetails.logo"
                      value={profileData.organizationDetails?.logo || ''}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Contact Email"
                      name="organizationDetails.contactInfo.email"
                      value={profileData.organizationDetails?.contactInfo?.email || ''}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Contact Phone"
                      name="organizationDetails.contactInfo.phone"
                      value={profileData.organizationDetails?.contactInfo?.phone || ''}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      name="organizationDetails.location.address"
                      value={profileData.organizationDetails?.location?.address || ''}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="City"
                      name="organizationDetails.location.city"
                      value={profileData.organizationDetails?.location?.city || ''}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="State/Province"
                      name="organizationDetails.location.state"
                      value={profileData.organizationDetails?.location?.state || ''}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Country"
                      name="organizationDetails.location.country"
                      value={profileData.organizationDetails?.location?.country || ''}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Profile Tabs for Activity/History */}
      <Paper sx={{ borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            {profileData.userType === 'volunteer' && (
              <>
                <Tab label="Event History" />
                <Tab label="Badges & Achievements" />
              </>
            )}
            {profileData.userType === 'organization' && (
              <>
                <Tab label="Events" />
                <Tab label="Verification" />
              </>
            )}
          </Tabs>
        </Box>
        
        {/* Volunteer tabs */}
        {profileData.userType === 'volunteer' && (
          <>
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h5" gutterBottom>
                Event History
              </Typography>
              
              {eventHistory.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    You haven't participated in any events yet.
                  </Typography>
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2 }}
                    onClick={() => window.location.href = '/events'}
                  >
                    Find Events
                  </Button>
                </Box>
              ) : (
                <List>
                  {eventHistory.map((event, index) => (
                    <ListItem 
                      key={index}
                      divider={index < eventHistory.length - 1}
                      sx={{ py: 2 }}
                    >
                      <ListItemIcon>
                        <EventIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={event.title}
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              {formatDate(event.startDate)}
                            </Typography>
                            <br />
                            <Typography variant="body2" component="span">
                              {event.location.city}, {event.location.country}
                            </Typography>
                          </>
                        }
                      />
                      <Chip
                        label={event.duration + " hours"}
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h5" gutterBottom>
                Badges & Achievements
              </Typography>
              
              {badges.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    You haven't earned any badges yet. Participate in events to earn badges!
                  </Typography>
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2 }}
                    onClick={() => window.location.href = '/events'}
                  >
                    Find Events
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {badges.map((badge, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card>
                        <CardHeader
                          avatar={
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <BadgeIcon />
                            </Avatar>
                          }
                          title={badge.name}
                          subheader={formatDate(badge.awardedDate)}
                        />
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">
                            {badge.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </TabPanel>
          </>
        )}
        
        {/* Organization tabs */}
        {profileData.userType === 'organization' && (
          <>
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h5" gutterBottom>
                Your Events
              </Typography>
              
              {eventHistory.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    You haven't created any events yet.
                  </Typography>
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2 }}
                    onClick={() => window.location.href = '/events/create'}
                  >
                    Create Event
                  </Button>
                </Box>
              ) : (
                <List>
                  {eventHistory.map((event, index) => (
                    <ListItem 
                      key={index}
                      divider={index < eventHistory.length - 1}
                      sx={{ py: 2 }}
                      button
                      onClick={() => window.location.href = `/events/${event._id}`}
                    >
                      <ListItemIcon>
                        <EventIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={event.title}
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              {formatDate(event.startDate)}
                            </Typography>
                            <br />
                            <Typography variant="body2" component="span">
                              {event.location.city}, {event.location.country}
                            </Typography>
                          </>
                        }
                      />
                      <Chip
                        label={event.attendees?.filter(a => a.status === 'registered' || a.status === 'attended').length || 0}
                        color="primary"
                        size="small"
                        icon={<PersonIcon />}
                        sx={{ mr: 1 }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h5" gutterBottom>
                Organization Verification
              </Typography>
              
              <Box sx={{ maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
                {profileData.organizationDetails?.verificationStatus === 'verified' ? (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    Your organization is verified! This helps volunteers trust your events.
                  </Alert>
                ) : profileData.organizationDetails?.verificationStatus === 'pending' ? (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Your verification is pending review. We'll notify you once it's approved.
                  </Alert>
                ) : (
                  <>
                    <Alert severity="warning" sx={{ mb: 3 }}>
                      Your organization is not verified. Verification helps build trust with volunteers.
                    </Alert>
                    <Button 
                      variant="contained" 
                      onClick={() => window.location.href = '/verification'}
                    >
                      Start Verification Process
                    </Button>
                  </>
                )}
              </Box>
            </TabPanel>
          </>
        )}
      </Paper>
    </Box>
  );
}

export default Profile;
