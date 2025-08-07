const express = require('express');
const router = express.Router();
const {
  verifyClearanceRequest,
} = require('../controllers/clearanceController');

// Public route for verification
router.route('/:id').get(verifyClearanceRequest);

module.exports = router;
