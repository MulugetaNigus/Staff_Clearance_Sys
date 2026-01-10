const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { upload, uploadClearanceFiles, uploadSingleClearanceFile } = require('../middleware/upload');
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
  updateClearanceRequestByOwner,
  replaceUploadedFile,
  addOwnerCommentToStep,
  fixRoleNames,
  getClearedAcademicStaffRequests,
  undoVPInitialDecision,
  undoVPFinalDecision,
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
router.route('/requests/:id/undo-initial').put(protect, authorize('AcademicVicePresident'), undoVPInitialDecision);
router.route('/requests/:id/undo-final').put(protect, authorize('AcademicVicePresident'), undoVPFinalDecision);
router.route('/requests/:id/archive').put(protect, authorize('RecordsArchivesOfficerReviewer'), archiveRequest);
router.route('/requests/:id').get(protect, getClearanceRequestById);
// Allow owners to update their own request form data and files
router.route('/requests/:id').put(protect, uploadClearanceFiles, updateClearanceRequestByOwner);
// Owner can replace an uploaded file with a new one
router.route('/requests/:id/files/:fileId').put(protect, uploadSingleClearanceFile, replaceUploadedFile);

router.route('/steps/:id').put(protect, updateClearanceStep);
router.route('/steps/:id/hide').put(protect, hideClearanceStep);
// Owner can add a comment/response to a step
router.route('/steps/:id/comment').post(protect, addOwnerCommentToStep);

// Temporary fix for role name mismatches
router.route('/fix-roles').post(protect, authorize('SystemAdmin'), fixRoleNames);

module.exports = router;
