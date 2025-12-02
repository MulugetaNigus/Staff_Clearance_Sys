const { asyncHandler } = require('../utils/asyncHandler');
const ClearanceRequest = require('../models/ClearanceRequest');
const ClearanceStep = require('../models/ClearanceStep');
const ActivityLog = require('../models/ActivityLog');
const { ACADEMIC_STAFF_WORKFLOW } = require('../config/workflow');
const AppError = require('../utils/AppError');

const createClearanceRequest = asyncHandler(async (req, res, next) => {
  const { formData } = req.body;
  const initiatedBy = req.user._id;

  if (!formData) {
    return next(new AppError('Form data is required', 400));
  }

  const parsedFormData = JSON.parse(formData);
  console.log('Parsed Form Data:', parsedFormData);
  const { purpose, teacherId, department, firstName, lastName, phoneNumber, fileMetadata } = parsedFormData;

  // Validate required fields
  if (!purpose || !teacherId || !department) {
    return next(new AppError('Purpose, teacherId and department are required in formData', 400));
  }

  // Validate staff information fields
  if (!firstName || !lastName || !phoneNumber) {
    return next(new AppError('First name, last name, and phone number are required', 400));
  }

  // Validate department match with user's actual department
  const actualDepartment = req.user.department;
  const submittedDepartment = department.trim();
  const actualDeptLower = actualDepartment.trim().toLowerCase();
  const submittedDeptLower = submittedDepartment.toLowerCase();

  if (submittedDeptLower !== actualDeptLower) {
    return next(new AppError(
      `Department mismatch. Your registered department is "${actualDepartment}". Please enter the correct department.`,
      400
    ));
  }

  const staffId = teacherId;

  // Generate a unique reference code
  const referenceCode = `CL-${Date.now()}-${staffId}`;

  const uploadedFiles = req.files?.map(file => {
    const metadata = fileMetadata?.find(meta => meta.fileName === file.originalname);
    return {
      fileName: file.originalname,
      filePath: file.path,
      mimetype: file.mimetype,
      size: file.size,
      visibility: metadata ? metadata.visibility : 'all',
    };
  }) || [];

  const newRequest = await ClearanceRequest.create({
    referenceCode,
    staffId,
    purpose,
    formData: parsedFormData, // This includes firstName, lastName, phoneNumber, department
    initiatedBy,
    status: 'initiated',
    uploadedFiles,
  });

  // Create clearance steps with enhanced workflow data
  const steps = ACADEMIC_STAFF_WORKFLOW.flatMap(workflowStep =>
    workflowStep.roles.map(role => ({
      requestId: newRequest._id,
      department: workflowStep.name,
      reviewerRole: role,
      order: workflowStep.order,
      stage: workflowStep.stage,
      description: workflowStep.description,
      isSequential: workflowStep.isSequential,
      dependsOn: workflowStep.dependsOn || [],
      isInterdependent: workflowStep.isInterdependent || false,
      interdependentWith: workflowStep.interdependentWith || [],
      vpSignatureType: workflowStep.vpSignatureType,
      canProcess: workflowStep.order === 1 ? true : false, // Only first step can be processed initially
      status: workflowStep.order === 1 ? 'available' : 'pending', // Only first step is available initially
    }))
  );

  await ClearanceStep.insertMany(steps);

  await ActivityLog.create({
    userId: initiatedBy,
    action: 'REQUEST_CREATED',
    description: `Clearance request created for ${req.user.name} with purpose: ${purpose}`,
  });

  res.status(201).json({
    success: true,
    data: newRequest,
  });
});

