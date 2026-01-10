const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClearanceRequest',
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: [
        'FORM_SUBMITTED',
        'REQUEST_CREATED',
        'REQUEST_UPDATED',
        'FILE_REPLACED',
        'INITIAL_APPROVAL',
        'INITIAL_REJECTION',
        'STEP_UPDATED',
        'FINAL_APPROVAL',
        'STEP_APPROVED',
        'STEP_REJECTED',
        'REQUEST_COMPLETED',
        'DOCUMENT_UPLOADED',
        'CERTIFICATE_GENERATED',
        'LOGIN',
        'LOGOUT',
        'PASSWORD_CHANGED',
        'PROFILE_UPDATED',
        'STEP_HIDDEN'
      ],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    // Additional context data
    previousData: {
      type: mongoose.Schema.Types.Mixed,
    },
    newData: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for performance
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ requestId: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
