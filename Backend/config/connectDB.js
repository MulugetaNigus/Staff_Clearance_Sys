const mongoose = require('mongoose');
require('dotenv').config();

    const connectDB = async () => {
  try {
    // const uri = "mongodb://127.0.0.1:27017/clearance_system";
    const uri = "mongodb+srv://mullerhihi:mullerhihi@cluster0.1p47xzw.mongodb.net/tcs?retryWrites=true&w=majority&appName=Cluster0&connectTimeoutMS=30000&socketTimeoutMS=45000&serverSelectionTimeoutMS=30000&family=4"
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