const express = require('express');
const { authenticateToken: protect } = require('../middleware/authMiddleware');
const { generateCertificate, getCertificateData } = require('../controllers/certificateController');

const router = express.Router();

// Generate PDF certificate
router.get('/:id/generate', protect, generateCertificate);

// Get certificate data (for frontend display)
router.get('/:id/data', protect, getCertificateData);

module.exports = router;
