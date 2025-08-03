const User = require('../models/User');
const { generateToken } = require('../config/jwt');
const { asyncHandler } = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  const { email, password, name, role, department, contactInfo } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    return next(new AppError('User already exists with this email', 400));
  }

  // Create user
  const user = await User.create({
    email: email.toLowerCase(),
    password,
    name,
    role,
    department,
    contactInfo,
  });

  // Generate JWT token
  const token = generateToken({ id: user._id, email: user.email });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user,
      token,
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body; // Frontend sends username field (email)

  // Validate input
  if (!username || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Check if user exists in database and get password
  const user = await User.findOne({ email: username.toLowerCase() }).select('+password');

  if (!user) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Check password
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Check if user is active
  if (!user.isActive) {
    return next(new AppError('Account is deactivated. Contact support.', 401));
  }

  // Generate JWT token
  const token = generateToken({ id: user._id, email: user.email, role: user.role });

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Remove password from response
  const userResponse = {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    department: user.department,
    contactInfo: user.contactInfo,
    avatar: user.avatar,
    mustChangePassword: user.mustChangePassword,
  };

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: userResponse,
      token,
    },
  });
});

// @desc    Change user password
// @route   POST /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res, next) => {
  const { email, oldPassword, newPassword } = req.body;

  if (!email || !oldPassword || !newPassword) {
    return next(new AppError('Please provide email, old and new passwords', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Check if old password is correct
  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    return next(new AppError('Incorrect old password', 401));
  }

  // Update password and set mustChangePassword to false
  user.password = newPassword;
  user.mustChangePassword = false;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  // The user object is attached to the request in the 'protect' middleware
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  // For stateless JWT, logout is handled client-side by clearing the token.
  // Server-side logic could include token blacklisting if needed.
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

module.exports = {
  register,
  login,
  changePassword,
  getMe,
  logout,
};