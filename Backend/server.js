const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import routes
const authRoutes = require('./routes/authRoutes');
const clearanceRoutes = require('./routes/clearanceRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const publicRoutes = require('./routes/publicRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const { apiLimiter, loginLimiter, uploadLimiter, passwordResetLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  // origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173',
  origin: ['https://wldu-clearance-sys.netlify.app', 'http://localhost:5173'],
  credentials: true
}));

// Body parsing middleware
const maxFileSize = process.env.MAX_FILE_SIZE || 5242880; // 5MB default
const fileSizeLimit = `${Math.ceil(maxFileSize / 1024 / 1024)}mb`;
app.use(express.json({ limit: fileSizeLimit }));
app.use(express.urlencoded({ extended: true, limit: fileSizeLimit }));

// Custom request logger
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.originalUrl}`);
  next();
});

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Import database configuration
const connectDB = require('../Backend/config/connectDB');
connectDB();

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Teacher Clearance System API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// API routes with specific rate limiting
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/forgot-password', passwordResetLimiter);
app.use('/api/auth/reset-password', passwordResetLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/clearance', clearanceRoutes);
app.use('/api/signatures', require('./routes/signatureRoutes'));
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/certificate', certificateRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/verify', publicRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 Teacher Clearance System Backend`);
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Health: http://localhost:${PORT}/health
`);
});

module.exports = app;