const approveInitialRequest = asyncHandler(async (req, res, next) => {
  const { id: requestId } = req.params;
  const { signature } = req.body;
  const userId = req.user._id;

  // Debug logging
  console.log('INITIAL APPROVAL DEBUG:');
  console.log(`Request ID attempting to approve: ${requestId}`);
  console.log(`User: ${req.user.name} (${req.user.role})`);

  // Verify user is Academic VP
  if (req.user.role !== 'AcademicVicePresident') {
    return next(new AppError('Only Academic Vice President can perform initial approval', 403));
  }

  const request = await ClearanceRequest.findById(requestId);
  console.log(`Request found in database: ${request ? 'YES' : 'NO'}`);

  if (!request) {
    // Let's check if any requests exist with similar IDs
    const allRequests = await ClearanceRequest.find({}).select('_id referenceCode initiatedBy').populate('initiatedBy', 'name');
    console.log('All existing requests in database:');
    allRequests.forEach(req => {
      console.log(`- ID: ${req._id}, Reference: ${req.referenceCode}, User: ${req.initiatedBy.name}`);
    });
    return next(new AppError('Clearance request not found', 404));
  }

  if (request.status !== 'initiated') {
    return next(new AppError('Request is not in initiated status', 400));
  }

  // Update the VP initial step
  const vpInitialStep = await ClearanceStep.findOneAndUpdate(
    { requestId, reviewerRole: 'AcademicVicePresident', order: 1 },
    {
      status: 'cleared',
      reviewedBy: userId,
      signature,
      lastUpdatedAt: new Date()
    },
    { new: true }
  );

  if (!vpInitialStep) {
    return next(new AppError('VP initial step not found', 404));
  }

  // Update request status and signature
  request.status = 'vp_initial_approval';
  request.vpInitialSignature = signature;
  request.vpInitialSignedAt = new Date();
  request.initialApprovedAt = new Date();
  await request.save();

  // Update workflow - make next steps available
  await updateWorkflowAvailability(requestId);

  await ActivityLog.create({
    userId,
    action: 'INITIAL_APPROVAL',
    description: `Academic VP provided initial validation for clearance request ${request.referenceCode}`,
  });

  res.status(200).json({
    success: true,
    message: 'Initial approval completed successfully',
    data: request,
  });
});

const rejectInitialRequest = asyncHandler(async (req, res, next) => {
  const { requestId } = req.params;
  const { rejectionReason } = req.body;
  const userId = req.user._id;

  // Verify user is Academic VP
  if (req.user.role !== 'AcademicVicePresident') {
    return next(new AppError('Only Academic Vice President can reject requests', 403));
  }

  if (!rejectionReason) {
    return next(new AppError('Rejection reason is required', 400));
  }

  try {
    const request = await ClearanceRequest.findById(requestId);
    if (!request) {
      return next(new AppError('Clearance request not found', 404));
    }

    if (request.status !== 'initiated') {
      return next(new AppError('Request is not in initiated status', 400));
    }

    // Update request status
    request.status = 'rejected';
    request.rejectionReason = rejectionReason;
    request.rejectedAt = new Date();
    request.reviewedBy = userId;
    await request.save();

    await ActivityLog.create({
      userId,
      action: 'VP_INITIAL_REJECTION',
      description: `Academic VP rejected clearance request ${request.referenceCode}: ${rejectionReason}`,
    });

    res.status(200).json({
      success: true,
      message: 'Request rejected successfully',
      data: request,
    });
  } catch (error) {
    return next(new AppError('Failed to reject request', 500));
  }
});

const updateClearanceStep = asyncHandler(async (req, res, next) => {
  const { id: stepId } = req.params;
  const { status, signature, comment, notes } = req.body;
  const userId = req.user._id;
  const userRole = req.user.role;

  console.log('UPDATE STEP DEBUG:');
  console.log(`Step ID: ${stepId}`);
  console.log(`User: ${req.user.name} (${userRole})`);

  const step = await ClearanceStep.findById(stepId).populate('requestId');
  if (!step) {
    // Check if step exists with different role name
    const allSteps = await ClearanceStep.find({}).select('_id reviewerRole department order');
    console.log(`Step ${stepId} not found. All existing steps:`);
    allSteps.forEach(s => {
      console.log(`- ID: ${s._id}, Role: ${s.reviewerRole}, Dept: ${s.department}, Order: ${s.order}`);
    });
    return next(new AppError('Clearance step not found', 404));
  }

  console.log(`Found step: Role=${step.reviewerRole}, User Role=${userRole}, Match=${step.reviewerRole === userRole}`);

  // Verify user has permission to update this step
  if (step.reviewerRole !== userRole) {
    return next(new AppError('You do not have permission to update this step', 403));
  }

  // Verify step can be processed (dependencies met)
  if (!step.canProcess) {
    return next(new AppError('This step cannot be processed yet. Dependencies not met.', 400));
  }

  // Handle interdependent steps (Store 1 & Store 2)
  if (step.isInterdependent && status === 'cleared') {
    await handleInterdependentSteps(step.requestId._id, step.reviewerRole, userId, signature, comment, notes);
  } else {
    // Regular step update
    step.status = status;
    step.reviewedBy = userId;
    step.signature = signature;
    step.comment = comment;
    step.notes = notes;
    step.lastUpdatedAt = new Date();
    await step.save();
  }

  // Update workflow availability
  await updateWorkflowAvailability(step.requestId._id);

  // Check if all steps are completed
  await checkAndCompleteRequest(step.requestId._id);

  await ActivityLog.create({
    userId,
    action: 'STEP_UPDATED',
    description: `${step.department} step updated to ${status} by ${req.user.name}`,
  });

  res.status(200).json({
    success: true,
    message: 'Step updated successfully',
    data: step,
  });
});


