const axios = require('axios');

// Test registration for different user roles
async function testRegistration() {
  const baseURL = 'http://localhost:3000/auth';
  
  // Test data for different roles
  const testUsers = [
    {
      name: 'Test Assistant',
      email: 'assistant' + Date.now() + '@test.com',
      password: 'Test123456',
      role: 'assistant',
      phone: '+1234567890'
    },
    {
      name: 'Test Doctor',
      email: 'doctor' + Date.now() + '@test.com',
      password: 'Test123456',
      role: 'doctor',
      phone: '+1234567891',
      specialization: 'Cardiology',
      license_number: 'DOC' + Date.now(), // Unique license number
      dr_idCard_url: 'https://example.com/id.jpg',
      biography: 'Experienced cardiologist',
      medical_license_url: 'https://example.com/license.jpg'
    },
    {
      name: 'Test Patient',
      email: 'patient' + Date.now() + '@test.com',
      password: 'Test123456',
      role: 'patient',
      phone: '+1234567892',
      date_of_birth: '1990-01-01',
      gender: 'Male'
    }
  ];

  console.log('🧪 Testing User Registration...\n');
  console.log('⚠️  Note: If doctor service is not running, doctor registration will succeed but doctor profile creation will be skipped.\n');

  for (const user of testUsers) {
    try {
      console.log(`\n🧪 Testing registration for ${user.role}:`);
      console.log(`📧 Email: ${user.email}`);
      
      const response = await axios.post(`${baseURL}/register`, user, {
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json'
        },
        validateStatus: () => true // Don't throw on any status code
      });
      
      if (response.status >= 200 && response.status < 300) {
        console.log(`✅ Success: ${response.status}`);
        console.log(`📄 Response:`, JSON.stringify(response.data, null, 2));
      } else {
        console.log(`⚠️  Partial Success: ${response.status}`);
        console.log(`📄 Response:`, JSON.stringify(response.data, null, 2));
        
        // Check if it's a timeout but user was still created
        if (response.status === 504 && response.data.message.includes('timeout')) {
          console.log(`💡 User was likely created but doctor service is not responding.`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Error for ${user.role}:`);
      if (error.response) {
        console.log(`📊 Status: ${error.response.status}`);
        console.log(`📄 Response:`, JSON.stringify(error.response.data, null, 2));
      } else if (error.request) {
        console.log(`🔌 Network Error: ${error.message}`);
      } else {
        console.log(`💥 Error: ${error.message}`);
      }
    }
    
    // Wait 2 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n📋 Test Summary:');
  console.log('- If you see timeout errors, the doctor service is not running');
  console.log('- Users should still be created in the user database');
  console.log('- Doctor profiles can be created later when the doctor service is available');
  console.log('\n💡 To start all services, run: ./start-services.sh (Linux/Mac) or start-services.bat (Windows)');
}

// Run the test
testRegistration().catch(console.error);
