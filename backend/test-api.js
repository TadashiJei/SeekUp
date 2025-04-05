const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Test user data
const testVolunteer = {
  name: 'Test Volunteer',
  email: 'volunteer@test.com',
  password: 'password123',
  userType: 'volunteer'
};

const testOrganization = {
  name: 'Test Organization',
  email: 'org@test.com',
  password: 'password123',
  userType: 'organization'
};

// Test event data
const testEvent = {
  title: 'Beach Cleanup',
  description: 'Help clean up local beaches and protect marine life',
  startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours duration
  location: {
    address: '123 Beach Dr',
    city: 'Coastal City',
    state: 'CA',
    zipCode: '90210',
    country: 'United States'
  },
  category: 'environment',
  requiredSkills: ['Physical activity', 'Environmental awareness'],
  maxVolunteers: 20,
  duration: 3
};

// Authentication tokens
let volunteerToken = null;
let organizationToken = null;
let createdEventId = null;

async function testRootEndpoint() {
  console.log('\n--- Testing Root Endpoint ---');
  try {
    const response = await axios.get('http://localhost:3000/');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    console.error('Error testing root endpoint:', error.message);
    return false;
  }
}

async function testRegisterUser(userData) {
  console.log(`\n--- Testing Register User (${userData.userType}) ---`);
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
    console.log('Registration successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    return null;
  }
}

async function testLogin(email, password) {
  console.log(`\n--- Testing Login (${email}) ---`);
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
    console.log('Login successful, received token');
    return response.data.token;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    return null;
  }
}

async function testGetProfile(token, userType) {
  console.log(`\n--- Testing Get Profile (${userType}) ---`);
  try {
    const response = await axios.get(`${API_BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`${userType} profile retrieved successfully:`, response.data.name);
    return response.data;
  } catch (error) {
    console.error('Get profile error:', error.response?.data || error.message);
    return null;
  }
}

async function testCreateEvent(token, eventData) {
  console.log('\n--- Testing Create Event ---');
  try {
    const response = await axios.post(`${API_BASE_URL}/events`, eventData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Event created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Create event error:', error.response?.data || error.message);
    return null;
  }
}

async function testGetEvents() {
  console.log('\n--- Testing Get Events ---');
  try {
    const response = await axios.get(`${API_BASE_URL}/events`);
    console.log(`Retrieved ${response.data.length} events`);
    return response.data;
  } catch (error) {
    console.error('Get events error:', error.response?.data || error.message);
    return null;
  }
}

async function testGetEventById(eventId) {
  console.log(`\n--- Testing Get Event by ID (${eventId}) ---`);
  try {
    const response = await axios.get(`${API_BASE_URL}/events/${eventId}`);
    console.log('Event details retrieved successfully:', response.data.title);
    return response.data;
  } catch (error) {
    console.error('Get event error:', error.response?.data || error.message);
    return null;
  }
}

async function testRegisterForEvent(token, eventId) {
  console.log(`\n--- Testing Register for Event (${eventId}) ---`);
  try {
    const response = await axios.post(`${API_BASE_URL}/events/${eventId}/register`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Event registration successful');
    return true;
  } catch (error) {
    console.error('Event registration error:', error.response?.data || error.message);
    return false;
  }
}

// Main test flow
async function runTests() {
  console.log('=== Starting SEEKUP API Tests ===');
  
  // Test root endpoint
  await testRootEndpoint();
  
  // Register users
  await testRegisterUser(testVolunteer);
  await testRegisterUser(testOrganization);
  
  // Login and get tokens
  volunteerToken = await testLogin(testVolunteer.email, testVolunteer.password);
  organizationToken = await testLogin(testOrganization.email, testOrganization.password);
  
  if (!volunteerToken || !organizationToken) {
    console.error('Failed to get authentication tokens. Aborting tests.');
    return;
  }
  
  // Test user profiles
  await testGetProfile(volunteerToken, 'volunteer');
  await testGetProfile(organizationToken, 'organization');
  
  // Test event creation (as organization)
  const event = await testCreateEvent(organizationToken, testEvent);
  if (event && event._id) {
    createdEventId = event._id;
    
    // Test getting all events
    await testGetEvents();
    
    // Test getting event by ID
    await testGetEventById(createdEventId);
    
    // Test registering for an event (as volunteer)
    await testRegisterForEvent(volunteerToken, createdEventId);
  }
  
  console.log('\n=== API Tests Completed ===');
}

// Run the tests
runTests().catch(error => {
  console.error('Test execution failed:', error);
});
