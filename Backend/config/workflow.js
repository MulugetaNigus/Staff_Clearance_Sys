const WORKFLOW_STAGES = {
  INITIAL: 'Initial',
  MIDDLE: 'Middle',
  FINAL: 'Final',
  VP_REVIEW: 'VP Review',
  HR_SUBMISSION: 'HR Submission',
  ARCHIVED: 'Archived',
};

const ACADEMIC_STAFF_WORKFLOW = [
  {
    stage: WORKFLOW_STAGES.INITIAL,
    name: 'Immediate Supervisor Approval',
    roles: ['DepartmentReviewer'],
    order: 1,
    isSequential: true,
  },
  {
    stage: WORKFLOW_STAGES.MIDDLE,
    name: 'Department Clearances',
    roles: [
      'EmployeeFinanceReviewer',
      'LibraryReviewer',
      'PropertyDirectorReviewer',
      'Store1Reviewer',
      'Store2Reviewer',
      'GeneralServiceReviewer',
      'ICTReviewer',
      'StudentDeanReviewer',
      'RegistrarReviewer',
      'ResearchDirectorateReviewer',
      'CollegeReviewer',
      'InternalAuditReviewer',
      'FinanceExecutiveReviewer',
      'FinanceSpecialistReviewer',
      'TreasurerReviewer',
      'EthicsReviewer',
      'CommunityEngagementReviewer',
      'RecordsArchivesReviewer',
      'FacilitiesReviewer',
    ],
    order: 2,
    isSequential: false, // These can be signed in any order
  },
  {
    stage: WORKFLOW_STAGES.FINAL,
    name: 'Final Approvals',
    roles: ['CaseExecutiveReviewer', 'HRDevelopmentReviewer'], // Assuming #28 is HRDevelopmentReviewer
    order: 3,
    isSequential: true,
  },
  {
    stage: WORKFLOW_STAGES.VP_REVIEW,
    name: 'Vice President Review',
    roles: ['AcademicVicePresident'],
    order: 4,
    isSequential: true,
  },
  {
    stage: WORKFLOW_STAGES.HR_SUBMISSION,
    name: 'HR Submission',
    roles: ['HumanResources'],
    order: 5,
    isSequential: true,
  },
];

module.exports = {
  ACADEMIC_STAFF_WORKFLOW,
  WORKFLOW_STAGES,
};
