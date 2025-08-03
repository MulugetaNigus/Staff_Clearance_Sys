const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGODB_URI = "mongodb://127.0.0.1:27017/clearance_system";

const checkUser = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully.');
    
    // Check if admin user exists
    const adminUser = await User.findOne({ email: 'admin@woldia.edu.et' }).select('+password');
    console.log('\n🔍 Admin user found:', adminUser ? 'YES' : 'NO');
    
    if (adminUser) {
      console.log('📧 Email:', adminUser.email);
      console.log('👤 Name:', adminUser.name);
      console.log('🎭 Role:', adminUser.role);
      console.log('✅ Active:', adminUser.isActive);
      console.log('🔒 Password hash exists:', !!adminUser.password);
      
      // Test password comparison
      const testPassword = 'admin123';
      const isValidPassword = await bcrypt.compare(testPassword, adminUser.password);
      console.log('🔑 Password test with "admin123":', isValidPassword ? 'VALID' : 'INVALID');
      
      // Also test the user's comparePassword method
      const isValidPasswordMethod = await adminUser.comparePassword(testPassword);
      console.log('🔑 User method test with "admin123":', isValidPasswordMethod ? 'VALID' : 'INVALID');
    }
    
    // Check total user count
    const userCount = await User.countDocuments();
    console.log('\n📊 Total users in database:', userCount);
    
    // List first few users
    const users = await User.find().limit(5).select('email name role');
    console.log('\n👥 First 5 users:');
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email} (${user.name}) - ${user.role}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.disconnect();
    console.log('\n🔌 MongoDB connection closed.');
  }
};

checkUser();
