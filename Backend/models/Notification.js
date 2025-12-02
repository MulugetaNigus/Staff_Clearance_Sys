const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        type: {
            type: String,
            required: true,
            enum: ['step_approved', 'step_rejected', 'vp_initial_approved', 'vp_final_approved', 'request_rejected'],
        },
        message: {
            type: String,
            required: true,
        },
        relatedRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ClearanceRequest',
        },
        relatedStep: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ClearanceStep',
        },
        read: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries (userId + read status + createdAt)
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
