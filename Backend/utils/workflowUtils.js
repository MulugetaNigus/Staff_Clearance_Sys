const ClearanceStep = require('../models/ClearanceStep');
const ClearanceRequest = require('../models/ClearanceRequest');
const { ACADEMIC_STAFF_WORKFLOW } = require('../config/workflow');

/**
 * Get workflow status summary for a clearance request
 * @param {String} requestId - The clearance request ID
 * @returns {Object} Workflow status summary
 */
const getWorkflowStatus = async (requestId) => {
  try {
    const request = await ClearanceRequest.findById(requestId);
    const steps = await ClearanceStep.find({ requestId }).populate('reviewedBy', 'name email');

    if (!request || !steps.length) {
      throw new Error('Request or steps not found');
    }

    const stagesSummary = ACADEMIC_STAFF_WORKFLOW.map(workflowStage => {
      const stageSteps = steps.filter(step => step.stage === workflowStage.stage);
      const completedSteps = stageSteps.filter(step => step.status === 'cleared');
      const pendingSteps = stageSteps.filter(step => step.status === 'pending');
      const availableSteps = stageSteps.filter(step => step.status === 'available');
      const rejectedSteps = stageSteps.filter(step => step.status === 'rejected');

      return {
        stage: workflowStage.stage,
        name: workflowStage.name,
        description: workflowStage.description,
        totalSteps: stageSteps.length,
        completedSteps: completedSteps.length,
        pendingSteps: pendingSteps.length,
        availableSteps: availableSteps.length,
        rejectedSteps: rejectedSteps.length,
        isCompleted: completedSteps.length === stageSteps.length,
        canProgress: availableSteps.length > 0,
        steps: stageSteps.map(step => ({
          id: step._id,
          department: step.department,
          reviewerRole: step.reviewerRole,
          status: step.status,
          canProcess: step.canProcess,
          reviewedBy: step.reviewedBy?.name,
          lastUpdatedAt: step.lastUpdatedAt,
          vpSignatureType: step.vpSignatureType
        }))
      };
    });

    const overallProgress = {
      totalSteps: steps.length,
      completedSteps: steps.filter(step => step.status === 'cleared').length,
      pendingSteps: steps.filter(step => step.status === 'pending').length,
      availableSteps: steps.filter(step => step.status === 'available').length,
      rejectedSteps: steps.filter(step => step.status === 'rejected').length,
      completionPercentage: Math.round((steps.filter(step => step.status === 'cleared').length / steps.length) * 100)
    };

    return {
      requestId,
      referenceCode: request.referenceCode,
      status: request.status,
      currentStage: getCurrentStage(request.status),
      vpInitialSigned: !!request.vpInitialSignature,
      vpFinalSigned: !!request.vpFinalSignature,
      isArchived: request.isArchived,
      overallProgress,
      stagesSummary,
      nextAvailableSteps: steps.filter(step => step.status === 'available' && step.canProcess)
    };
  } catch (error) {
    throw new Error(`Error getting workflow status: ${error.message}`);
  }
};

/**
 * Check if a user can process a specific step
 * @param {String} stepId - The clearance step ID
 * @param {String} userId - The user ID
 * @param {String} userRole - The user role
 * @returns {Object} Processing eligibility result
 */
const canUserProcessStep = async (stepId, userId, userRole) => {
  try {
    const step = await ClearanceStep.findById(stepId).populate('requestId');
    
    if (!step) {
      return { canProcess: false, reason: 'Step not found' };
    }

    if (step.reviewerRole !== userRole) {
      return { canProcess: false, reason: 'Role mismatch' };
    }

    if (step.status !== 'available') {
      return { canProcess: false, reason: `Step is ${step.status}` };
    }

    if (!step.canProcess) {
      return { canProcess: false, reason: 'Dependencies not met' };
    }

    if (step.reviewedBy && step.reviewedBy.toString() === userId.toString()) {
      return { canProcess: false, reason: 'Already processed by user' };
    }

    return { canProcess: true, step };
  } catch (error) {
    return { canProcess: false, reason: error.message };
  }
};

