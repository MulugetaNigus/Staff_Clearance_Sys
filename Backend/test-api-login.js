const axios = require('axios');

const testApiLogin = async () => {
  try {
    console.log('🧪 Testing login API endpoint...');
    
    const loginData = {
      username: 'admin@woldia.edu.et', // Note: the controller expects 'username' field
      password: 'admin123'
    };
    
    console.log('📤 Sending login request to: http://localhost:5000/api/auth/login');
    console.log('📋 Login data:', loginData);
    
    const response = await axios.post('http://localhost:5000/api/auth/login', loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n✅ Login successful!');
    console.log('📊 Response status:', response.status);
    console.log('📋 Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('\n❌ Login failed!');
    
    if (error.response) {
      console.log('📊 Status:', error.response.status);
      console.log('📋 Error data:', JSON.stringify(error.response.data, null, 2));
      console.log('🔍 Headers:', error.response.headers);
    } else if (error.request) {
      console.log('📡 No response received from server');
      console.log('🔍 Request:', error.request);
    } else {
      console.log('⚙️ Request setup error:', error.message);
    }
  }
};

// Also test if server is running
const testServerHealth = async () => {
  try {
    console.log('🩺 Testing server health...');
    const response = await axios.get('http://localhost:5000/health');
    console.log('✅ Server is running!');
    console.log('📋 Health data:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log('❌ Server is not responding');
    console.log('💡 Make sure your server is running: npm start or node server.js');
    return false;
  }
};

const runTests = async () => {
  const serverRunning = await testServerHealth();
  
  if (serverRunning) {
    console.log('\n' + '='.repeat(50));
    await testApiLogin();
  }
};

runTests();
