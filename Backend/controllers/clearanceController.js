const ClearanceRequest = require('../models/ClearanceRequest');
const ClearanceStep = require('../models/ClearanceStep');
const ActivityLog = require('../models/ActivityLog');
const { asyncHandler } = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const CLEARANCE_DEPARTMENTS = [
  { id: '1', name: 'Academic Department Head', reviewerRole: 'AcademicDepartmentReviewer', order: 1 },
  { id: '2', name: 'Registrar', reviewerRole: 'RegistrarReviewer', order: 2 },
  { id: '3', name: 'Student Dean', reviewerRole: 'StudentDeanReviewer', order: 3 },
  { id: '4', name: 'Distance and Continuing Education', reviewerRole: 'DistanceEducationReviewer', order: 4 },
  { id: '5', name: 'Research Directorate', reviewerRole: 'ResearchDirectorateReviewer', order: 5 },
  { id: '6', name: 'College Head', reviewerRole: 'CollegeReviewer', order: 6 },
  { id: '7', name: 'Woldia University Employees Finance Enterprise', reviewerRole: 'EmployeeFinanceReviewer', order: 7 },
  { id: '8', name: 'Library', reviewerRole: 'LibraryReviewer', order: 8 },
  { id: '9', name: 'General Service Executive', reviewerRole: 'GeneralServiceReviewer', order: 9 },
  { id: '10', name: 'Property Executive Director', reviewerRole: 'PropertyDirectorReviewer', order: 10 },
  { id: '11', name: 'Store 1 Officer', reviewerRole: 'Store1Reviewer', order: 11 },
  { id: '12', name: 'Store 2 Officer', reviewerRole: 'Store2Reviewer', order: 12 },
  { id: '13', name: 'Property Registration and Control Specialist 1', reviewerRole: 'PropertySpecialist1Reviewer', order: 13 },
  { id: '14', name: 'Property Registration and Control Specialist 2', reviewerRole: 'PropertySpecialist2Reviewer', order: 14 },
  { id: '15', name: 'Internal Audit Executive Director', reviewerRole: 'InternalAuditReviewer', order: 15 },
  { id: '16', name: 'Finance Executive', reviewerRole: 'FinanceExecutiveReviewer', order: 16 },
  { id: '17', name: 'Senior Finance Specialist', reviewerRole: 'FinanceSpecialistReviewer', order: 17 },
  { id: '18', name: 'Treasurer', reviewerRole: 'TreasurerReviewer', order: 18 },
  { id: '19', name: 'Ethics and Anti-Corruption Monitoring Executive', reviewerRole: 'EthicsReviewer', order: 19 },
  { id: '20', name: 'ICT Executive', reviewerRole: 'ICTReviewer', order: 20 },
  { id: '21', name: 'Community Engagement Directorate', reviewerRole: 'CommunityEngagementReviewer', order: 21 },
  { id: '22', name: 'Competency and HR Management Executive', reviewerRole: 'HRManagementReviewer', order: 22 },
  { id: '23', name: 'Records and Archives Officer', reviewerRole: 'RecordsArchivesReviewer', order: 23 },
  { id: '24', name: 'Office and Classroom Facilities Specialist', reviewerRole: 'FacilitiesReviewer', order: 24 },
  { id: '25', name: 'Case Executive', reviewerRole: 'CaseExecutiveReviewer', order: 25 },
  { id: '26', name: 'HR Competency and Development Team Leader', reviewerRole: 'HRDevelopmentReviewer', order: 26 },
  { id: '27', name: 'Vice President for Academic, Research & Community Engagement', reviewerRole: 'AcademicVicePresident', order: 27 },
];

