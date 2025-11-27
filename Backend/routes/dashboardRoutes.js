
const express = require('express');
const router = express.Router();
const { getDashboardData, getRecentActivity, getReportStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getDashboardData);
router.route('/activity').get(protect, getRecentActivity);
router.route('/reports').get(protect, getReportStats);

module.exports = router;
