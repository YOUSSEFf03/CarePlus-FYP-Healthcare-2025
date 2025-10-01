// Simple test script to verify availability API is working
const axios = require('axios');

const API_BASE = 'http://localhost:3000';

async function testAvailabilityAPI() {
  try {
    console.log('=== TESTING AVAILABILITY API ===');
    
    // Test 1: Health check
    console.log('\n1. Testing health check...');
    try {
      const healthResponse = await axios.get(`${API_BASE}/health`);
      console.log('✅ Health check passed:', healthResponse.status);
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
    }
    
    // Test 2: Test simple endpoint
    console.log('\n2. Testing simple endpoint...');
    try {
      const simpleResponse = await axios.get(`${API_BASE}/doctors/test-simple`);
      console.log('✅ Simple endpoint passed:', simpleResponse.data);
    } catch (error) {
      console.log('❌ Simple endpoint failed:', error.message);
    }
    
    // Test 3: Test appointment slots endpoint (without auth)
    console.log('\n3. Testing appointment slots endpoint...');
    try {
      const slotsResponse = await axios.get(`${API_BASE}/doctors/workplaces/test-workplace-id/appointment-slots`);
      console.log('✅ Appointment slots endpoint accessible:', slotsResponse.status);
    } catch (error) {
      console.log('❌ Appointment slots endpoint failed:', error.response?.status, error.response?.data);
    }
    
    console.log('\n=== TEST COMPLETE ===');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAvailabilityAPI();
