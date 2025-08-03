const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      default: 'Teacher Clearance System',
      maxlength: [100, 'Site name cannot exceed 100 characters'],
    },
    siteDescription: {
      type: String,
      default: 'Woldia University Academic Staff Clearance Management System',
      maxlength: [500, 'Site description cannot exceed 500 characters'],
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    maxLoginAttempts: {
      type: Number,
      default: 5,
      min: [1, 'Max login attempts must be at least 1'],
      max: [10, 'Max login attempts cannot exceed 10'],
    },
    lockoutDuration: {
      type: Number,
      default: 2 * 60 * 60 * 1000, // 2 hours in milliseconds
      min: [5 * 60 * 1000, 'Lockout duration must be at least 5 minutes'],
    },
    sessionTimeout: {
      type: Number,
      default: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      min: [30 * 60 * 1000, 'Session timeout must be at least 30 minutes'],
    },
    emailSettings: {
      enabled: {
        type: Boolean,
        default: false,
      },
      provider: {
        type: String,
        enum: ['smtp', 'gmail', 'outlook', 'sendgrid'],
        default: 'smtp',
      },
      host: String,
      port: {
        type: Number,
        default: 587,
      },
      secure: {
        type: Boolean,
        default: false,
      },
      fromEmail: String,
      fromName: {
        type: String,
        default: 'Woldia University TCS',
      },
    },
    backupSettings: {
      enabled: {
        type: Boolean,
        default: true,
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'weekly',
      },
      retentionDays: {
        type: Number,
        default: 30,
        min: [1, 'Retention period must be at least 1 day'],
      },
      location: {
        type: String,
        default: 'local',
        enum: ['local', 's3', 'gdrive'],
      },
    },
    notificationSettings: {
      enablePushNotifications: {
        type: Boolean,
        default: true,
      },
      enableEmailNotifications: {
        type: Boolean,
        default: true,
      },
      enableSMSNotifications: {
        type: Boolean,
        default: false,
      },
    },
    securitySettings: {
      enforcePasswordComplexity: {
        type: Boolean,
        default: true,
      },
      minPasswordLength: {
        type: Number,
        default: 8,
        min: [6, 'Minimum password length must be at least 6'],
      },
      passwordExpiryDays: {
        type: Number,
        default: 90,
        min: [0, 'Password expiry cannot be negative'],
      },
      twoFactorAuth: {
        type: Boolean,
        default: false,
      },
    },
    clearanceSettings: {
      defaultProcessingDays: {
        type: Number,
        default: 14,
        min: [1, 'Processing days must be at least 1'],
      },
      urgentProcessingDays: {
        type: Number,
        default: 7,
        min: [1, 'Urgent processing days must be at least 1'],
      },
      autoApprovalThreshold: {
        type: Number,
        default: 0, // 0 means no auto-approval
        min: [0, 'Auto-approval threshold cannot be negative'],
      },
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Ensure only one settings document exists
systemSettingsSchema.statics.getInstance = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = new this({});
    await settings.save();
  }
  return settings;
};

const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);

module.exports = SystemSettings;
