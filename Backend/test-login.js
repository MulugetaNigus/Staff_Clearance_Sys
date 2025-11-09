const mongoose = require('mongoose');
const User = require('./models/User');

const MONGODB_URI = "mongodb://127.0.0.1:27017/clearance_system";

const testLogin = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully.');
    
    const testEmail = 'admin@woldia.edu.et';
    const testPassword = 'admin123';
    
    console.log('\n🧪 Testing login process step by step...');
    console.log('📧 Email:', testEmail);
    console.log('🔑 Password:', testPassword);
    
    // Step 1: Check if user exists
    const user = await User.findOne({ email: testEmail.toLowerCase() }).select('+password');
    console.log('\n1️⃣ User found:', user ? 'YES' : 'NO');
    
    if (!user) {
      console.log('❌ User not found in database');
      return;
    }
    
    console.log('   - Name:', user.name);
    console.log('   - Role:', user.role);
    console.log('   - Active:', user.isActive);
    console.log('   - Email verified:', user.isEmailVerified);
    
    // Step 2: Test password
    const isPasswordCorrect = await user.comparePassword(testPassword);
    console.log('\n2️⃣ Password correct:', isPasswordCorrect ? 'YES' : 'NO');
    
    // Step 3: Check if user is active
    console.log('\n3️⃣ User is active:', user.isActive ? 'YES' : 'NO');
    
    // Step 4: Check if user is locked
    console.log('\n4️⃣ User is locked:', user.isLocked ? 'YES' : 'NO');
    console.log('   - Login attempts:', user.loginAttempts);
    console.log('   - Lock until:', user.lockUntil);
    
    if (user && isPasswordCorrect && user.isActive && !user.isLocked) {
      console.log('\n✅ LOGIN SHOULD BE SUCCESSFUL');
    } else {
      console.log('\n❌ LOGIN SHOULD FAIL');
      console.log('Reasons:');
      if (!user) console.log('   - User not found');
      if (!isPasswordCorrect) console.log('   - Password incorrect');
      if (!user.isActive) console.log('   - User not active');
      if (user.isLocked) console.log('   - User is locked');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.disconnect();
    console.log('\n🔌 MongoDB connection closed.');
  }
};

testLogin();
