
const User = require('../models/User');
const ClearanceRequest = require('../models/ClearanceRequest');
const ClearanceStep = require('../models/ClearanceStep');
const ActivityLog = require('../models/ActivityLog');
const { asyncHandler } = require('../utils/asyncHandler');

// @desc    Get dashboard data based on user role
// @route   GET /api/dashboard
// @access  Private
exports.getDashboardData = asyncHandler(async (req, res) => {
  const { role, _id } = req.user;

  let data = {};

  if (role === 'SystemAdmin') {
    const totalUsers = await User.countDocuments();
    const totalClearanceRequests = await ClearanceRequest.countDocuments();
    const pendingClearances = await ClearanceRequest.countDocuments({ status: 'PENDING' });
    const completedClearances = await ClearanceRequest.countDocuments({ status: 'COMPLETED' });
    data = { totalUsers, totalClearanceRequests, pendingClearances, completedClearances };
  } else if (role.includes('Reviewer')) {
    const assignedReviews = await ClearanceStep.countDocuments({ reviewerRole: role, status: 'Pending' });
    const completedReviews = await ClearanceStep.countDocuments({ reviewerRole: role, status: { $in: ['Approved', 'Rejected'] } });
    data = { assignedReviews, completedReviews };
  } else { // Default to 'User' role
    const myRequest = await ClearanceRequest.findOne({ initiatedBy: _id });
    if (myRequest) {
      const myRequestStatus = myRequest.status;
      const totalSteps = await ClearanceStep.countDocuments({ requestId: myRequest._id });
      const approvedSteps = await ClearanceStep.countDocuments({ requestId: myRequest._id, status: 'Approved' });
      data = { myRequestStatus, totalSteps, approvedSteps };
    }
  }

  res.status(200).json({
    success: true,
    data,
  });
});

// @desc    Get recent activity for the logged-in user
// @route   GET /api/dashboard/activity
// @access  Private
exports.getRecentActivity = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  const activities = await ActivityLog.find({ userId: _id })
    .sort({ createdAt: -1 })
    .limit(10);

  res.status(200).json({
    success: true,
    data: activities,
  });
});