const getRequestsForVP = asyncHandler(async (req, res, next) => {
  // Verify user is Academic VP
  if (req.user.role !== 'AcademicVicePresident') {
    return next(new AppError('Only Academic Vice President can access VP requests', 403));
  }

  try {
    // Get requests that need initial VP approval or final VP approval
    const initialApprovalRequests = await ClearanceRequest.find({
      status: 'initiated'
    })
      .populate('initiatedBy', 'name email department')
      .sort({ createdAt: -1 });

    const finalApprovalRequests = await ClearanceRequest.find({
      status: 'in_progress',
      vpInitialSignature: { $exists: true },
      vpFinalSignature: { $exists: false }
    })
      .populate('initiatedBy', 'name email department')
      .sort({ createdAt: -1 });

    // Check if final approval requests actually have all other steps completed
    const validFinalApprovalRequests = [];
    for (const request of finalApprovalRequests) {
      const allSteps = await ClearanceStep.find({ requestId: request._id });
      const vpFinalStep = allSteps.find(step => step.reviewerRole === 'AcademicVicePresident' && step.vpSignatureType === 'final');

      if (vpFinalStep && vpFinalStep.canProcess) {
        validFinalApprovalRequests.push(request);
      }
    }

    const allRequests = [...initialApprovalRequests, ...validFinalApprovalRequests];

    // Debug logging
    console.log('VP REQUESTS DEBUG:');
    console.log(`Initial approval requests: ${initialApprovalRequests.length}`);
    console.log(`Final approval requests: ${validFinalApprovalRequests.length}`);
    allRequests.forEach(req => {
      console.log(`- Request ID: ${req._id}, Status: ${req.status}, Initiated By: ${req.initiatedBy.name}`);
    });

    res.status(200).json({
      success: true,
      data: allRequests,
    });
  } catch (error) {
    return next(new AppError('Failed to fetch VP requests', 500));
  }
});

const getClearanceRequests = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  try {
    const requests = await ClearanceRequest.find({ initiatedBy: userId })
      .populate('initiatedBy', 'name email')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    return next(new AppError('Failed to fetch clearance requests', 500));
  }
});

const getClearanceRequestById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    const request = await ClearanceRequest.findById(id)
      .populate('initiatedBy', 'name email')
      .populate('reviewedBy', 'name email');

    if (!request) {
      return next(new AppError('Clearance request not found', 404));
    }

    // Check if user has permission to view this request
    if (request.initiatedBy._id.toString() !== userId.toString() && !req.user.role.includes('Reviewer') && req.user.role !== 'SystemAdmin') {
      return next(new AppError('You do not have permission to view this request', 403));
    }

    // Get all steps for this request
    const steps = await ClearanceStep.find({ requestId: id })
      .populate('reviewedBy', 'name email')
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: { ...request.toObject(), steps },
    });
  } catch (error) {
    return next(new AppError('Failed to fetch clearance request', 500));
  }
});

