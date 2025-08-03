
const express = require('express');
const router = express.Router();
const { getDashboardData, getRecentActivity } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getDashboardData);
router.route('/activity').get(protect, getRecentActivity);

module.exports = router;
