const express = require('express');
const { authenticateToken: protect } = require('../middleware/authMiddleware');
const { generateCertificate, getCertificateData, verifyCertificate } = require('../controllers/certificateController');

const router = express.Router();

// Generate PDF certificate
router.get('/:id/generate', generateCertificate);

// Public verification route
router.get('/verify/:referenceCode', verifyCertificate);

// Get certificate data (for frontend display)
router.get('/:id/data', protect, getCertificateData);

module.exports = router;
