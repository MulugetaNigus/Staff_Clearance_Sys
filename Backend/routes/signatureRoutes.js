const express = require('express');
const { authenticateToken: protect } = require('../middleware/authMiddleware');
const { 
  getSignaturesForRequest,
  getAllAvailableSignatures,
  getSignatureByRole
} = require('../controllers/signatureController');

const router = express.Router();

// Get all signatures for a specific clearance request
router.get('/requests/:requestId', protect, getSignaturesForRequest);

// Get all available signatures (for sample PDF generation)
router.get('/available', protect, getAllAvailableSignatures);

// Public endpoint for sample PDF generation (no auth required)
router.get('/sample', getAllAvailableSignatures);

// Get signature by reviewer role
router.get('/role/:role', protect, getSignatureByRole);

module.exports = router;
