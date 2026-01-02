const WORKFLOW_STAGES = {
  INITIATION: 'Initiation',
  CONDITIONAL_INTERDEPENDENT: 'Conditional & Interdependent Clearances',
  FINANCIAL_CLEARANCE: 'Financial Clearance',
  FINAL_APPROVALS: 'Human Resource & Final Approvals',
  ARCHIVING: 'Archiving',
};

const ACADEMIC_STAFF_WORKFLOW = [
  // Stage 1: Initiation (Sequential - must be completed in exact order)
  {
    stage: WORKFLOW_STAGES.INITIATION,
    name: 'Academic VP Initial Validation',
    roles: ['AcademicVicePresident'],
    order: 1,
    isSequential: true,
    description: 'VP signs first to validate and authorize the clearance request',
    vpSignatureType: 'initial'
  },
  {
    stage: WORKFLOW_STAGES.INITIATION,
    name: 'Department Head Approval',
    roles: ['DepartmentReviewer'],
    order: 2,
    isSequential: true,
    description: 'Department Head verifies departmental responsibilities completion',
    dependsOn: [1]
  },
  {
    stage: WORKFLOW_STAGES.INITIATION,
    name: 'College Head Approval',
    roles: ['CollegeReviewer'],
    order: 3,
    isSequential: true,
    description: 'College Head reviews college-level obligations',
    dependsOn: [2]
  },

  // Other departments can start after the first 3 sequential steps (parallel)
  {
    stage: 'General Departmental Clearance',
    name: 'Other Departmental Clearances',
    roles: [
      'RegistrarReviewer', 'StudentDeanReviewer', 'DistanceEducationReviewer',
      'ResearchDirectorateReviewer', 'EmployeeFinanceReviewer', 'LibraryReviewer',
      'GeneralServiceReviewer', 'PropertySpecialist1Reviewer', 'PropertySpecialist2Reviewer',
      'TreasurerReviewer', 'EthicsReviewer', 'ICTReviewer',
      'CommunityEngagementReviewer', 'HRManagementReviewer', 'FacilitiesReviewer',
      'CaseExecutiveReviewer'
    ],
    order: 4,
    isSequential: false,
    description: 'Other departments can sign in parallel after initial 3 approvals',
    dependsOn: [3] // Can start after college head approval
  },

  // Stage 2: Conditional & Interdependent Clearances
  {
    stage: WORKFLOW_STAGES.CONDITIONAL_INTERDEPENDENT,
    name: 'ICT Executive Equipment & Email Review',
    roles: ['ICTExecutiveReviewer'],
    order: 5,
    isSequential: true,
    description: 'ICT Executive reviews laptops/equipment and deactivates email addresses',
    dependsOn: [4]
  },
  {
    stage: WORKFLOW_STAGES.CONDITIONAL_INTERDEPENDENT,
    name: 'Store Officers Asset Returns',
    roles: ['Store1Reviewer', 'Store2Reviewer'],
    order: 6,
    isSequential: false,
    description: 'Store 1 & Store 2 are interdependent - both must sign for either to proceed',
    isInterdependent: true,
    interdependentWith: ['Store1Reviewer', 'Store2Reviewer'],
    dependsOn: [5]
  },
  {
    stage: WORKFLOW_STAGES.CONDITIONAL_INTERDEPENDENT,
    name: 'Property Executive Director Validation',
    roles: ['PropertyExecutiveDirectorReviewer'],
    order: 7,
    isSequential: true,
    description: 'Property Executive Director verifies after ICT Executive and both stores approve',
    dependsOn: [6]
  },

  // Stage 3: Financial Clearance (Sequential)
  {
    stage: WORKFLOW_STAGES.FINANCIAL_CLEARANCE,
    name: 'Finance Executive Review',
    roles: ['FinanceExecutiveReviewer'],
    order: 8,
    isSequential: true,
    description: 'Finance Executive checks unpaid loans and outstanding dues',
    dependsOn: [7]
  },
  {
    stage: WORKFLOW_STAGES.FINANCIAL_CLEARANCE,
    name: 'Senior Finance Specialist Review',
    roles: ['SeniorFinanceSpecialistReviewer'],
    order: 9,
    isSequential: true,
    description: 'Detailed check on smaller financial transactions',
    dependsOn: [8]
  },
  {
    stage: WORKFLOW_STAGES.FINANCIAL_CLEARANCE,
    name: 'Internal Audit Executive Director',
    roles: ['InternalAuditExecutiveDirectorReviewer'],
    order: 10,
    isSequential: true,
    description: 'Final financial audit for hidden liabilities',
    dependsOn: [9]
  },

  // Stage 4: Human Resource & Final Approvals
  {
    stage: WORKFLOW_STAGES.FINAL_APPROVALS,
    name: 'HR Competency Development Team Leader',
    roles: ['HRCompetencyDevelopmentReviewer'],
    order: 11,
    isSequential: true,
    description: 'HR verifies training agreements and employee records',
    dependsOn: [10]
  },
  // Stage 5: Archiving (VP Final Oversight is the absolute last step)
  {
    stage: WORKFLOW_STAGES.ARCHIVING,
    name: 'Records and Archives Officer',
    roles: ['RecordsArchivesOfficerReviewer'],
    order: 12,
    isSequential: true,
    description: 'Final archiving and record keeping',
    dependsOn: [11]
  },
  {
    stage: WORKFLOW_STAGES.ARCHIVING,
    name: 'Academic VP Final Oversight',
    roles: ['AcademicVicePresident'],
    order: 13,
    isSequential: true,
    description: 'VP final signature confirming full clearance completion',
    dependsOn: [12],
    vpSignatureType: 'final'
  },
];

module.exports = {
  ACADEMIC_STAFF_WORKFLOW,
  WORKFLOW_STAGES,
};
