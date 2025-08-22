const express = require('express');
const { authenticateToken: protect } = require('../middleware/authMiddleware');
const { 
  archiveClearanceRequest, 
  getArchivedRequests, 
  searchArchivedRequests, 
  restoreArchivedRequest 
} = require('../controllers/archiveController');

const router = express.Router();

// Archive a completed clearance request
router.put('/:id/archive', protect, archiveClearanceRequest);

// Get archived requests
router.get('/', protect, getArchivedRequests);

// Search archived requests
router.get('/search', protect, searchArchivedRequests);

// Restore archived request
router.put('/:id/restore', protect, restoreArchivedRequest);

module.exports = router;
