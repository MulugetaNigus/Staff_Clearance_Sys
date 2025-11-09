const mongoose = require('mongoose');
const User = require('./models/User');

const MONGODB_URI = "mongodb://127.0.0.1:27017/clearance_system";

const testLogin = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully.\n');
    
    // Test multiple users
    const testUsers = [
      { email: 'staff@woldia.edu', password: 'password123', name: 'Academic Staff' },
      { email: 'admin@woldia.edu', password: 'admin123', name: 'System Admin' },
      { email: 'vp@woldia.edu', password: 'vp1234', name: 'Academic VP' },
      { email: 'head.cs@woldia.edu', password: 'head.cs123', name: 'Department Head' },
    ];
    
    for (const test of testUsers) {
      console.log(`\n🧪 Testing: ${test.name} (${test.email})`);
      console.log('─'.repeat(50));
      
      const user = await User.findOne({ email: test.email.toLowerCase() }).select('+password');
      
      if (!user) {
        console.log('❌ User not found');
        continue;
      }
      
      console.log('✅ User found');
      console.log(`   - Name: ${user.name}`);
      console.log(`   - Role: ${user.role}`);
      console.log(`   - Active: ${user.isActive}`);
      console.log(`   - Password hash: ${user.password.substring(0, 20)}...`);
      
      const isPasswordCorrect = await user.comparePassword(test.password);
      console.log(`   - Password match: ${isPasswordCorrect ? '✅ YES' : '❌ NO'}`);
      
      if (isPasswordCorrect && user.isActive) {
        console.log('   ✅ LOGIN SHOULD WORK');
      } else {
        console.log('   ❌ LOGIN WILL FAIL');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.disconnect();
    console.log('\n🔌 MongoDB connection closed.');
  }
};

testLogin();