const getMyReviewSteps = asyncHandler(async (req, res, next) => {
  const userRole = req.user.role;

  try {
    // Debug logging for Department Head and College Head
    if (userRole === 'DepartmentHeadReviewer' || userRole === 'DepartmentReviewer' || userRole.includes('Department')) {
      console.log('DEPARTMENT HEAD DEBUG:');
      console.log(`User: ${req.user.name} (${userRole})`);

      // Check all steps for this role
      const allSteps = await ClearanceStep.find({ reviewerRole: userRole })
        .populate('requestId', 'referenceCode status vpInitialSignature')
        .sort({ createdAt: -1 });

      console.log(`Total steps for ${userRole}: ${allSteps.length}`);
      allSteps.forEach(step => {
        console.log(`- Step ID: ${step._id}, Order: ${step.order}, Status: ${step.status}, CanProcess: ${step.canProcess}, Request: ${step.requestId?.referenceCode}, Request Status: ${step.requestId?.status}, VP Initial: ${!!step.requestId?.vpInitialSignature}`);
      });
    }

    // Debug logging for College Head
    if (userRole === 'CollegeHeadReviewer' || userRole === 'CollegeReviewer' || userRole.includes('College')) {
      console.log('COLLEGE HEAD DEBUG:');
      console.log(`User: ${req.user.name} (${userRole})`);

      // Check all steps for this role
      const allSteps = await ClearanceStep.find({ reviewerRole: userRole })
        .populate('requestId', 'referenceCode status vpInitialSignature')
        .sort({ createdAt: -1 });

      console.log(`Total steps for ${userRole}: ${allSteps.length}`);
      allSteps.forEach(step => {
        console.log(`- Step ID: ${step._id}, Order: ${step.order}, Status: ${step.status}, CanProcess: ${step.canProcess}, Request: ${step.requestId?.referenceCode}, Request Status: ${step.requestId?.status}, VP Initial: ${!!step.requestId?.vpInitialSignature}`);
      });
    }

    // Find all steps assigned to the current user's role (excluding pending steps)
    const steps = await ClearanceStep.find({
      reviewerRole: userRole,
      hiddenFor: { $ne: req.user._id },
      status: { $ne: 'pending' } // Only show steps that are available, cleared, or have issues
    })
      .populate({
        path: 'requestId',
        populate: {
          path: 'initiatedBy',
          select: 'name email department'
        }
      })
      .sort({ 'requestId.createdAt': -1, order: 1 });

    res.status(200).json({
      success: true,
      data: steps,
    });
  } catch (error) {
    return next(new AppError('Failed to fetch review steps', 500));
  }
});

const hideClearanceStep = asyncHandler(async (req, res, next) => {
  const { stepId } = req.params;
  const userId = req.user._id;

  try {
    const step = await ClearanceStep.findById(stepId);
    if (!step) {
      return next(new AppError('Clearance step not found', 404));
    }

    // Add user to hiddenFor array if not already present
    if (!step.hiddenFor.includes(userId)) {
      step.hiddenFor.push(userId);
      await step.save();
    }

    await ActivityLog.create({
      userId,
      action: 'STEP_HIDDEN',
      description: `Hidden clearance step for ${step.department}`,
    });

    res.status(200).json({
      success: true,
      message: 'Step hidden successfully',
    });
  } catch (error) {
    return next(new AppError('Failed to hide clearance step', 500));
  }
});

const verifyClearanceRequest = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  try {
    const request = await ClearanceRequest.findById(id)
      .populate('initiatedBy', 'name email department')
      .select('-__v');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Clearance request not found',
      });
    }

    // Get all steps for verification
    const steps = await ClearanceStep.find({ requestId: id })
      .populate('reviewedBy', 'name email')
      .sort({ order: 1 })
      .select('-__v');

    // Public verification data (no sensitive information)
    const verificationData = {
      referenceCode: request.referenceCode,
      staffName: request.initiatedBy.name,
      department: request.formData.department,
      purpose: request.purpose,
      status: request.status,
      initiatedAt: request.initiatedAt,
      completedAt: request.completedAt,
      archivedAt: request.archivedAt,
      stepsCompleted: steps.filter(step => step.status === 'cleared').length,
      totalSteps: steps.length,
      isValid: request.status === 'cleared' || request.status === 'archived',
    };

    res.status(200).json({
      success: true,
      data: verificationData,
    });
  } catch (error) {
    return next(new AppError('Failed to verify clearance request', 500));
  }
});

