const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// User roles based on frontend UserRole type
const USER_ROLES = [
  'AcademicStaff',
  'SystemAdmin',
  'AcademicVicePresident',
  'Registrar',
  'HumanResources',
  // Departmental Reviewers
  'AcademicDepartmentReviewer',
  'RegistrarReviewer',
  'StudentDeanReviewer',
  'DistanceEducationReviewer',
  'ResearchDirectorateReviewer',
  'CollegeReviewer',
  'DepartmentReviewer',
  'EmployeeFinanceReviewer',
  'LibraryReviewer',
  'GeneralServiceReviewer',
  'PropertyDirectorReviewer',
  'Store1Reviewer',
  'Store2Reviewer',
  'PropertySpecialist1Reviewer',
  'PropertySpecialist2Reviewer',
  'InternalAuditReviewer',
  'FinanceExecutiveReviewer',
  'FinanceSpecialistReviewer',
  'TreasurerReviewer',
  'EthicsReviewer',
  'ICTReviewer',
  'CommunityEngagementReviewer',
  'HRManagementReviewer',
  'RecordsArchivesReviewer',
  'FacilitiesReviewer',
  'CaseExecutiveReviewer',
  'HRDevelopmentReviewer'
];

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Don't include password in queries by default
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    role: {
      type: String,
      enum: USER_ROLES,
      required: [true, 'Role is required'],
      default: 'AcademicStaff',
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      maxlength: [100, 'Department cannot exceed 100 characters'],
    },
    contactInfo: {
      type: String,
      required: [true, 'Contact info is required'],
      trim: true,
      maxlength: [100, 'Contact info cannot exceed 100 characters'],
    },
    avatar: {
      type: String,
      default: '',
    },
    username: {
      type: String,
      unique: true,
      sparse: true, // Allow null values but ensure uniqueness when present
      trim: true,
      maxlength: [50, 'Username cannot exceed 50 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    permissions: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if user account is locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Generate username from name
userSchema.statics.generateUsername = function(name) {
  const baseUsername = name.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 10);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${baseUsername}${randomSuffix}`;
};

// Generate random password
userSchema.statics.generatePassword = function() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Index for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
