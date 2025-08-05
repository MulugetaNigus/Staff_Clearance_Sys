const mongoose = require('mongoose');

const clearanceStepSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClearanceRequest',
      required: [true, 'Request ID is required'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    reviewerRole: {
      type: String,
      required: [true, 'Reviewer role is required'],
      trim: true,
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: ['pending', 'cleared', 'issue'],
      default: 'pending',
    },
    comment: {
      type: String,
      trim: true,
    },
    lastUpdatedAt: {
      type: Date,
      default: Date.now,
    },
    // Reference to the reviewer who processed this step
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Order of this step in the clearance process
    order: {
      type: Number,
      required: [true, 'Order is required'],
    },
    // Additional notes from the reviewer
    notes: {
      type: String,
      trim: true,
    },
    signature: {
      type: String,
    },
    hiddenFor: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
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
    toObject: {
      virtuals: true,
    },
  }
);

// Index for performance
clearanceStepSchema.index({ requestId: 1 });
clearanceStepSchema.index({ reviewerRole: 1 });
clearanceStepSchema.index({ status: 1 });
clearanceStepSchema.index({ requestId: 1, order: 1 });

const ClearanceStep = mongoose.model('ClearanceStep', clearanceStepSchema);

module.exports = ClearanceStep;
