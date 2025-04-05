const express = require('express');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const User = require('./models/user.model');
const Event = require('./models/event.model');

// This file is a test utility for the SEEKUP API
// It creates sample data and tests API endpoints

async function setupTestData() {
  console.log('Setting up test data...');
  
  try {
    // Create test users
    const volunteerPassword = await bcrypt.hash('volunteer123', 10);
    const organizationPassword = await bcrypt.hash('organization123', 10);
    
    // Create volunteer user
    const volunteer = new User({
      name: 'Test Volunteer',
      email: 'volunteer1@test.com',
      password: volunteerPassword,
      userType: 'volunteer',
      skills: ['Teaching', 'Mentoring', 'Cooking'],
      interests: ['Education', 'Community Development'],
      level: 2,
      points: 120
    });
    await volunteer.save();
    console.log('Created test volunteer user');
    
    // Create organization user
    const organization = new User({
      name: 'Test Organization',
      email: 'organization1@test.com',
      password: organizationPassword,
      userType: 'organization',
      organizationDetails: {
        description: 'A test organization for SEEKUP',
        website: 'https://testorg.example.com',
        verificationStatus: 'verified'
      }
    });
    await organization.save();
    console.log('Created test organization user');
    
    // Create some test events
    const event1 = new Event({
      title: 'Community Garden Cleanup',
      description: 'Help us clean up the community garden and prepare it for spring planting!',
      startDate: new Date(2025, 4, 15, 9, 0), // May 15, 2025, 9:00 AM
      endDate: new Date(2025, 4, 15, 12, 0), // May 15, 2025, 12:00 PM
      location: {
        address: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        country: 'United States'
      },
      category: 'environmental',
      requiredSkills: ['Gardening', 'Physical labor'],
      maxVolunteers: 20,
      organization: organization._id,
      duration: 3
    });
    await event1.save();
    
    const event2 = new Event({
      title: 'Coding Workshop for Kids',
      description: 'Teach basic programming concepts to elementary school students',
      startDate: new Date(2025, 4, 20, 13, 0), // May 20, 2025, 1:00 PM
      endDate: new Date(2025, 4, 20, 16, 0), // May 20, 2025, 4:00 PM
      location: {
        address: '456 Oak St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        country: 'United States'
      },
      category: 'education',
      requiredSkills: ['Teaching', 'Programming'],
      maxVolunteers: 10,
      organization: organization._id,
      duration: 3
    });
    await event2.save();
    
    console.log('Created test events');
    return { volunteer, organization, events: [event1, event2] };
  } catch (error) {
    console.error('Error setting up test data:', error);
    throw error;
  }
}

async function testAuthentication(baseUrl) {
  console.log('\n--- Testing Authentication APIs ---');
  
  try {
    // Test login with volunteer
    console.log('Testing volunteer login...');
    const volunteerLoginResponse = await axios.post(`${baseUrl}/api/auth/login`, {
      email: 'volunteer1@test.com',
      password: 'volunteer123'
    });
    
    const volunteerToken = volunteerLoginResponse.data.token;
    console.log('Volunteer login successful, token received');
    
    // Test login with organization
    console.log('Testing organization login...');
    const organizationLoginResponse = await axios.post(`${baseUrl}/api/auth/login`, {
      email: 'organization1@test.com',
      password: 'organization123'
    });
    
    const organizationToken = organizationLoginResponse.data.token;
    console.log('Organization login successful, token received');
    
    return { volunteerToken, organizationToken };
  } catch (error) {
    console.error('Authentication test failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testEventsAPI(baseUrl, tokens) {
  console.log('\n--- Testing Events APIs ---');
  
  try {
    // Test get all events (no auth required)
    console.log('Testing get all events...');
    const eventsResponse = await axios.get(`${baseUrl}/api/events`);
    console.log(`Retrieved ${eventsResponse.data.length || 0} events`);
    
    // Test get event by ID
    if (eventsResponse.data && eventsResponse.data.length > 0) {
      const eventId = eventsResponse.data[0]._id;
      console.log(`Testing get event by ID: ${eventId}...`);
      const eventDetailResponse = await axios.get(`${baseUrl}/api/events/${eventId}`);
      console.log('Event details retrieved successfully');
    }
    
    // Test create event (organization auth required)
    console.log('Testing create event (as organization)...');
    const newEvent = {
      title: 'Food Drive',
      description: 'Help collect food donations for local food bank',
      startDate: new Date(2025, 5, 10, 10, 0), // June 10, 2025, 10:00 AM
      endDate: new Date(2025, 5, 10, 14, 0), // June 10, 2025, 2:00 PM
      location: {
        address: '789 Pine St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        country: 'United States'
      },
      category: 'community',
      requiredSkills: ['Organization', 'Communication'],
      maxVolunteers: 15,
      duration: 4
    };
    
    const createEventResponse = await axios.post(
      `${baseUrl}/api/events`,
      newEvent,
      {
        headers: {
          Authorization: `Bearer ${tokens.organizationToken}`
        }
      }
    );
    
    const createdEventId = createEventResponse.data._id;
    console.log(`Event created successfully with ID: ${createdEventId}`);
    
    return { createdEventId };
  } catch (error) {
    console.error('Events API test failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testUserAPI(baseUrl, tokens) {
  console.log('\n--- Testing User APIs ---');
  
  try {
    // Test get volunteer profile
    console.log('Testing get volunteer profile...');
    const volunteerProfileResponse = await axios.get(
      `${baseUrl}/api/users/profile`,
      {
        headers: {
          Authorization: `Bearer ${tokens.volunteerToken}`
        }
      }
    );
    console.log('Volunteer profile retrieved successfully');
    
    // Test get organization profile
    console.log('Testing get organization profile...');
    const organizationProfileResponse = await axios.get(
      `${baseUrl}/api/users/profile`,
      {
        headers: {
          Authorization: `Bearer ${tokens.organizationToken}`
        }
      }
    );
    console.log('Organization profile retrieved successfully');
    
    return { 
      volunteerProfile: volunteerProfileResponse.data,
      organizationProfile: organizationProfileResponse.data
    };
  } catch (error) {
    console.error('User API test failed:', error.response?.data || error.message);
    throw error;
  }
}

// Main test function
async function runTests() {
  const port = process.env.PORT || 3000;
  const baseUrl = `http://localhost:${port}`;
  
  console.log(`\n=== Starting SEEKUP API Tests (${baseUrl}) ===\n`);
  
  try {
    // Set up test data
    const testData = await setupTestData();
    
    // Test authentication
    const tokens = await testAuthentication(baseUrl);
    
    // Test events API
    const eventsTestResults = await testEventsAPI(baseUrl, tokens);
    
    // Test user API
    const userTestResults = await testUserAPI(baseUrl, tokens);
    
    console.log('\n=== All tests completed successfully! ===\n');
  } catch (error) {
    console.error('\n=== Test execution failed ===\n', error);
  }
}

// Export the test functions
module.exports = {
  setupTestData,
  testAuthentication,
  testEventsAPI,
  testUserAPI,
  runTests
};

// If this script is run directly, execute the tests
if (require.main === module) {
  // Wait for the server to start
  setTimeout(() => {
    runTests();
  }, 1000);
}
