const express = require('express');
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUsersByRole,
  resetUserPassword,
  toggleUserStatus,
  bulkCreateUsers,
  exportUsers,
  changePassword,
} = require('../controllers/userController');
const { authenticateAdmin, authenticateToken, checkRole } = require('../middleware/authMiddleware');
const { validateUserCreation, validateUserUpdate } = require('../middleware/validation');
const upload = require('../middleware/upload');

const router = express.Router();

// PUBLIC AND USER ROUTES
router.get('/profile/me', authenticateToken, (req, res) => {
  // req.user is attached by authenticateToken
  res.json(req.user);
});

router.put('/profile', 
  authenticateToken, 
  upload.single('profilePicture'), 
  updateUser
);

router.post('/change-password', 
  authenticateToken, 
  changePassword
);


// ADMIN ONLY ROUTES
// All routes below are protected and require admin privileges.
router.use(authenticateAdmin);

router.post('/create', validateUserCreation, createUser);
router.post('/bulk-create', bulkCreateUsers);
router.get('/all', getAllUsers);
router.get('/export', exportUsers);
router.get('/role/:role', getUsersByRole);

// Admin operations on specific users by ID
router.get('/:id', getUserById);
router.put('/:id', upload.single('profilePicture'), validateUserUpdate, updateUser);
router.delete('/:id', deleteUser);
router.post('/:id/reset-password', resetUserPassword);
router.patch('/:id/toggle-status', toggleUserStatus);


module.exports = router;