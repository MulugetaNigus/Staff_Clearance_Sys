const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler } = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// Protect routes - verify JWT token
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return next(new AppError('Access denied. No token provided.', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.id).select('+lastLogin');

    if (!user) {
      return next(new AppError('User not found. Token is invalid.', 401));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new AppError('User account is deactivated.', 401));
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token.', 401));
    } else if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired.', 401));
    }
    return next(new AppError('Token verification failed.', 401));
  }
});

// Authorize roles
const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('AUTHORIZE MIDDLEWARE: Required Roles:', roles);
    console.log('AUTHORIZE MIDDLEWARE: User Role:', req.user?.role);

    if (!req.user) {
      console.log('AUTHORIZE MIDDLEWARE: FAILED - No user on request.');
      return next(new AppError('Access denied. Please login first.', 401));
    }

    if (!roles.includes(req.user.role)) {
      console.log(`AUTHORIZE MIDDLEWARE: FAILED - Role '${req.user.role}' is not in the required list.`);
      return next(
        new AppError(`Access denied. Role '${req.user.role}' is not authorized to access this route.`, 403)
      );
    }

    console.log('AUTHORIZE MIDDLEWARE: SUCCESS - User is authorized.');
    next();
  };
};

// Optional authentication - doesn't fail if no token
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Silently fail for optional auth
      console.log('Optional auth failed:', error.message);
    }
  }

  next();
});

// Check if user owns resource or is admin
const checkOwnership = (resourceModel, resourceField = 'user') => {
  return asyncHandler(async (req, res, next) => {
    const resource = await resourceModel.findById(req.params.id);

    if (!resource) {
      return next(new AppError('Resource not found', 404));
    }

    // Check if user owns the resource or is admin
    const resourceUserId = resource[resourceField]?.toString() || resource.createdBy?.toString();
    
    if (resourceUserId !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Access denied. You can only access your own resources.', 403));
    }

    req.resource = resource;
    next();
  });
};

module.exports = {
  protect,
  authorize,
  optionalAuth,
  checkOwnership,
};
