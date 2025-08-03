const express = require('express');
const {
  getDashboardStats,
  getSystemHealth,
  generateBackup,
  restoreBackup,
  getAuditLogs,
  getSystemLogs,
  generateReport,
  getReports,
  deleteReport,
  managePermissions,
  getSystemSettings,
  updateSystemSettings,
  getClearanceProgress,
  getCompletionStats,
  getUserActivity,
  troubleshootUser,
  sendSystemNotification
} = require('../controllers/adminController');
const { authenticateAdmin } = require('../middleware/authMiddleware');
const { validateReportGeneration } = require('../middleware/validation');

const router = express.Router();

// Dashboard and Statistics
router.get('/dashboard', authenticateAdmin, getDashboardStats);
router.get('/system-health', authenticateAdmin, getSystemHealth);
router.get('/clearance-progress', authenticateAdmin, getClearanceProgress);
router.get('/completion-stats', authenticateAdmin, getCompletionStats);

// User Management & Support
router.get('/user-activity', authenticateAdmin, getUserActivity);
router.post('/troubleshoot-user/:userId', authenticateAdmin, troubleshootUser);
router.post('/send-notification', authenticateAdmin, sendSystemNotification);

// System Security & Permissions
router.get('/permissions', authenticateAdmin, managePermissions);
router.put('/permissions', authenticateAdmin, managePermissions);

// System Settings
router.get('/settings', authenticateAdmin, getSystemSettings);
router.put('/settings', authenticateAdmin, updateSystemSettings);

// Backup & Data Integrity
router.post('/backup', authenticateAdmin, generateBackup);
router.post('/restore', authenticateAdmin, restoreBackup);

// Audit & Logging
router.get('/audit-logs', authenticateAdmin, getAuditLogs);
router.get('/system-logs', authenticateAdmin, getSystemLogs);

// Reports
router.post('/reports/generate', authenticateAdmin, validateReportGeneration, generateReport);
router.get('/reports', authenticateAdmin, getReports);
router.delete('/reports/:reportId', authenticateAdmin, deleteReport);

module.exports = router;
