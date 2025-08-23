const ClearanceRequest = require('../models/ClearanceRequest');
const ClearanceStep = require('../models/ClearanceStep');
const { asyncHandler } = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// Get all signatures for a specific clearance request
const getSignaturesForRequest = asyncHandler(async (req, res, next) => {
  const { requestId } = req.params;

  // Validate request exists
  const request = await ClearanceRequest.findById(requestId);
  if (!request) {
    return next(new AppError('Clearance request not found', 404));
  }

  // Get all clearance steps with signatures
  const steps = await ClearanceStep.find({ 
    requestId: requestId,
    signature: { $exists: true, $ne: null, $ne: '' }
  }).select('department reviewerRole signature order vpSignatureType');

  // Build signatures object
  const signatures = {};
  
  steps.forEach(step => {
    const key = step.department.toLowerCase().replace(/[^a-z0-9]/g, '');
    signatures[key] = step.signature;
  });

  // Add VP signatures from request if they exist
  if (request.vpInitialSignature) {
    signatures['vpinitialsignature'] = request.vpInitialSignature;
  }
  if (request.vpFinalSignature) {
    signatures['vpfinalsignature'] = request.vpFinalSignature;
  }

  res.status(200).json({
    success: true,
    data: {
      requestId: requestId,
      signatures: signatures,
      signatureCount: Object.keys(signatures).length
    }
  });
});

// Get all available signatures from completed steps (for sample PDF)
const getAllAvailableSignatures = asyncHandler(async (req, res, next) => {
  try {
    // Get sample signatures from various completed steps
    const completedSteps = await ClearanceStep.find({
      status: 'cleared',
      signature: { $exists: true, $ne: null, $ne: '' }
    }).select('department reviewerRole signature order')
      .limit(50) // Limit to avoid too much data
      .sort({ updatedAt: -1 });

    // Build signatures object with department keys
    const signatures = {};
    
    // Group by reviewerRole to get one signature per role type
    const roleSignatures = {};
    completedSteps.forEach(step => {
      if (!roleSignatures[step.reviewerRole]) {
        roleSignatures[step.reviewerRole] = step.signature;
        // Use reviewerRole as key for individual signatures
        const roleKey = step.reviewerRole.toLowerCase().replace(/[^a-z0-9]/g, '');
        signatures[roleKey] = step.signature;
        
        // Also keep department-based key for backward compatibility
        const deptKey = step.department.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!signatures[deptKey]) {
          signatures[deptKey] = step.signature;
        }
      }
    });

    // Add some VP signatures if available
    const vpRequests = await ClearanceRequest.find({
      $or: [
        { vpInitialSignature: { $exists: true, $ne: null, $ne: '' } },
        { vpFinalSignature: { $exists: true, $ne: null, $ne: '' } }
      ]
    }).select('vpInitialSignature vpFinalSignature')
      .limit(5)
      .sort({ updatedAt: -1 });

    if (vpRequests.length > 0) {
      const vpSample = vpRequests[0];
      if (vpSample.vpInitialSignature) {
        signatures['vpinitialsignature'] = vpSample.vpInitialSignature;
      }
      if (vpSample.vpFinalSignature) {
        signatures['vpfinalsignature'] = vpSample.vpFinalSignature;
      }
    }

    // If no real signatures found, provide sample base64 signatures for demonstration
    if (Object.keys(signatures).length === 0) {
      console.log('No real signatures found, providing sample signatures for demo');
      
      // Generate sample signature base64 (proper signature-like image)
      const sampleSignature = 'data:image/png;base64,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';
      
      // Add sample signatures for ALL department names used in CLEARANCE_DEPARTMENTS
      signatures['vicepresidentforacademicresearchcommunityengagement'] = sampleSignature;
      signatures['academicdepartmenthead'] = sampleSignature;
      signatures['collegehead'] = sampleSignature;
      signatures['registrar'] = sampleSignature;
      signatures['studentdean'] = sampleSignature;
      signatures['distanceandcontinuingeducation'] = sampleSignature;
      signatures['researchdirectorate'] = sampleSignature;
      signatures['woldiauniversityemployeesfinanceenterprise'] = sampleSignature;
      signatures['library'] = sampleSignature;
      signatures['generalserviceexecutive'] = sampleSignature;
      signatures['propertyregistrationandcontrolspecialist1'] = sampleSignature;
      signatures['propertyregistrationandcontrolspecialist2'] = sampleSignature;
      signatures['treasurer'] = sampleSignature;
      signatures['ethicsandanticorruptionmonitoringexecutive'] = sampleSignature;
      signatures['ictexecutive'] = sampleSignature;
      signatures['communityengagementdirectorate'] = sampleSignature;
      signatures['competencyandhrmanagementexecutive'] = sampleSignature;
      signatures['officeandclassroomfacilitiesspecialist'] = sampleSignature;
      signatures['caseexecutive'] = sampleSignature;
      signatures['store1officer'] = sampleSignature;
      signatures['store2officer'] = sampleSignature;
      signatures['propertyexecutivedirector'] = sampleSignature;
      signatures['financeexecutive'] = sampleSignature;
      signatures['seniorfinancespecialist'] = sampleSignature;
      signatures['internalauditexecutivedirector'] = sampleSignature;
      signatures['hrcompetencyanddevelopmentteamleader'] = sampleSignature;
      signatures['recordsandarchivesofficer'] = sampleSignature;
      signatures['academicvicepresidentfinaloversight'] = sampleSignature;
    }

    res.status(200).json({
      success: true,
      data: {
        signatures: signatures,
        signatureCount: Object.keys(signatures).length,
        availableRoles: Object.keys(roleSignatures),
        isSampleData: Object.keys(signatures).length > 0 && completedSteps.length === 0
      }
    });

  } catch (error) {
    console.error('Error fetching available signatures:', error);
    return next(new AppError('Failed to fetch available signatures', 500));
  }
});

// Get signature by reviewer role
const getSignatureByRole = asyncHandler(async (req, res, next) => {
  const { role } = req.params;

  try {
    // Find the most recent completed step with signature for this role
    const step = await ClearanceStep.findOne({
      reviewerRole: role,
      status: 'cleared',
      signature: { $exists: true, $ne: null, $ne: '' }
    }).select('signature department')
      .sort({ updatedAt: -1 });

    if (!step) {
      return res.status(200).json({
        success: true,
        data: {
          signature: null,
          message: `No signature found for role: ${role}`
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        signature: step.signature,
        department: step.department,
        role: role
      }
    });

  } catch (error) {
    console.error(`Error fetching signature for role ${role}:`, error);
    return next(new AppError('Failed to fetch signature for role', 500));
  }
});

module.exports = {
  getSignaturesForRequest,
  getAllAvailableSignatures,
  getSignatureByRole
};
