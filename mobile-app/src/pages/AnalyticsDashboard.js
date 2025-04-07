import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Divider,
  Button,
  IconButton,
  Alert
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Event as EventIcon,
  AccessTime as TimeIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title } from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title);

// Stat Card Component
const StatCard = ({ title, value, icon, change, color = 'primary.main' }) => (
  <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h6" color="text.secondary">{title}</Typography>
          <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>{value}</Typography>
          {change && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: change >= 0 ? 'success.main' : 'error.main',
                display: 'flex',
                alignItems: 'center',
                mt: 1
              }}
            >
              {change > 0 ? '+' : ''}{change}% from last period
            </Typography>
          )}
        </Box>
        <Box sx={{ p: 1, bgcolor: `${color}20`, borderRadius: 2 }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

function AnalyticsDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [timeRange, setTimeRange] = useState('month');
  const [activeTab, setActiveTab] = useState(0);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Charts data state
  const [attendanceData, setAttendanceData] = useState(null);
  const [demographicsData, setDemographicsData] = useState(null);
  const [engagementData, setEngagementData] = useState(null);
  
  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        
        // Development mode check
        const isDevelopmentMode = true; // TEMPORARY: Set to true for testing
        
        if (isDevelopmentMode) {
          // Mock data for development testing
          setAnalyticsData(mockAnalyticsData);
          prepareChartData(mockAnalyticsData);
          setLoading(false);
          return;
        }
        
        // Production code - real API call
        const response = await axios.get(`/api/analytics?timeRange=${timeRange}`);
        setAnalyticsData(response.data);
        prepareChartData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [timeRange]);
  
  // Prepare data for charts
  const prepareChartData = (data) => {
    // Attendance chart data
    setAttendanceData({
      labels: data.events.map(event => event.name),
      datasets: [
        {
          label: 'Registered',
          data: data.events.map(event => event.registered),
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
        {
          label: 'Attended',
          data: data.events.map(event => event.attended),
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1,
        },
      ],
    });
    
    // Demographics chart data
    setDemographicsData({
      labels: ['18-24', '25-34', '35-44', '45-54', '55+'],
      datasets: [
        {
          label: 'Age Distribution',
          data: data.demographics.age,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    });
    
    // Engagement data for line chart
    setEngagementData({
      labels: data.engagement.dates,
      datasets: [
        {
          label: 'Event Registrations',
          data: data.engagement.registrations,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.1
        },
        {
          label: 'Volunteer Hours',
          data: data.engagement.hours,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          tension: 0.1
        }
      ]
    });
  };
  
  // Generate and download report
  const handleDownloadReport = () => {
    // In a real app, this would generate a PDF or CSV report
    alert('Report download feature would be implemented here');
  };
  
  return (
    <Box className="page-content">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton edge="start" onClick={() => navigate(-1)}>
            <BackIcon />
          </IconButton>
          <Typography variant="h5" component="h1" sx={{ ml: 1 }}>
            Analytics Dashboard
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControl variant="outlined" size="small" sx={{ width: 150, mr: 2 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
            >
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
              <MenuItem value="quarter">Last Quarter</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
            </Select>
          </FormControl>
          
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />} 
            onClick={handleDownloadReport}
          >
            Export
          </Button>
        </Box>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      ) : (
        <>
          {/* Key metrics */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Total Volunteers" 
                value={analyticsData.volunteers.total}
                change={analyticsData.volunteers.change}
                icon={<PeopleIcon sx={{ color: 'primary.main' }} />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Events Created" 
                value={analyticsData.eventsTotal}
                change={analyticsData.eventsChange}
                icon={<EventIcon sx={{ color: 'secondary.main' }} />}
                color="secondary.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Volunteer Hours" 
                value={analyticsData.volunteerHours.total}
                change={analyticsData.volunteerHours.change}
                icon={<TimeIcon sx={{ color: 'success.main' }} />}
                color="success.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Impact Score" 
                value={analyticsData.impactScore}
                change={analyticsData.impactScoreChange}
                icon={<TrendingUpIcon sx={{ color: 'info.main' }} />}
                color="info.main"
              />
            </Grid>
          </Grid>
          
          {/* Tabs for different charts */}
          <Box sx={{ mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Event Attendance" />
              <Tab label="Demographics" />
              <Tab label="Engagement Trends" />
              <Tab label="Volunteer Retention" />
            </Tabs>
          </Box>
          
          <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            {activeTab === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>Event Attendance</Typography>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ height: 400 }}>
                  {attendanceData && <Bar 
                    data={attendanceData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        title: {
                          display: true,
                          text: 'Registration vs Actual Attendance'
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }} 
                  />}
                </Box>
              </Box>
            )}
            
            {activeTab === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>Volunteer Demographics</Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ height: 300 }}>
                      <Typography variant="subtitle1" align="center" gutterBottom>Age Distribution</Typography>
                      {demographicsData && <Pie 
                        data={demographicsData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                        }} 
                      />}
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>Top Skills</Typography>
                      {analyticsData.demographics.skills.map((skill, index) => (
                        <Box key={index} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">{skill.name}</Typography>
                            <Typography variant="body2">{skill.count} volunteers</Typography>
                          </Box>
                          <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 5, height: 8 }}>
                            <Box 
                              sx={{ 
                                width: `${(skill.count / analyticsData.volunteers.total) * 100}%`, 
                                bgcolor: 'primary.main', 
                                borderRadius: 5, 
                                height: 8 
                              }} 
                            />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {activeTab === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>Engagement Trends</Typography>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ height: 400 }}>
                  {engagementData && <Line 
                    data={engagementData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        title: {
                          display: true,
                          text: 'Volunteer Engagement Over Time'
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }} 
                  />}
                </Box>
              </Box>
            )}
            
            {activeTab === 3 && (
              <Box>
                <Typography variant="h6" gutterBottom>Volunteer Retention</Typography>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ height: 400, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ mb: 2 }}>Retention Rate: {analyticsData.retention.rate}%</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {analyticsData.retention.returning} volunteers returned for multiple events
                  </Typography>
                  
                  {/* Retention chart would go here */}
                  <Typography variant="body2">
                    Detailed retention analytics with cohort analysis would be implemented here
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
          
          {/* Upcoming events section */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>Upcoming Events</Typography>
            <Grid container spacing={2}>
              {analyticsData.upcomingEvents.map((event, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6">{event.name}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(event.date).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Typography variant="body2">
                          Registered: {event.registered}/{event.capacity}
                        </Typography>
                        <Button size="small" onClick={() => navigate(`/events/${event.id}`)}>
                          Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </>
      )}
    </Box>
  );
}

// Mock data for development testing
const mockAnalyticsData = {
  volunteers: {
    total: 248,
    change: 12.5,
    new: 35
  },
  eventsTotal: 15,
  eventsChange: 8.3,
  volunteerHours: {
    total: 842,
    change: 15.7
  },
  impactScore: 87,
  impactScoreChange: 5.2,
  events: [
    { name: 'Park Cleanup', registered: 45, attended: 38 },
    { name: 'Food Drive', registered: 32, attended: 30 },
    { name: 'Literacy Program', registered: 28, attended: 25 },
    { name: 'Health Fair', registered: 50, attended: 42 },
    { name: 'Animal Shelter', registered: 25, attended: 22 }
  ],
  demographics: {
    age: [78, 92, 45, 22, 11],
    skills: [
      { name: 'Communication', count: 185 },
      { name: 'Organization', count: 162 },
      { name: 'Teaching', count: 124 },
      { name: 'Technical', count: 98 },
      { name: 'Medical', count: 45 }
    ]
  },
  engagement: {
    dates: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    registrations: [65, 78, 82, 95, 112, 125],
    hours: [185, 202, 243, 275, 310, 345]
  },
  retention: {
    rate: 76,
    returning: 189
  },
  upcomingEvents: [
    { id: '1', name: 'Community Park Cleanup', date: '2025-04-15', registered: 25, capacity: 40 },
    { id: '2', name: 'Food Drive Distribution', date: '2025-04-22', registered: 18, capacity: 30 },
    { id: '3', name: 'Literacy Program for Kids', date: '2025-04-18', registered: 12, capacity: 20 }
  ]
};

export default AnalyticsDashboard;
