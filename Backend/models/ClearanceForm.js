const mongoose = require('mongoose');

// Schema for clearance form fields
const clearanceFieldSchema = new mongoose.Schema({
  fieldName: {
    type: String,
    required: true,
    trim: true,
  },
  fieldType: {
    type: String,
    enum: ['text', 'number', 'date', 'textarea', 'select', 'checkbox', 'file', 'signature'],
    required: true,
  },
  label: {
    type: String,
    required: true,
    trim: true,
  },
  placeholder: {
    type: String,
    trim: true,
  },
  required: {
    type: Boolean,
    default: false,
  },
  options: [{
    label: String,
    value: String,
  }], // For select fields
  validation: {
    minLength: Number,
    maxLength: Number,
    min: Number,
    max: Number,
    pattern: String, // Regex pattern
  },
  order: {
    type: Number,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
});

const clearanceFormSchema = new mongoose.Schema(
  {
    formName: {
      type: String,
      required: [true, 'Form name is required'],
      trim: true,
    },
    formType: {
      type: String,
      enum: ['Initial', 'Department', 'Final', 'Certificate'],
      required: true,
    },
    version: {
      type: String,
      default: '1.0',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Form fields configuration
    fields: [clearanceFieldSchema],
    
    // Instructions for filling the form
    instructions: {
      type: String,
      trim: true,
    },
    
    // Required documents for this form
    requiredDocuments: [{
      documentName: {
        type: String,
        required: true,
      },
      documentType: {
        type: String,
        enum: ['PDF', 'Image', 'Word', 'Excel', 'Any'],
        default: 'Any',
      },
      maxSize: {
        type: Number, // in MB
        default: 5,
      },
      required: {
        type: Boolean,
        default: true,
      },
    }],
    
    // Uploaded files associated with this form instance
    uploadedFiles: [{
      fileName: String,
      filePath: String,
      mimetype: String,
      size: Number, // in bytes
      uploadedAt: { type: Date, default: Date.now },
    }],
    
    // Approval requirements
    approvalCriteria: {
      minimumApprovals: {
        type: Number,
        default: 1,
      },
      requireAllDepartments: {
        type: Boolean,
        default: true,
      },
      timeLimit: {
        type: Number, // in days
        default: 30,
      },
    },
    
    // Form creator and maintainer
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

// Indexes
clearanceFormSchema.index({ formType: 1, isActive: 1 });
clearanceFormSchema.index({ createdAt: -1 });

const ClearanceForm = mongoose.model('ClearanceForm', clearanceFormSchema);

module.exports = ClearanceForm;
