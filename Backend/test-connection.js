const { connectToDatabase, testConnection } = require('./config/database');
require('dotenv').config();

console.log('🧪 MongoDB Connection Test Tool');
console.log('================================\n');

async function runDiagnostics() {
  console.log('📋 Environment Check:');
  console.log(`   Node.js Version: ${process.version}`);
  console.log(`   Platform: ${process.platform}`);
  console.log(`   Architecture: ${process.arch}`);
  console.log(`   Current Working Directory: ${process.cwd()}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  
  console.log('\n📊 Environment Variables:');
  console.log(`   PORT: ${process.env.PORT || 'Not set'}`);
  console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? 'Set' : 'Not set'}`);
  console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? 'Set' : 'Not set'}`);
  
  if (process.env.MONGODB_URI) {
    console.log(`   URI Preview: ${process.env.MONGODB_URI.substring(0, 50)}...`);
  }
  
  console.log('\n🔍 Network Connectivity Tests:');
  
  // Test DNS resolution
  try {
    const dns = require('dns').promises;
    console.log('   Testing DNS resolution for cluster0.1p47xzw.mongodb.net...');
    const addresses = await dns.lookup('cluster0.1p47xzw.mongodb.net');
    console.log(`   ✅ DNS resolved to: ${addresses.address}`);
  } catch (error) {
    console.log(`   ❌ DNS resolution failed: ${error.message}`);
    console.log('   💡 This is likely the root cause of your connection issue!');
  }
  
  // Test internet connectivity
  try {
    const https = require('https');
    console.log('   Testing internet connectivity to google.com...');
    await new Promise((resolve, reject) => {
      const req = https.get('https://google.com', (res) => {
        console.log('   ✅ Internet connection working');
        resolve();
      });
      req.on('error', reject);
      req.setTimeout(5000, () => reject(new Error('Timeout')));
    });
  } catch (error) {
    console.log(`   ❌ Internet connectivity issue: ${error.message}`);
  }
  
  console.log('\n🔗 MongoDB Connection Test:');
  try {
    const success = await testConnection();
    if (success) {
      console.log('   ✅ MongoDB connection test PASSED!');
    } else {
      console.log('   ❌ MongoDB connection test FAILED!');
    }
  } catch (error) {
    console.log(`   ❌ MongoDB connection test ERROR: ${error.message}`);
  }
  
  console.log('\n📝 Recommendations:');
  console.log('   1. If DNS resolution failed, run fix-dns.bat as administrator');
  console.log('   2. Try connecting from a mobile hotspot');
  console.log('   3. Check MongoDB Atlas dashboard - ensure cluster is running');
  console.log('   4. Verify your IP is whitelisted (use 0.0.0.0/0 for testing)');
  console.log('   5. Check Windows Firewall and antivirus settings');
  
  process.exit(0);
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

runDiagnostics();
