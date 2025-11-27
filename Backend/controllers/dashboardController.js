
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
    // Admin sees all clearance requests and users
    const totalUsers = await User.countDocuments();
    const totalClearanceRequests = await ClearanceRequest.countDocuments();

    // Count by actual status values from the schema
    const pendingClearances = await ClearanceRequest.countDocuments({
      status: { $in: ['initiated', 'vp_initial_approval', 'in_progress'] }
    });
    const completedClearances = await ClearanceRequest.countDocuments({ status: 'cleared' });
    const rejectedClearances = await ClearanceRequest.countDocuments({ status: 'rejected' });

    data = {
      totalUsers,
      totalClearanceRequests,
      pendingClearances,
      completedClearances,
      rejectedClearances
    };
  } else if (role.includes('Reviewer')) {
    // Reviewers see their assigned reviews
    const assignedReviews = await ClearanceStep.countDocuments({
      reviewerRole: role,
      status: 'pending'
    });
    const completedReviews = await ClearanceStep.countDocuments({
      reviewerRole: role,
      status: { $in: ['cleared', 'rejected'] }
    });
    const pendingReviews = await ClearanceStep.countDocuments({
      reviewerRole: role,
      status: 'pending'
    });

    data = {
      assignedReviews,
      completedReviews,
      pendingReviews
    };
  } else if (role === 'AcademicVicePresident') {
    // VP sees requests needing their approval
    const vpInitialPending = await ClearanceRequest.countDocuments({
      status: 'initiated'
    });
    const vpFinalPending = await ClearanceRequest.countDocuments({
      status: 'in_progress',
      vpFinalSignature: { $exists: false }
    });
    const totalApproved = await ClearanceRequest.countDocuments({
      status: 'cleared'
    });

    data = {
      vpInitialPending,
      vpFinalPending,
      totalApproved
    };
  } else { // Academic Staff - see their own clearance status
    const myRequest = await ClearanceRequest.findOne({ initiatedBy: _id }).sort({ createdAt: -1 });

    if (myRequest) {
      const myRequestStatus = myRequest.status;
      const totalSteps = await ClearanceStep.countDocuments({ requestId: myRequest._id });
      const approvedSteps = await ClearanceStep.countDocuments({
        requestId: myRequest._id,
        status: 'cleared'
      });
      const pendingSteps = await ClearanceStep.countDocuments({
        requestId: myRequest._id,
        status: 'pending'
      });
      const rejectedSteps = await ClearanceStep.countDocuments({
        requestId: myRequest._id,
        status: 'rejected'
      });

      data = {
        myRequestStatus,
        totalSteps,
        approvedSteps,
        pendingSteps,
        rejectedSteps,
        requestId: myRequest._id,
        referenceCode: myRequest.referenceCode
      };
    } else {
      // No clearance request found
      data = {
        myRequestStatus: 'none',
        totalSteps: 0,
        approvedSteps: 0,
        pendingSteps: 0,
        rejectedSteps: 0
      };
    }
  }

  res.status(200).json({
    success: true,
    data,
  });
});

// @desc    Get report statistics for charts
// @route   GET /api/dashboard/reports
// @access  Private (Admin/VP)
exports.getReportStats = asyncHandler(async (req, res) => {
  // 1. Clearance Requests by Department
  const departmentStats = await ClearanceRequest.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'initiatedBy',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $group: {
        _id: '$user.department',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // 2. Request Status Distribution
  const statusStats = await ClearanceRequest.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // 3. Monthly Request Trends (Last 6 Months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const trendStats = await ClearanceRequest.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      byDepartment: departmentStats.map(stat => ({ name: stat._id || 'Unknown', value: stat.count })),
      byStatus: statusStats.map(stat => ({ name: stat._id, value: stat.count })),
      trends: trendStats.map(stat => {
        const date = new Date(stat._id.year, stat._id.month - 1);
        return {
          name: date.toLocaleString('default', { month: 'short' }),
          value: stat.count
        };
      })
    }
  });
});
// @desc    Get recent activity for the logged-in user
// @route   GET /api/dashboard/activity
// @access  Private
exports.getRecentActivity = asyncHandler(async (req, res) => {
  const { _id, role } = req.user;

  let activities = [];

  // Check if ActivityLog model exists, if not return recent clearance updates
  try {
    activities = await ActivityLog.find({ userId: _id })
      .sort({ createdAt: -1 })
      .limit(10);
  } catch (error) {
    // If ActivityLog doesn't exist, get recent clearance steps instead
    if (role === 'AcademicStaff') {
      const myRequest = await ClearanceRequest.findOne({ initiatedBy: _id }).sort({ createdAt: -1 });
      if (myRequest) {
        const recentSteps = await ClearanceStep.find({ requestId: myRequest._id })
          .sort({ updatedAt: -1 })
          .limit(10)
          .select('department status updatedAt comment');

        // Transform to activity format
        activities = recentSteps.map(step => ({
          _id: step._id,
          description: `${step.department} - ${step.status}`,
          createdAt: step.updatedAt,
          details: step.comment
        }));
      }
    } else if (role.includes('Reviewer')) {
      const recentReviews = await ClearanceStep.find({ reviewerRole: role })
        .sort({ updatedAt: -1 })
        .limit(10)
        .populate('requestId', 'referenceCode')
        .select('department status updatedAt comment');

      activities = recentReviews.map(step => ({
        _id: step._id,
        description: `Review for ${step.requestId?.referenceCode || 'Unknown'} - ${step.status}`,
        createdAt: step.updatedAt,
        details: step.comment
      }));
    } else if (role === 'SystemAdmin') {
      const recentRequests = await ClearanceRequest.find()
        .sort({ updatedAt: -1 })
        .limit(10)
        .populate('initiatedBy', 'name')
        .select('referenceCode status updatedAt');

      activities = recentRequests.map(req => ({
        _id: req._id,
        description: `${req.referenceCode} - ${req.status}`,
        createdAt: req.updatedAt,
        details: `Request by ${req.initiatedBy?.name || 'Unknown'}`
      }));
    }
  }

  res.status(200).json({
    success: true,
    data: activities,
  });
});
