const mongoose = require('mongoose');

const clearanceRequestSchema = new mongoose.Schema(
  {
    referenceCode: {
      type: String,
      unique: true,
      required: true,
    },
    staffId: {
      type: String,
      required: [true, 'Staff ID is required'],
      trim: true,
    },
    purpose: {
      type: String,
      required: [true, 'Purpose of clearance is required'],
      enum: ['Resignation', 'Retirement', 'Transfer', 'Leave', 'End of Contract'],
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: ['pending_hr_review', 'pending_vp_approval', 'in_progress', 'cleared', 'rejected'],
      default: 'pending_hr_review',
    },
    supportingDocumentUrl: {
      type: String,
      trim: true,
    },
    initiatedAt: {
      type: Date,
      default: Date.now,
    },
    initialApprovedAt: {
      type: Date,
    },
    finalApprovedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    hrSignature: {
      type: String,
    },
    vpSignature: {
      type: String,
    },
    // Submitted form data
    formData: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Form data is required'],
    },
    // Reference to the user who initiated the request
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Reference to the user who approved/rejected
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    uploadedFiles: [
      {
        fileName: String,
        filePath: String,
        mimetype: String,
        size: Number,
        visibility: {
          type: String,
          enum: ['hr', 'vp', 'all'],
          default: 'all',
        },
      },
    ],
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
clearanceRequestSchema.index({ staffId: 1 });
clearanceRequestSchema.index({ status: 1 });
clearanceRequestSchema.index({ initiatedBy: 1 });
clearanceRequestSchema.index({ createdAt: -1 });

const ClearanceRequest = mongoose.model('ClearanceRequest', clearanceRequestSchema);

module.exports = ClearanceRequest;
