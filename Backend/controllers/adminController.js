const User = require('../models/User');
const SystemSettings = require('../models/SystemSettings');
const ActivityLog = require('../models/ActivityLog');
const ClearanceRequest = require('../models/ClearanceRequest');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // User statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: monthAgo } });
    const lockedUsers = await User.countDocuments({ lockUntil: { $gt: now } });
    
    // Role-based statistics
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Activity statistics
    const recentLogins = await User.countDocuments({ lastLogin: { $gte: weekAgo } });
    const totalActivityLogs = await ActivityLog.countDocuments();
    const recentActivities = await ActivityLog.countDocuments({ createdAt: { $gte: weekAgo } });
    
    // Clearance statistics
    const totalClearanceRequests = await ClearanceRequest.countDocuments() || 0;
    const completedClearances = await ClearanceRequest.countDocuments({ status: 'COMPLETED' }) || 0;
    const pendingClearances = await ClearanceRequest.countDocuments({ status: 'PENDING' }) || 0;
    const rejectedClearances = await ClearanceRequest.countDocuments({ status: 'REJECTED' }) || 0;
    
    res.status(200).json({
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        locked: lockedUsers,
        newThisMonth: newUsersThisMonth,
        byRole: usersByRole
      },
      activity: {
        recentLogins,
        total: totalActivityLogs,
        recent: recentActivities
      },
      clearances: {
        total: totalClearanceRequests,
        completed: completedClearances,
        pending: pendingClearances,
        rejected: rejectedClearances,
        completionRate: totalClearanceRequests > 0 ? Math.round((completedClearances / totalClearanceRequests) * 100) : 0
      },
      systemHealth: {
        dbConnection: mongoose.connection.readyState,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage()
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get system health
exports.getSystemHealth = (req, res) => {
  const dbState = mongoose.connection.readyState;
  const systemTime = new Date().toISOString();
  res.status(200).json({ dbState, systemTime });
};

// Generate backup
exports.generateBackup = (req, res) => {
  // Implementation of backup logic
  res.status(200).json({ message: 'Backup generated successfully' });
};

// Restore backup
exports.restoreBackup = (req, res) => {
  // Implementation of restore logic
  res.status(200).json({ message: 'Backup restored successfully' });
};

// Get audit logs
exports.getAuditLogs = (req, res) => {
  // Placeholder implementation
  res.status(200).json({ logs: [] });
};

// Get system logs
exports.getSystemLogs = (req, res) => {
  // Placeholder implementation
  res.status(200).json({ logs: [] });
};

// Generate report
exports.generateReport = (req, res) => {
  const { reportType, startDate, endDate } = req.body;
  // Placeholder implementation for report generation
  res.status(201).json({ reportId: '12345', reportType, startDate, endDate });
};

// Get reports
exports.getReports = (req, res) => {
  // Placeholder implementation
  res.status(200).json({ reports: [] });
};

// Delete report
exports.deleteReport = (req, res) => {
  const { reportId } = req.params;
  // Placeholder implementation for report deletion
  res.status(200).json({ message: `Report ${reportId} deleted successfully` });
};

// Manage permissions
exports.managePermissions = (req, res) => {
  // Placeholder implementation
  res.status(200).json({ message: 'Permissions updated successfully' });
};

// Get system settings
exports.getSystemSettings = async (req, res) => {
  try {
    const settings = await SystemSettings.getInstance();
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving settings', error });
  }
};

// Update system settings
exports.updateSystemSettings = async (req, res) => {
  try {
    const settings = await SystemSettings.getInstance();
    Object.assign(settings, req.body);
    settings.lastUpdatedBy = req.user._id;
    await settings.save();
    res.status(200).json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings', error });
  }
};

// Get clearance progress
exports.getClearanceProgress = (req, res) => {
  // Placeholder implementation
  res.status(200).json({ progress: '50%' });
};

// Get completion stats
exports.getCompletionStats = (req, res) => {
  // Placeholder implementation
  res.status(200).json({ completed: 100, pending: 10 });
};

// Get user activity
exports.getUserActivity = (req, res) => {
  // Placeholder implementation
  res.status(200).json({ activity: [] });
};

// Troubleshoot user
exports.troubleshootUser = (req, res) => {
  const { userId } = req.params;
  // Placeholder implementation
  res.status(200).json({ message: `Troubleshooting user ${userId}` });
};

// Send system notification
exports.sendSystemNotification = (req, res) => {
  const { notification } = req.body;
  // Placeholder implementation
  res.status(200).json({ message: `Notification sent: ${notification}` });
};