// Helper function to update workflow step availability based on dependencies
const updateWorkflowAvailability = async (requestId) => {
  const allSteps = await ClearanceStep.find({ requestId }).sort({ order: 1 });

  for (const step of allSteps) {
    if (step.status === 'cleared') {
      continue; // Skip already cleared steps
    }

    // Check if all dependencies are met
    const dependenciesMet = await checkDependencies(step, allSteps);

    if (dependenciesMet && !step.canProcess) {
      step.canProcess = true;
      step.status = 'available';
      await step.save();
    } else if (!dependenciesMet && step.canProcess) {
      step.canProcess = false;
      step.status = 'pending';
      await step.save();
    }
  }
};

// Helper function to check if step dependencies are satisfied
const checkDependencies = async (step, allSteps) => {
  if (!step.dependsOn || step.dependsOn.length === 0) {
    return true; // No dependencies
  }

  // Check if all dependent steps are cleared
  for (const dependentOrder of step.dependsOn) {
    const dependentSteps = allSteps.filter(s => s.order === dependentOrder);
    const allCleared = dependentSteps.every(s => s.status === 'cleared');

    if (!allCleared) {
      return false;
    }
  }

  return true;
};

// Helper function to handle interdependent steps (Store 1 & Store 2)
const handleInterdependentSteps = async (requestId, reviewerRole, userId, signature, comment, notes) => {
  const interdependentSteps = await ClearanceStep.find({
    requestId,
    isInterdependent: true,
    interdependentWith: { $in: [reviewerRole] }
  });

  // Update the current step
  const currentStep = interdependentSteps.find(step => step.reviewerRole === reviewerRole);
  if (currentStep) {
    currentStep.status = 'cleared';
    currentStep.reviewedBy = userId;
    currentStep.signature = signature;
    currentStep.comment = comment;
    currentStep.notes = notes;
    currentStep.lastUpdatedAt = new Date();
    await currentStep.save();
  }

  // Check if all interdependent steps are now cleared
  const allInterdependentCleared = interdependentSteps.every(step =>
    step.status === 'cleared' || step.reviewerRole === reviewerRole
  );

  if (allInterdependentCleared) {
    // Update all interdependent steps to cleared if not already
    for (const step of interdependentSteps) {
      if (step.reviewerRole !== reviewerRole && step.status !== 'cleared') {
        step.status = 'available';
        step.canProcess = true;
        await step.save();
      }
    }
  }
};

// Helper function to check if request is complete and update status
const checkAndCompleteRequest = async (requestId) => {
  const allSteps = await ClearanceStep.find({ requestId });
  const allCleared = allSteps.every(step => step.status === 'cleared');

  if (allCleared) {
    const request = await ClearanceRequest.findById(requestId);
    if (request && request.status !== 'cleared') {
      request.status = 'cleared';
      request.completedAt = new Date();
      await request.save();

      await ActivityLog.create({
        userId: request.initiatedBy,
        action: 'REQUEST_COMPLETED',
        description: `Clearance request ${request.referenceCode} has been fully completed`,
      });
    }
  }
};

// Final VP approval (second signature)
const approveFinalRequest = asyncHandler(async (req, res, next) => {
  const { requestId } = req.params;
  const { signature } = req.body;
  const userId = req.user._id;

  // Verify user is Academic VP
  if (req.user.role !== 'AcademicVicePresident') {
    return next(new AppError('Only Academic Vice President can perform final approval', 403));
  }

  const request = await ClearanceRequest.findById(requestId);
  if (!request) {
    return next(new AppError('Clearance request not found', 404));
  }

  // Find VP final step
  const vpFinalStep = await ClearanceStep.findOne({
    requestId,
    reviewerRole: 'AcademicVicePresident',
    // Removed hardcoded order check to be more robust, or updated to 12
    vpSignatureType: 'final'
  });

  if (!vpFinalStep) {
    return next(new AppError('VP final step not found', 404));
  }

  if (!vpFinalStep.canProcess) {
    return next(new AppError('Cannot process final approval. Dependencies not met.', 400));
  }

  // Update the VP final step
  vpFinalStep.status = 'cleared';
  vpFinalStep.reviewedBy = userId;
  vpFinalStep.signature = signature;
  vpFinalStep.lastUpdatedAt = new Date();
  await vpFinalStep.save();

  // Update request with VP final signature
  request.vpFinalSignature = signature;
  request.vpFinalSignedAt = new Date();
  await request.save();

  // Update workflow availability
  await updateWorkflowAvailability(requestId);

  await ActivityLog.create({
    userId,
    action: 'VP_FINAL_APPROVAL',
    description: `Academic VP provided final oversight approval for clearance request ${request.referenceCode}`,
  });

  res.status(200).json({
    success: true,
    message: 'Final VP approval completed successfully',
    data: request,
  });
});

