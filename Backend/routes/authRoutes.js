const express = require('express');
const {
  register,
  login,
  getMe,
  logout,
  changePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.post('/change-password', changePassword);

router.use(protect); // All routes after this middleware are protected

router.get('/me', getMe);
router.post('/logout', logout);

module.exports = router;
