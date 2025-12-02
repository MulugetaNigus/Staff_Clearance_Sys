const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// @desc    Get my notifications
// @route   GET /api/notifications/my-notifications
// @access  Private
const getMyNotifications = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;

    const notifications = await Notification.find({ userId })
        .populate('relatedRequest', 'referenceCode purpose status')
        .populate('relatedStep', 'department reviewerRole status')
        .sort({ read: 1, createdAt: -1 }) // Unread first, then by newest
        .limit(50); // Last 50 notifications

    const unreadCount = await Notification.countDocuments({ userId, read: false });

    res.status(200).json({
        success: true,
        data: {
            notifications,
            unreadCount,
        },
    });
});

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({ _id: id, userId });

    if (!notification) {
        return next(new AppError('Notification not found', 404));
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({
        success: true,
        message: 'Notification marked as read',
    });
});

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/mark-all-read
// @access  Private
const markAllAsRead = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;

    await Notification.updateMany({ userId, read: false }, { read: true });

    res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
    });
});

module.exports = {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
};
