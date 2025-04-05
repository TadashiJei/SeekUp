const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Test user data
const testOrganization = {
  name: 'Test Organization',
  email: 'testorg@example.com',
  password: 'password123',
  userType: 'organization'
};

const testVolunteer = {
  name: 'Test Volunteer',
  email: 'testvolunteer@example.com',
  password: 'password123',
  userType: 'volunteer'
};

// Test authentication tokens
let orgToken = null;
let volunteerToken = null;

// Test event data
const testEvent = {
  title: 'Community Garden Cleanup',
  description: 'Help us clean up and prepare the community garden for spring planting!',
  startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
  endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hour duration
  location: {
    address: '123 Main St',
    city: 'Springfield',
    state: 'IL',
    country: 'United States'
  },
  category: 'environment',
  requiredSkills: ['Gardening', 'Physical labor'],
  maxVolunteers: 10,
  duration: 3
};

let createdEventId = null;

// Utility to log progress
function logStep(message) {
  console.log('\n' + '='.repeat(80));
  console.log(`🔶 ${message}`);
  console.log('='.repeat(80) + '\n');
}

// Register user and get token
async function registerUser(userData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
    console.log(`✅ ${userData.userType} registered successfully: ${userData.email}`);
    return response.data.token;
  } catch (error) {
    if (error.response && error.response.data.message === 'User already exists') {
      console.log(`👤 ${userData.userType} already exists, trying login instead`);
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: userData.email,
        password: userData.password
      });
      console.log(`✅ ${userData.userType} logged in successfully`);
      return loginResponse.data.token;
    }
    console.error(`❌ Error registering/logging in ${userData.userType}:`, error.message);
    throw error;
  }
}

// Create a test event
async function createTestEvent(token) {
  try {
    const response = await axios.post(`${API_BASE_URL}/events`, testEvent, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Test event created: ${response.data.event.title}`);
    return response.data.event._id;
  } catch (error) {
    console.error('❌ Error creating test event:', error.message);
    throw error;
  }
}

// Register volunteer for event
async function registerForEvent(token, eventId) {
  try {
    const response = await axios.post(`${API_BASE_URL}/events/${eventId}/register`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Volunteer registered for event successfully`);
    return true;
  } catch (error) {
    console.error('❌ Error registering for event:', error.message);
    throw error;
  }
}

// Test analytics endpoints
async function testOrganizationAnalytics(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/analytics/organization`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Organization analytics retrieved successfully`);
    console.log('📊 Analytics results:');
    console.log(JSON.stringify(response.data.analytics, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Error getting organization analytics:', error.message);
    throw error;
  }
}

async function testEventVolunteerMetrics(token, eventId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/analytics/events/${eventId}/volunteers`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Event volunteer metrics retrieved successfully`);
    console.log('📊 Volunteer metrics:');
    console.log(JSON.stringify(response.data.metrics, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Error getting event volunteer metrics:', error.message);
    throw error;
  }
}

async function testVolunteerImpact(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/analytics/volunteer/impact`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Volunteer impact report retrieved successfully`);
    console.log('📊 Impact report:');
    console.log(JSON.stringify(response.data.impact, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Error getting volunteer impact report:', error.message);
    throw error;
  }
}

// Test notification endpoints
async function testSaveSubscription(token) {
  try {
    // Mock push subscription
    const subscription = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint',
      expirationTime: null,
      keys: {
        p256dh: 'test-p256dh-key',
        auth: 'test-auth-key'
      }
    };
    
    const response = await axios.post(`${API_BASE_URL}/notifications/subscribe`, { subscription }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Push subscription saved successfully`);
    return true;
  } catch (error) {
    console.error('❌ Error saving push subscription:', error.message);
    throw error;
  }
}

async function testGetNotifications(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ User notifications retrieved successfully`);
    console.log('📬 Notifications:');
    console.log(JSON.stringify(response.data.notifications, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Error getting user notifications:', error.message);
    throw error;
  }
}

async function testSendEventNotification(token, eventId) {
  try {
    const notificationData = {
      title: 'Important Event Update',
      body: 'There has been a slight change to the event schedule. Please check the details.'
    };
    
    const response = await axios.post(`${API_BASE_URL}/notifications/events/${eventId}`, notificationData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Event notification sent successfully`);
    console.log(response.data.message);
    return true;
  } catch (error) {
    console.error('❌ Error sending event notification:', error.message);
    throw error;
  }
}

// Main test flow
async function runTests() {
  try {
    logStep('Starting tests for newly implemented features');
    
    // 1. Register/Login test users
    logStep('Testing user authentication');
    orgToken = await registerUser(testOrganization);
    volunteerToken = await registerUser(testVolunteer);
    
    // 2. Create test event
    logStep('Creating test event');
    createdEventId = await createTestEvent(orgToken);
    
    // 3. Register volunteer for event
    logStep('Registering volunteer for event');
    await registerForEvent(volunteerToken, createdEventId);
    
    // 4. Test analytics endpoints
    logStep('Testing analytics endpoints');
    await testOrganizationAnalytics(orgToken);
    await testEventVolunteerMetrics(orgToken, createdEventId);
    await testVolunteerImpact(volunteerToken);
    
    // 5. Test notification endpoints
    logStep('Testing notification endpoints');
    await testSaveSubscription(volunteerToken);
    await testGetNotifications(volunteerToken);
    await testSendEventNotification(orgToken, createdEventId);
    
    logStep('All tests completed successfully! ✨');
  } catch (error) {
    console.error('❌ Test execution failed:', error);
  }
}

// Run all tests
runTests();
