export interface Department {
  id: string;
  name: string;
  reviewerRole: string;
  responsibilities: string;
  order: number;
}

export const CLEARANCE_DEPARTMENTS: Department[] = [
  {
    id: '1',
    name: 'Academic Department Head',
    reviewerRole: 'AcademicDepartmentReviewer',
    responsibilities: 'Ensures handover of academic resources, records, and responsibilities. Confirms that department courses are finalized.',
    order: 1,
  },
  {
    id: '2',
    name: 'Registrar',
    reviewerRole: 'RegistrarReviewer',
    responsibilities: 'Verifies academic records (e.g., grade submissions) and updates academic status.',
    order: 2,
  },
  {
    id: '3',
    name: 'Student Dean',
    reviewerRole: 'StudentDeanReviewer',
    responsibilities: 'Checks if mentorship or advisory responsibilities are completed.',
    order: 3,
  },
  {
    id: '4',
    name: 'Distance and Continuing Education',
    reviewerRole: 'DistanceEducationReviewer',
    responsibilities: 'Verifies that any special or evening program responsibilities are finalized.',
    order: 4,
  },
  {
    id: '5',
    name: 'Research Directorate',
    reviewerRole: 'ResearchDirectorateReviewer',
    responsibilities: 'Ensures that any research projects or grants are closed or transferred.',
    order: 5,
  },
  {
    id: '6',
    name: 'College Head',
    reviewerRole: 'CollegeReviewer',
    responsibilities: 'Ensures college-level materials are returned and all college-specific obligations are fulfilled.',
    order: 6,
  },
  {
    id: '7',
    name: 'Woldia University Employee’s Finance Enterprise',
    reviewerRole: 'EmployeeFinanceReviewer',
    responsibilities: 'Reviews pending loans or financial advances and clears only if all dues are settled.',
    order: 7,
  },
  {
    id: '8',
    name: 'Library',
    reviewerRole: 'LibraryReviewer',
    responsibilities: 'Checks for any borrowed books or digital resources and clears after all returns and fines are complete.',
    order: 8,
  },
  {
    id: '9',
    name: 'General Service Executive',
    reviewerRole: 'GeneralServiceReviewer',
    responsibilities: 'Verifies services like transport, housing, and support utilities are returned or canceled.',
    order: 9,
  },
  {
    id: '10',
    name: 'Property Executive Director',
    reviewerRole: 'PropertyDirectorReviewer',
    responsibilities: 'Checks university-owned physical assets assigned to staff and approves asset return.',
    order: 10,
  },
  {
    id: '11',
    name: 'Store 1 Officer',
    reviewerRole: 'Store1Reviewer',
    responsibilities: 'Confirms return of issued materials or tools from Store 1.',
    order: 11,
  },
  {
    id: '12',
    name: 'Store 2 Officer',
    reviewerRole: 'Store2Reviewer',
    responsibilities: 'Checks for additional resources issued from Store 2.',
    order: 12,
  },
  {
    id: '13',
    name: 'Property Registration and Control Specialist 1',
    reviewerRole: 'PropertySpecialist1Reviewer',
    responsibilities: 'Confirms reconciliation of asset registry and updates asset ownership logs.',
    order: 13,
  },
  {
    id: '14',
    name: 'Property Registration and Control Specialist 2',
    reviewerRole: 'PropertySpecialist2Reviewer',
    responsibilities: 'Works alongside Specialist 1 to verify full asset registry.',
    order: 14,
  },
  {
    id: '15',
    name: 'Internal Audit Executive Director',
    reviewerRole: 'InternalAuditReviewer',
    responsibilities: 'Audits financial transactions linked to the teacher and checks for irregularities.',
    order: 15,
  },
  {
    id: '16',
    name: 'Finance Executive',
    reviewerRole: 'FinanceExecutiveReviewer',
    responsibilities: 'Verifies clearance from payroll, reimbursements, and allowances.',
    order: 16,
  },
  {
    id: '17',
    name: 'Senior Finance Specialist',
    reviewerRole: 'FinanceSpecialistReviewer',
    responsibilities: 'Ensures clearance of high-level or special financial activities and approves salary clearance.',
    order: 17,
  },
  {
    id: '18',
    name: 'Treasurer',
    reviewerRole: 'TreasurerReviewer',
    responsibilities: 'Final checkpoint for any monetary claims or balances; ensures all institutional payments are settled.',
    order: 18,
  },
  {
    id: '19',
    name: 'Ethics and Anti-Corruption Monitoring Executive',
    reviewerRole: 'EthicsReviewer',
    responsibilities: 'Verifies if the teacher has been part of any ongoing investigations.',
    order: 19,
  },
  {
    id: '20',
    name: 'ICT Executive',
    reviewerRole: 'ICTReviewer',
    responsibilities: 'Ensures return/audit of laptop and digital equipment; deactivates email and user accounts; retrieves ID cards.',
    order: 20,
  },
  {
    id: '21',
    name: 'Community Engagement Directorate',
    reviewerRole: 'CommunityEngagementReviewer',
    responsibilities: 'Reviews project commitments in the community and ensures proper documentation or transition.',
    order: 21,
  },
  {
    id: '22',
    name: 'Competency and HR Management Executive',
    reviewerRole: 'HRManagementReviewer',
    responsibilities: 'Collects resignation letters or retirement forms and verifies benefit processing.',
    order: 22,
  },
  {
    id: '23',
    name: 'Records and Archives Officer',
    reviewerRole: 'RecordsArchivesReviewer',
    responsibilities: 'Confirms submission of any teaching logs, course outlines, or administrative documents.',
    order: 23,
  },
  {
    id: '24',
    name: 'Office and Classroom Facilities Specialist',
    reviewerRole: 'FacilitiesReviewer',
    responsibilities: 'Verifies return of office keys, access cards, and room equipment.',
    order: 24,
  },
  {
    id: '25',
    name: 'Case Executive',
    reviewerRole: 'CaseExecutiveReviewer',
    responsibilities: 'Finalizes service records including appointments, transfers, disciplinary notes, etc.',
    order: 25,
  },
  {
    id: '26',
    name: 'HR Competency and Development Team Leader',
    reviewerRole: 'HRDevelopmentReviewer',
    responsibilities: 'Ensures compliance with training obligations or bonded service agreements.',
    order: 26,
  },
  {
    id: '27',
    name: 'Vice President for Academic, Research & Community Engagement',
    reviewerRole: 'AcademicVicePresident',
    responsibilities: 'Provides high-level clearance approval and gives final consent before certificate is generated.',
    order: 27,
  },
];

export const getDepartmentByRole = (role: string): Department | undefined => {
  return CLEARANCE_DEPARTMENTS.find(dept => dept.reviewerRole === role);
};

export const getDepartmentById = (id: string): Department | undefined => {
  return CLEARANCE_DEPARTMENTS.find(dept => dept.id === id);
};