/**
 * Get current workflow stage based on request status
 * @param {String} status - Request status
 * @returns {Number} Current stage number
 */
const getCurrentStage = (status) => {
  const stageMap = {
    'initiated': 1,
    'vp_initial_approval': 1,
    'department_review': 1,
    'college_review': 1,
    'property_clearance': 2,
    'finance_clearance': 3,
    'hr_clearance': 4,
    'vp_final_approval': 4,
    'completed': 5,
    'archived': 5
  };
  return stageMap[status] || 1;
};

/**
 * Check interdependent steps completion status
 * @param {String} requestId - The clearance request ID
 * @param {Array} interdependentRoles - Array of interdependent roles
 * @returns {Object} Interdependency status
 */
const checkInterdependentSteps = async (requestId, interdependentRoles) => {
  try {
    const steps = await ClearanceStep.find({ 
      requestId, 
      reviewerRole: { $in: interdependentRoles } 
    });

    const completedSteps = steps.filter(step => step.status === 'cleared');
    const allCompleted = completedSteps.length === interdependentRoles.length;

    return {
      totalRequired: interdependentRoles.length,
      completed: completedSteps.length,
      allCompleted,
      completedRoles: completedSteps.map(step => step.reviewerRole),
      pendingRoles: interdependentRoles.filter(role => 
        !completedSteps.some(step => step.reviewerRole === role)
      )
    };
  } catch (error) {
    throw new Error(`Error checking interdependent steps: ${error.message}`);
  }
};

/**
 * Get available steps for a specific user role
 * @param {String} userRole - The user role
 * @param {String} userId - Optional user ID for filtering
 * @returns {Array} Available steps for the role
 */
const getAvailableStepsForRole = async (userRole, userId = null) => {
  try {
    const query = {
      reviewerRole: userRole,
      status: 'available',
      canProcess: true
    };

    if (userId) {
      query.$or = [
        { reviewedBy: { $exists: false } },
        { reviewedBy: null },
        { reviewedBy: userId }
      ];
    }

    const steps = await ClearanceStep.find(query)
      .populate('requestId', 'referenceCode staffId purpose status')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    return steps.map(step => ({
      id: step._id,
      requestId: step.requestId._id,
      referenceCode: step.requestId.referenceCode,
      staffId: step.requestId.staffId,
      purpose: step.requestId.purpose,
      department: step.department,
      stage: step.stage,
      order: step.order,
      vpSignatureType: step.vpSignatureType,
      isInterdependent: step.isInterdependent,
      interdependentWith: step.interdependentWith,
      lastUpdatedAt: step.lastUpdatedAt
    }));
  } catch (error) {
    throw new Error(`Error getting available steps: ${error.message}`);
  }
};

/**
 * Validate workflow dependencies for a step
 * @param {String} stepId - The clearance step ID
 * @returns {Object} Dependency validation result
 */
const validateStepDependencies = async (stepId) => {
  try {
    const step = await ClearanceStep.findById(stepId);
    
    if (!step) {
      return { isValid: false, reason: 'Step not found' };
    }

    if (!step.dependsOn || step.dependsOn.length === 0) {
      return { isValid: true, dependencies: [] };
    }

    const dependentSteps = await ClearanceStep.find({
      requestId: step.requestId,
      order: { $in: step.dependsOn }
    });

    const unmetDependencies = dependentSteps.filter(depStep => depStep.status !== 'cleared');
    
    if (unmetDependencies.length > 0) {
      return {
        isValid: false,
        reason: 'Dependencies not met',
        unmetDependencies: unmetDependencies.map(dep => ({
          order: dep.order,
          department: dep.department,
          reviewerRole: dep.reviewerRole,
          status: dep.status
        }))
      };
    }

    return { isValid: true, dependencies: dependentSteps.length };
  } catch (error) {
    return { isValid: false, reason: error.message };
  }
};

module.exports = {
  getWorkflowStatus,
  canUserProcessStep,
  getCurrentStage,
  checkInterdependentSteps,
  getAvailableStepsForRole,
  validateStepDependencies
};
