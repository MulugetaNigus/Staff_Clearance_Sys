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
  getRequestsForVP,
  getClearanceRequests,
  getClearanceRequestById,
  getMyReviewSteps,
  hrReviewRequest,
  getHRPendingRequests,
} = require('../controllers/clearanceController');

// New route for reviewers to get their assigned steps
router.route('/steps/my-reviews').get(protect, getMyReviewSteps);

// Existing Routes...
router.route('/requests').post(protect, uploadClearanceFiles, createClearanceRequest);
router.route('/requests/:id/hr-review').put(protect, authorize('HROfficer', 'HRDevelopmentReviewer'), hrReviewRequest);
router.route('/requests').get(protect, getClearanceRequests);
router.route('/requests/vp-review').get(protect, authorize('AcademicVicePresident'), getRequestsForVP);
router.route('/requests/hr-pending').get(protect, authorize('HROfficer', 'HRDevelopmentReviewer'), getHRPendingRequests);
router.route('/requests/:id/approve-initial').put(protect, authorize('AcademicVicePresident'), approveInitialRequest);
router.route('/:id/reject-initial').put(protect, authorize('AcademicVicePresident'), rejectInitialRequest);
router.route('/requests/:id/approve-final').put(protect, authorize('AcademicVicePresident'), approveFinalRequest);
router.route('/requests/:id').get(protect, getClearanceRequestById);
router.route('/steps/:id').put(protect, updateClearanceStep);

module.exports = router;