// Archive request (final step)
const archiveRequest = asyncHandler(async (req, res, next) => {
  const { requestId } = req.params;
  const { signature } = req.body;
  const userId = req.user._id;

  // Verify user is Records Archives Officer
  if (req.user.role !== 'RecordsArchivesReviewer') {
    return next(new AppError('Only Records and Archives Officer can archive requests', 403));
  }

  const request = await ClearanceRequest.findById(requestId);
  if (!request) {
    return next(new AppError('Clearance request not found', 404));
  }

  // Find archive step
  const archiveStep = await ClearanceStep.findOne({
    requestId,
    reviewerRole: 'RecordsArchivesReviewer',
    order: 13
  });

  if (!archiveStep || !archiveStep.canProcess) {
    return next(new AppError('Cannot archive request. Dependencies not met.', 400));
  }

  // Update archive step
  archiveStep.status = 'cleared';
  archiveStep.reviewedBy = userId;
  archiveStep.signature = signature;
  archiveStep.lastUpdatedAt = new Date();
  await archiveStep.save();

  // Update request status to archived
  request.status = 'archived';
  request.archivedAt = new Date();
  await request.save();

  await ActivityLog.create({
    userId,
    action: 'REQUEST_ARCHIVED',
    description: `Clearance request ${request.referenceCode} has been archived by Records and Archives Officer`,
  });

  res.status(200).json({
    success: true,
    message: 'Request archived successfully',
    data: request,
  });
});

// Quick fix for role name mismatches
const fixRoleNames = asyncHandler(async (req, res, next) => {
  try {
    // Update Department Head role names
    const deptResult = await ClearanceStep.updateMany(
      { reviewerRole: 'DepartmentHeadReviewer' },
      { reviewerRole: 'DepartmentReviewer' }
    );

    // Update College Head role names  
    const collegeResult = await ClearanceStep.updateMany(
      { reviewerRole: 'CollegeHeadReviewer' },
      { reviewerRole: 'CollegeReviewer' }
    );

    res.status(200).json({
      success: true,
      message: 'Role names updated successfully',
      data: {
        departmentStepsUpdated: deptResult.modifiedCount,
        collegeStepsUpdated: collegeResult.modifiedCount
      }
    });
  } catch (error) {
    return next(new AppError('Failed to update role names', 500));
  }
});

// Get all cleared requests for Academic Staff (Admin only)
const getClearedAcademicStaffRequests = asyncHandler(async (req, res, next) => {
  // Verify user is System Admin
  if (req.user.role !== 'SystemAdmin') {
    return next(new AppError('Only System Administrators can access this data', 403));
  }

  try {
    // Find all cleared requests
    const clearedRequests = await ClearanceRequest.find({
      status: 'cleared'
    })
      .populate('initiatedBy', 'name email department staffId role')
      .sort({ completedAt: -1 });

    // Filter for Academic Staff only
    const academicStaffRequests = clearedRequests.filter(req =>
      req.initiatedBy && req.initiatedBy.role === 'AcademicStaff'
    );

    res.status(200).json({
      success: true,
      count: academicStaffRequests.length,
      data: academicStaffRequests
    });
  } catch (error) {
    return next(new AppError('Failed to fetch cleared academic staff requests', 500));
  }
});

module.exports = {
  createClearanceRequest,
  approveInitialRequest,
  rejectInitialRequest,
  updateClearanceStep,
  approveFinalRequest,
  archiveRequest,
  getRequestsForVP,
  getClearanceRequests,
  getClearanceRequestById,
  getMyReviewSteps,
  hideClearanceStep,
  verifyClearanceRequest,
  updateWorkflowAvailability,
  handleInterdependentSteps,
  checkAndCompleteRequest,
  fixRoleNames,
  getClearedAcademicStaffRequests
};