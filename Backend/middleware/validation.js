const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User creation validation
exports.validateUserCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('role')
    .isIn([
      'AcademicStaff', 'SystemAdmin', 'AcademicVicePresident', 'Registrar', 'HumanResources',
      'AcademicDepartmentReviewer', 'RegistrarReviewer', 'StudentDeanReviewer',
      'DistanceEducationReviewer', 'ResearchDirectorateReviewer', 'CollegeReviewer',
      'DepartmentReviewer', 'EmployeeFinanceReviewer', 'LibraryReviewer',
      'GeneralServiceReviewer', 'PropertyDirectorReviewer', 'Store1Reviewer',
      'Store2Reviewer', 'PropertySpecialist1Reviewer', 'PropertySpecialist2Reviewer',
      'InternalAuditReviewer', 'FinanceExecutiveReviewer', 'FinanceSpecialistReviewer',
      'TreasurerReviewer', 'EthicsReviewer', 'ICTReviewer', 'CommunityEngagementReviewer',
      'HRManagementReviewer', 'RecordsArchivesReviewer', 'FacilitiesReviewer',
      'CaseExecutiveReviewer', 'HRDevelopmentReviewer'
    ])
    .withMessage('Invalid role provided'),
  
  body('department')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Department must be between 2 and 100 characters'),
  
  handleValidationErrors
];

// User update validation
exports.validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('role')
    .optional()
    .isIn([
      'AcademicStaff', 'SystemAdmin', 'AcademicVicePresident', 'Registrar', 'HumanResources',
      'AcademicDepartmentReviewer', 'RegistrarReviewer', 'StudentDeanReviewer',
      'DistanceEducationReviewer', 'ResearchDirectorateReviewer', 'CollegeReviewer',
      'DepartmentReviewer', 'EmployeeFinanceReviewer', 'LibraryReviewer',
      'GeneralServiceReviewer', 'PropertyDirectorReviewer', 'Store1Reviewer',
      'Store2Reviewer', 'PropertySpecialist1Reviewer', 'PropertySpecialist2Reviewer',
      'InternalAuditReviewer', 'FinanceExecutiveReviewer', 'FinanceSpecialistReviewer',
      'TreasurerReviewer', 'EthicsReviewer', 'ICTReviewer', 'CommunityEngagementReviewer',
      'HRManagementReviewer', 'RecordsArchivesReviewer', 'FacilitiesReviewer',
      'CaseExecutiveReviewer', 'HRDevelopmentReviewer'
    ])
    .withMessage('Invalid role provided'),
  
  body('department')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Department must be between 2 and 100 characters'),
  
  handleValidationErrors
];

// Report generation validation
exports.validateReportGeneration = [
  body('reportType')
    .isIn(['clearance-progress', 'completion-stats', 'user-activity', 'system-health'])
    .withMessage('Invalid report type'),
  
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  
  handleValidationErrors
];

// Login validation
exports.validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  handleValidationErrors
];
