const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadClearanceFiles } = require('../middleware/upload');
const {
  createClearanceRequest,
  approveInitialRequest,
  rejectInitialRequest,
  updateClearanceStep,
  approveFinalRequest,
  rejectFinalRequest,
  archiveRequest,
  getRequestsForVP,
  getClearanceRequests,
  getClearanceRequestById,
  getMyReviewSteps,
  hideClearanceStep,
  fixRoleNames,
  getClearedAcademicStaffRequests,
} = require('../controllers/clearanceController');

// New route for reviewers to get their assigned steps
router.route('/steps/my-reviews').get(protect, getMyReviewSteps);

// Admin route to get cleared academic staff requests
router.route('/requests/cleared-academic-staff').get(protect, authorize('SystemAdmin'), getClearedAcademicStaffRequests);

// Existing Routes...
router.route('/requests').post(protect, uploadClearanceFiles, createClearanceRequest);
router.route('/requests').get(protect, getClearanceRequests);
router.route('/requests/vp-review').get(protect, authorize('AcademicVicePresident'), getRequestsForVP);
router.route('/requests/:id/approve-initial').put(protect, authorize('AcademicVicePresident'), approveInitialRequest);
router.route('/requests/:id/reject-initial').put(protect, authorize('AcademicVicePresident'), rejectInitialRequest);
router.route('/requests/:id/approve-final').put(protect, authorize('AcademicVicePresident'), approveFinalRequest);
router.route('/requests/:id/reject-final').put(protect, authorize('AcademicVicePresident'), rejectFinalRequest);
router.route('/requests/:id/archive').put(protect, authorize('RecordsArchivesOfficerReviewer'), archiveRequest);
router.route('/requests/:id').get(protect, getClearanceRequestById);
router.route('/steps/:id').put(protect, updateClearanceStep);
router.route('/steps/:id/hide').put(protect, hideClearanceStep);

// Temporary fix for role name mismatches
router.route('/fix-roles').post(protect, authorize('SystemAdmin'), fixRoleNames);

module.exports = router;
