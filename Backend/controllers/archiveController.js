const ClearanceRequest = require('../models/ClearanceRequest');
const ClearanceStep = require('../models/ClearanceStep');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const { asyncHandler } = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// Archive a completed clearance request
const archiveClearanceRequest = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const request = await ClearanceRequest.findById(id)
    .populate('initiatedBy', 'name email department')
    .lean();

  if (!request) {
    return next(new AppError('Clearance request not found', 404));
  }

  if (request.status !== 'cleared') {
    return next(new AppError('Only cleared requests can be archived', 400));
  }

  // Get all clearance steps for archiving
  const clearanceSteps = await ClearanceStep.find({ requestId: id })
    .populate('approvedBy', 'name email role')
    .sort({ order: 1 })
    .lean();

  // Create archive record
  const archiveRecord = {
    originalRequestId: request._id,
    referenceCode: request.referenceCode,
    staffName: request.initiatedBy.name,
    staffEmail: request.initiatedBy.email,
    department: request.initiatedBy.department,
    purpose: request.purpose,
    createdAt: request.createdAt,
    completedAt: new Date(),
    workflowSequence: clearanceSteps.map(step => ({
      stepNumber: step.order,
      department: step.department,
      reviewerRole: step.reviewerRole,
      approvedBy: step.approvedBy?.name,
      approvedByEmail: step.approvedBy?.email,
      approvedAt: step.approvedAt,
      status: step.status,
      notes: step.notes,
      conditionalChecks: step.conditionalChecks,
      conditionsVerified: step.conditionsVerified
    })),
    hrSignature: request.hrSignature,
    vpSignature: request.vpSignature,
    authorizedPersonName: request.authorizedPersonName,
    archivedBy: req.user._id,
    archivedAt: new Date()
  };

  // Update request status to archived
  await ClearanceRequest.findByIdAndUpdate(id, {
    status: 'archived',
    archivedAt: new Date(),
    archivedBy: req.user._id
  });

  // Log archiving activity
  await ActivityLog.create({
    userId: req.user._id,
    requestId: id,
    action: 'REQUEST_ARCHIVED',
    description: `Clearance request archived by ${req.user.name}`,
  });

  res.status(200).json({
    success: true,
    message: 'Clearance request successfully archived',
    data: archiveRecord
  });
});

// Get archived requests
const getArchivedRequests = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const archivedRequests = await ClearanceRequest.find({ status: 'archived' })
    .populate('initiatedBy', 'name email department')
    .populate('archivedBy', 'name email')
    .sort({ archivedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await ClearanceRequest.countDocuments({ status: 'archived' });

  res.status(200).json({
    success: true,
    data: {
      requests: archivedRequests,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    }
  });
});

// Search archived requests
const searchArchivedRequests = asyncHandler(async (req, res, next) => {
  const { query } = req.query;
  
  if (!query) {
    return next(new AppError('Search query is required', 400));
  }

  const searchRegex = new RegExp(query, 'i');
  
  const archivedRequests = await ClearanceRequest.find({
    status: 'archived',
    $or: [
      { 'initiatedBy.name': searchRegex },
      { referenceCode: searchRegex },
      { 'initiatedBy.department': searchRegex }
    ]
  })
    .populate('initiatedBy', 'name email department')
    .populate('archivedBy', 'name email')
    .sort({ archivedAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    data: archivedRequests
  });
});

// Restore archived request
const restoreArchivedRequest = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const request = await ClearanceRequest.findById(id);

  if (!request) {
    return next(new AppError('Clearance request not found', 404));
  }

  if (request.status !== 'archived') {
    return next(new AppError('Only archived requests can be restored', 400));
  }

  // Restore request status to cleared
  await ClearanceRequest.findByIdAndUpdate(id, {
    status: 'cleared',
    archivedAt: null,
    archivedBy: null
  });

  // Log restoration activity
  await ActivityLog.create({
    userId: req.user._id,
    requestId: id,
    action: 'REQUEST_RESTORED',
    description: `Archived clearance request restored by ${req.user.name}`,
  });

  res.status(200).json({
    success: true,
    message: 'Archived request successfully restored'
  });
});

module.exports = {
  archiveClearanceRequest,
  getArchivedRequests,
  searchArchivedRequests,
  restoreArchivedRequest
};