// @desc    Create a new clearance request
// @route   POST /api/clearance/requests
// @access  Private
const createClearanceRequest = asyncHandler(async (req, res, next) => {
  let parsedFormData = {};
  try {
    parsedFormData = JSON.parse(req.body.formData);
  } catch (e) {
    return next(new AppError('Invalid form data format.', 400));
  }
  const { purpose, fileMetadata, ...otherFormData } = parsedFormData;

  const staffId = req.user.id || req.user._id;

  if (!purpose) {
    return next(new AppError('Purpose of clearance is required', 400));
  }

  const existingRequest = await ClearanceRequest.findOne({
    initiatedBy: req.user._id,
    status: { $in: ['pending_approval', 'in_progress'] },
  });

  if (existingRequest) {
    return next(new AppError('You already have a pending clearance request', 400));
  }

  const referenceCode = `TCS-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;

  const uploadedFiles = req.files ? req.files.map((file, index) => {
    const metadata = fileMetadata ? fileMetadata[index] : {};
    return {
      fileName: file.originalname,
      filePath: file.path,
      mimetype: file.mimetype,
      size: file.size,
      visibility: metadata.visibility || 'all',
    };
  }) : [];

  const clearanceRequest = await ClearanceRequest.create({
    referenceCode,
    staffId,
    purpose,
    initiatedBy: req.user._id,
    formData: otherFormData,
    uploadedFiles,
    status: 'pending_hr_review',
  });

  await ActivityLog.create({
    userId: req.user._id,
    requestId: clearanceRequest._id,
    action: 'REQUEST_CREATED',
    description: `Clearance request created by ${req.user.name}`,
  });

  res.status(201).json({
    success: true,
    message: 'Clearance request submitted and pending HR review.',
    data: clearanceRequest,
  });
});

// @desc    HR reviews a clearance request (approve/reject)
// @route   PUT /api/clearance/requests/:id/hr-review
// @access  Private (HROfficer)
const hrReviewRequest = asyncHandler(async (req, res, next) => {
  console.log('hrReviewRequest: Entering function.');
  console.log('hrReviewRequest: User Role:', req.user?.role);
  console.log('hrReviewRequest: Request ID:', req.params.id);
  console.log('hrReviewRequest: Request Body:', req.body);

  const { action, rejectionReason } = req.body; // action: 'approve' or 'reject'

  try {
    const request = await ClearanceRequest.findById(req.params.id);
    console.log('hrReviewRequest: Request found:', request ? request._id : 'None');

    if (!request) {
      console.log('hrReviewRequest: Clearance request not found.');
      return next(new AppError('Clearance request not found', 404));
    }

    // Ensure only HROfficer or HRDevelopmentReviewer can perform this action
    if (!['HROfficer', 'HRDevelopmentReviewer'].includes(req.user.role)) {
      console.log(`hrReviewRequest: Unauthorized role: ${req.user.role}`);
      return next(new AppError('Not authorized to perform this action', 403));
    }

    console.log('hrReviewRequest: Current request status:', request.status);
    // Ensure request is in the correct status for HR review
    if (request.status !== 'pending_hr_review') {
      console.log(`hrReviewRequest: Invalid status for HR review. Current: ${request.status}`);
      return next(new AppError(`Request is not in 'pending_hr_review' status. Current status: ${request.status}`, 400));
    }

    if (action === 'approve') {
      console.log('hrReviewRequest: Action: Approve');
      request.status = 'pending_vp_approval';
      await ActivityLog.create({
        userId: req.user._id,
        requestId: request._id,
        action: 'STEP_APPROVED',
        description: `Clearance request approved by HR Officer ${req.user.name}`,
      });
      console.log('hrReviewRequest: Request status set to pending_vp_approval.');
      res.status(200).json({
        success: true,
        message: 'Clearance request sent to VP for approval.',
        data: request,
      });
    } else if (action === 'reject') {
      console.log('hrReviewRequest: Action: Reject');
      if (!rejectionReason) {
        console.log('hrReviewRequest: Rejection reason missing.');
        return next(new AppError('Rejection reason is required for rejection.', 400));
      }
      request.status = 'rejected';
      request.rejectionReason = rejectionReason;
      await ActivityLog.create({
        userId: req.user._id,
        requestId: request._id,
        action: 'HR_REJECTED',
        description: `Clearance request rejected by HR Officer ${req.user.name}. Reason: ${rejectionReason}`,
      });
      console.log('hrReviewRequest: Request status set to rejected.');
      res.status(200).json({
        success: true,
        message: 'Clearance request rejected by HR.',
        data: request,
      });
    } else {
      console.log('hrReviewRequest: Invalid action provided.');
      return next(new AppError('Invalid action. Must be approve or reject', 400));
    }

    console.log('hrReviewRequest: Saving request with status:', request.status);
    await request.save();
    console.log('hrReviewRequest: Request saved successfully.');
  } catch (error) {
    console.error('hrReviewRequest: An unexpected error occurred:', error);
    return next(new AppError('An unexpected error occurred.', 500));
  }
});

// @desc    Approve initial clearance request
// @route   PUT /api/clearance/requests/:id/approve-initial
// @access  Private (VP ARCE)
const approveInitialRequest = asyncHandler(async (req, res, next) => {
  const request = await ClearanceRequest.findById(req.params.id);

  if (!request) {
    return next(new AppError('Clearance request not found', 404));
  }

  if (req.user.role !== 'AcademicVicePresident') {
    return next(new AppError('Not authorized to perform this action', 403));
  }

  if (request.status !== 'pending_vp_approval') {
    return next(new AppError(`Request is not in 'pending_vp_approval' status. Current status: ${request.status}`, 400));
  }

  request.status = 'in_progress';
  await request.save();

  const clearanceSteps = CLEARANCE_DEPARTMENTS.map((dept) => ({
    requestId: request._id,
    department: dept.name,
    reviewerRole: dept.reviewerRole,
    order: dept.order,
  }));

  await ClearanceStep.insertMany(clearanceSteps);

  

  await ActivityLog.create({
    userId: req.user._id,
    requestId: request._id,
    action: 'INITIAL_APPROVAL',
    description: `Initial clearance request approved by ${req.user.name}`,
  });

  res.status(200).json({
    success: true,
    message: 'Clearance request approved and steps created.',
    data: request,
  });
});

// @desc    Reject initial clearance request
// @route   PUT /api/clearance/requests/:id/reject-initial
// @access  Private (VP ARCE)
const rejectInitialRequest = asyncHandler(async (req, res, next) => {
  const { rejectionReason } = req.body;
  const request = await ClearanceRequest.findById(req.params.id);

  if (!request) {
    return next(new AppError('Clearance request not found', 404));
  }

  if (req.user.role !== 'AcademicVicePresident') {
    return next(new AppError('Not authorized to perform this action', 403));
  }

  request.status = 'rejected';
  request.rejectionReason = rejectionReason;
  await request.save();

  await ActivityLog.create({
    userId: req.user._id,
    requestId: request._id,
    action: 'INITIAL_REJECTION',
    description: `Initial clearance request rejected by ${req.user.name}`,
  });

  res.status(200).json({
    success: true,
    message: 'Clearance request rejected.',
    data: request,
  });
});

  

// @desc    Update a clearance step
// @route   PUT /api/clearance/steps/:id
// @access  Private (Reviewer)
const updateClearanceStep = asyncHandler(async (req, res, next) => {
  const { status, comment } = req.body;
  const step = await ClearanceStep.findById(req.params.id);

  if (!step) {
    return next(new AppError('Clearance step not found', 404));
  }

  if (step.reviewerRole !== req.user.role) {
    return next(new AppError('Not authorized to review this step', 403));
  }

  step.status = status;
  if (status === 'pending') {
    step.comment = undefined; // Clear comment when reverting to pending
  } else {
    step.comment = comment;
  }
  step.reviewedBy = req.user._id;
  step.lastUpdatedAt = new Date();
  await step.save();

  await ActivityLog.create({
    userId: req.user._id,
    requestId: step.requestId,
    action: 'STEP_UPDATED',
    description: `Clearance step for ${step.department} updated to ${status} by ${req.user.name}`,
  });

  res.status(200).json({
    success: true,
    message: 'Clearance step updated successfully.',
    data: step,
  });
});

// @desc    Approve final clearance request
// @route   PUT /api/clearance/requests/:id/approve-final
// @access  Private (VP ARCE)
const approveFinalRequest = asyncHandler(async (req, res, next) => {
  const request = await ClearanceRequest.findById(req.params.id);

  if (!request) {
    return next(new AppError('Clearance request not found', 404));
  }

  if (req.user.role !== 'AcademicVicePresident') {
    return next(new AppError('Not authorized to perform this action', 403));
  }

  const steps = await ClearanceStep.find({ requestId: request._id });
  const allCleared = steps.every((step) => step.status === 'cleared');

  if (!allCleared) {
    return next(new AppError('All departments must clear the request before final approval', 400));
  }

  request.status = 'cleared';
  await request.save();

  await ActivityLog.create({
    userId: req.user._id,
    requestId: request._id,
    action: 'FINAL_APPROVAL',
    description: `Final clearance request approved by ${req.user.name}`,
  });

  res.status(200).json({
    success: true,
    message: 'Clearance request has been fully approved and cleared.',
    data: request,
  });
});

// @desc    Get clearance requests for VP review
// @route   GET /api/clearance/requests/vp-review
// @access  Private (VP ARCE)
const getRequestsForVP = asyncHandler(async (req, res, next) => {
  const requests = await ClearanceRequest.find({
    status: 'pending_vp_approval',
  }).populate('initiatedBy', 'name email department').lean();

  const processedRequests = requests.map(processRequestFiles);

  res.status(200).json({
    success: true,
    data: processedRequests,
  });
});

// @desc    Get all clearance requests
// @route   GET /api/clearance/requests
// @access  Private
const getClearanceRequests = asyncHandler(async (req, res) => {
  let query = {};

  // SystemAdmin sees all requests
  if (req.user.role === 'SystemAdmin') {
    // No change to query, gets all
  } 
  // HR Officer sees requests pending their review or rejected by them
  else if (req.user.role === 'HRDevelopmentReviewer') {
    query.status = { $in: ['pending_hr_review', 'rejected'] };
  }
  // Other Reviewers see active requests ready for their review
  else if (req.user.role.includes('Reviewer')) {
    query.status = { $in: ['in_progress', 'cleared'] };
  } 
  // Standard users only see their own requests
  else {
    query.initiatedBy = req.user._id;
  }

  const requests = await ClearanceRequest.find(query)
    .populate('initiatedBy', 'name email department')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: requests,
  });
});

// @desc    Get clearance request by ID
// @route   GET /api/clearance/requests/:id
// @access  Private
const getClearanceRequestById = asyncHandler(async (req, res, next) => {
  const request = await ClearanceRequest.findById(req.params.id).populate(
    'initiatedBy',
    'name email department'
  );

  if (!request) {
    return next(new AppError('Clearance request not found', 404));
  }

  const steps = await ClearanceStep.find({ requestId: req.params.id })
    .populate('reviewedBy', 'name email department')
    .sort({ order: 1 });

  res.status(200).json({
    success: true,
    data: {
      request,
      steps,
    },
  });
});

const getMyReviewSteps = asyncHandler(async (req, res, next) => {
  console.log(`GET_MY_REVIEW_STEPS: User object:`, req.user);
  console.log(`GET_MY_REVIEW_STEPS: Fetching steps for role: ${req.user.role}`);

  // Explicitly check if the user's role includes 'Reviewer'
  if (!req.user.role.includes('Reviewer') && req.user.role !== 'AcademicVicePresident') {
    console.warn(`GET_MY_REVIEW_STEPS: Access denied for role: ${req.user.role}`);
    return next(new AppError(`Access denied. Role '${req.user.role}' is not authorized to access this route.`, 403));
  }

  // Find the correct reviewerRole based on the user's role
  const departmentMapping = CLEARANCE_DEPARTMENTS.find(dept => dept.reviewerRole === req.user.role || dept.name === req.user.role);
  const targetReviewerRole = departmentMapping ? departmentMapping.reviewerRole : req.user.role; // Fallback to user role if no specific mapping
  console.log(`GET_MY_REVIEW_STEPS: Determined targetReviewerRole: ${targetReviewerRole}`);

  try {
    const steps = await ClearanceStep.find({ reviewerRole: targetReviewerRole })
      .populate({
        path: 'requestId',
        select: 'initiatedBy purpose status createdAt formData uploadedFiles',
        populate: {
          path: 'initiatedBy',
          select: 'name',
        },
      }).lean();

    const processedSteps = steps.map(step => {
      if (step.requestId) {
        step.requestId = processRequestFiles(step.requestId);
      }
      return step;
    });

    console.log(`GET_MY_REVIEW_STEPS: Found ${processedSteps.length} steps for reviewerRole: ${targetReviewerRole}.`);
    res.status(200).json({
      success: true,
      data: processedSteps,
    });
  } catch (error) {
    console.error('GET_MY_REVIEW_STEPS: ERROR during database query or population:', error);
    next(error);
  }
});

const processRequestFiles = (request) => {
  const requestObj = request.toObject ? request.toObject() : { ...request };

  if (!requestObj.uploadedFiles) {
    requestObj.uploadedFiles = [];
    return requestObj;
  }

  if (requestObj.formData && requestObj.formData.fileMetadata) {
    const metadataMap = new Map(
      requestObj.formData.fileMetadata.map(meta => [meta.fileName, meta.visibility])
    );
    requestObj.uploadedFiles = requestObj.uploadedFiles.map(file => ({
      ...file,
      visibility: file.visibility || metadataMap.get(file.fileName) || 'all',
    }));
  } else {
    requestObj.uploadedFiles = requestObj.uploadedFiles.map(file => ({
      ...file,
      visibility: file.visibility || 'all',
    }));
  }

  return requestObj;
};

// @desc    Get HR pending requests
// @route   GET /api/clearance/requests/hr-pending
// @access  Private (HROfficer)
const getHRPendingRequests = asyncHandler(async (req, res) => {
  const requests = await ClearanceRequest.find({
    status: 'pending_hr_review',
  }).populate('initiatedBy', 'name email department').lean();

  const processedRequests = requests.map(processRequestFiles);

  res.status(200).json({
    success: true,
    data: processedRequests,
  });
});

module.exports = {
  createClearanceRequest,
  hrReviewRequest,
  approveInitialRequest,
  rejectInitialRequest,
  updateClearanceStep,
  approveFinalRequest,
  getRequestsForVP,
  getClearanceRequests,
  getClearanceRequestById,
  getMyReviewSteps,
  getHRPendingRequests,
};

// 07 77 676744  