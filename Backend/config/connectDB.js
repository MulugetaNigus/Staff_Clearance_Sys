const mongoose = require('mongoose');
require('dotenv').config();

    const connectDB = async () => {
  try {
    const uri = "mongodb://127.0.0.1:27017/clearance_system";
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;