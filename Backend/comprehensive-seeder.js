const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Import models
const User = require('./models/User');
const ClearanceRequest = require('./models/ClearanceRequest');
const ClearanceStep = require('./models/ClearanceStep');
const ClearanceForm = require('./models/ClearanceForm');
const ActivityLog = require('./models/ActivityLog');
const SystemSettings = require('./models/SystemSettings');

dotenv.config();

const MONGODB_URI = "mongodb://127.0.0.1:27017/clearance_system";

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully.');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Helper functions for generating random data
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const generateRandomString = (length) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const generatePhoneNumber = () => {
  return '+251' + Math.floor(900000000 + Math.random() * 100000000);
};

// Sample data
const USER_ROLES = [
  'AcademicStaff',
  'SystemAdmin',
  'AcademicVicePresident',
  'Registrar',
  'HumanResources',
  'AcademicDepartmentReviewer',
  'RegistrarReviewer',
  'StudentDeanReviewer',
  'DistanceEducationReviewer',
  'ResearchDirectorateReviewer',
  'CollegeReviewer',
  'DepartmentReviewer',
  'EmployeeFinanceReviewer',
  'LibraryReviewer',
  'GeneralServiceReviewer',
  'PropertyDirectorReviewer',
  'Store1Reviewer',
  'Store2Reviewer',
  'PropertySpecialist1Reviewer',
  'PropertySpecialist2Reviewer',
  'InternalAuditReviewer',
  'FinanceExecutiveReviewer',
  'FinanceSpecialistReviewer',
  'TreasurerReviewer',
  'EthicsReviewer',
  'ICTReviewer',
  'CommunityEngagementReviewer',
  'HRManagementReviewer',
  'RecordsArchivesReviewer',
  'FacilitiesReviewer',
  'CaseExecutiveReviewer',
  'HRDevelopmentReviewer'
];

const DEPARTMENTS = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Amharic',
  'Economics',
  'Management',
  'Accounting',
  'Marketing',
  'Engineering',
  'Agriculture',
  'Veterinary Science',
  'Medicine',
  'Nursing',
  'Psychology',
  'Sociology',
  'Law',
  'Education',
  'IT Services',
  'Academic Affairs',
  'Student Affairs',
  'Human Resources',
  'Finance',
  'Library Services',
  'Research Directorate',
  'Distance & Continuing Ed',
  'Property Management',
  'General Services',
  'Internal Audit',
  'Ethics & Anti-Corruption',
  'ICT Services',
  'Community Engagement',
  'Records & Archives',
  'Facilities Management',
  'Legal & Case Management',
  'HR Development'
];

const FIRST_NAMES = [
  'Abebe', 'Almaz', 'Belaynesh', 'Dawit', 'Emebet', 'Fikru', 'Girma', 'Hanna', 
  'Ibrahim', 'Jemila', 'Kebede', 'Lemlem', 'Meron', 'Nigist', 'Osman', 'Philipos',
  'Qedija', 'Rahel', 'Solomon', 'Tigist', 'Urael', 'Violin', 'Worku', 'Xemalework',
  'Yonas', 'Zara', 'Ahmed', 'Beza', 'Chaltu', 'Daniel', 'Eyasu', 'Fasil',
  'Getnet', 'Henok', 'Iskinder', 'Jote', 'Kidist', 'Liya', 'Melkam', 'Nardos'
];

const LAST_NAMES = [
  'Ayana', 'Bekele', 'Chala', 'Desta', 'Eshetu', 'Fantaye', 'Gebre', 'Haile',
  'Ibrahim', 'Jira', 'Kebede', 'Legesse', 'Molla', 'Negash', 'Olana', 'Petros',
  'Qasim', 'Roba', 'Sisay', 'Tadesse', 'Usman', 'Weldu', 'Yimer', 'Zewdu',
  'Abera', 'Birhanu', 'Chalew', 'Dereje', 'Endris', 'Feleke', 'Getachew', 'Hussen'
];

const CLEARANCE_REASONS = ['Resignation', 'Retirement', 'Transfer', 'Leave'];
const CLEARANCE_STATUSES = ['pending_approval', 'in_progress', 'cleared', 'rejected'];
const STEP_STATUSES = ['pending', 'cleared', 'issue'];

const ACTIVITY_ACTIONS = [
  'FORM_SUBMITTED',
  'REQUEST_CREATED',
  'INITIAL_APPROVAL',
  'INITIAL_REJECTION',
  'STEP_UPDATED',
  'FINAL_APPROVAL',
  'STEP_APPROVED',
  'STEP_REJECTED',
  'REQUEST_COMPLETED',
  'DOCUMENT_UPLOADED',
  'CERTIFICATE_GENERATED',
  'LOGIN',
  'LOGOUT',
  'PASSWORD_CHANGED',
  'PROFILE_UPDATED'
];

// Generate sample users
const generateUsers = async (count = 50) => {
  const users = [];

  const userList = [
    { name: 'Academic Staff', email: 'academic.staff@woldia.edu.et', role: 'AcademicStaff', department: 'Academics' },
    { name: 'Registrar', email: 'registrar@woldia.edu.et', role: 'Registrar', department: 'Registrar' },
    { name: 'Student Dean', email: 'student.dean@woldia.edu.et', role: 'StudentDeanReviewer', department: 'Student Affairs' },
    { name: 'Distance and Continuing Education', email: 'distance.edu@woldia.edu.et', role: 'DistanceEducationReviewer', department: 'Distance Education' },
    { name: 'Research Directorate', email: 'research.directorate@woldia.edu.et', role: 'ResearchDirectorateReviewer', department: 'Research' },
    { name: 'College Head', email: 'college.head@woldia.edu.et', role: 'CollegeReviewer', department: 'Academics' },
    { name: 'Department Head', email: 'dept.head@woldia.edu.et', role: 'DepartmentReviewer', department: 'Academics' },
    { name: 'Woldia University Employee’s Finance Enterprise', email: 'finance.enterprise@woldia.edu.et', role: 'EmployeeFinanceReviewer', department: 'Finance' },
    { name: 'Library Staff', email: 'library@woldia.edu.et', role: 'LibraryReviewer', department: 'Library' },
    { name: 'General Service Executive', email: 'general.service@woldia.edu.et', role: 'GeneralServiceReviewer', department: 'General Services' },
    { name: 'Property Executive Director', email: 'property.director@woldia.edu.et', role: 'PropertyDirectorReviewer', department: 'Property' },
    { name: 'Store 1 Officer', email: 'store1@woldia.edu.et', role: 'Store1Reviewer', department: 'Property' },
    { name: 'Store 2 Officer', email: 'store2@woldia.edu.et', role: 'Store2Reviewer', department: 'Property' },
    { name: 'Property Registration and Control Specialist 1', email: 'property.specialist1@woldia.edu.et', role: 'PropertySpecialist1Reviewer', department: 'Property' },
    { name: 'Property Registration and Control Specialist 2', email: 'property.specialist2@woldia.edu.et', role: 'PropertySpecialist2Reviewer', department: 'Property' },
    { name: 'Internal Audit Executive Director', email: 'internal.audit@woldia.edu.et', role: 'InternalAuditReviewer', department: 'Audit' },
    { name: 'Finance Executive', email: 'finance.executive@woldia.edu.et', role: 'FinanceExecutiveReviewer', department: 'Finance' },
    { name: 'Senior Finance Specialist', email: 'finance.specialist@woldia.edu.et', role: 'FinanceSpecialistReviewer', department: 'Finance' },
    { name: 'Treasurer', email: 'treasurer@woldia.edu.et', role: 'TreasurerReviewer', department: 'Finance' },
    { name: 'Ethics and Anti-Corruption Monitoring Executive', email: 'ethics@woldia.edu.et', role: 'EthicsReviewer', department: 'Ethics' },
    { name: 'ICT Executive', email: 'ict@woldia.edu.et', role: 'ICTReviewer', department: 'ICT' },
    { name: 'Community Engagement Directorate', email: 'community.engagement@woldia.edu.et', role: 'CommunityEngagementReviewer', department: 'Community Engagement' },
    { name: 'Competency and HR Management Executive', email: 'hr.management@woldia.edu.et', role: 'HRManagementReviewer', department: 'Human Resources' },
    { name: 'Records and Archives Officer', email: 'records.archives@woldia.edu.et', role: 'RecordsArchivesReviewer', department: 'Administration' },
    { name: 'Office and Classroom Facilities Specialist', email: 'facilities@woldia.edu.et', role: 'FacilitiesReviewer', department: 'General Services' },
    { name: 'Case Executive', email: 'case.executive@woldia.edu.et', role: 'CaseExecutiveReviewer', department: 'Administration' },
    { name: 'HR Competency and Development Team Leader', email: 'hr.development@woldia.edu.et', role: 'HRDevelopmentReviewer', department: 'Human Resources' },
    { name: 'Vice President for Academic, Research & Community Engagement', email: 'vp.academic@woldia.edu.et', role: 'AcademicVicePresident', department: 'Academics' },
    { name: 'System Administrator', email: 'admin@woldia.edu.et', role: 'SystemAdmin', department: 'IT Services' },
  ];

  for (const userData of userList) {
    users.push({
      ...userData,
      password: 'password',
      contactInfo: generatePhoneNumber(),
      username: userData.email.split('@')[0],
      isActive: true,
      isEmailVerified: true,
      mustChangePassword: true, // Force password change on first login
      lastLogin: new Date(),
      permissions: userData.role === 'SystemAdmin' ? ['all'] : [],
    });
  }

  return users;
};

// Generate clearance forms
const generateClearanceForms = async (users) => {
  const forms = [];
  const formTypes = ['Initial', 'Department', 'Final', 'Certificate'];
  const admin = users.find(u => u.role === 'SystemAdmin');
  
  for (let i = 0; i < 10; i++) {
    const formType = getRandomElement(formTypes);
    
    forms.push({
      formName: `${formType} Clearance Form v${1 + Math.floor(Math.random() * 3)}.0`,
      formType,
      version: `${1 + Math.floor(Math.random() * 3)}.${Math.floor(Math.random() * 10)}`,
      isActive: Math.random() > 0.2,
      fields: [
        {
          fieldName: 'reason',
          fieldType: 'select',
          label: 'Reason for Clearance',
          required: true,
          options: [
            { label: 'End of Contract', value: 'EndOfContract' },
            { label: 'Retirement', value: 'Retirement' },
            { label: 'Transfer', value: 'Transfer' },
            { label: 'Other', value: 'Other' }
          ],
          order: 1,
          department: 'All'
        },
        {
          fieldName: 'expectedEndDate',
          fieldType: 'date',
          label: 'Expected Last Day of Service',
          required: true,
          order: 2,
          department: 'All'
        },
        {
          fieldName: 'handoverDetails',
          fieldType: 'textarea',
          label: 'Handover Details (Responsibilities, materials, etc.)',
          placeholder: 'Describe the handover plan for your current duties, projects, and any university property...',
          required: true,
          order: 3,
          department: 'All'
        },
        {
            fieldName: 'contactDuringProcess',
            fieldType: 'text',
            label: 'Primary Contact (Email or Phone)',
            placeholder: 'e.g., your-personal-email@example.com',
            required: true,
            order: 4,
            department: 'All'
        },
        {
            fieldName: 'workLocation',
            fieldType: 'text',
            label: 'Work Location / Campus',
            placeholder: 'e.g., Main Campus',
            required: true,
            order: 5,
            department: 'All'
        },
        {
            fieldName: 'additionalNotes',
            fieldType: 'textarea',
            label: 'Additional Notes',
            placeholder: 'Any other information relevant to your clearance...',
            required: false,
            order: 6,
            department: 'All'
        }
      ],
      instructions: `Please fill out this ${formType.toLowerCase()} clearance form completely and accurately.`,
      requiredDocuments: [
        {
          documentName: 'ID Copy',
          documentType: 'PDF',
          maxSize: 2,
          required: true
        },
        {
          documentName: 'Letter of Intent',
          documentType: 'PDF',
          maxSize: 5,
          required: true
        }
      ],
      approvalCriteria: {
        minimumApprovals: Math.floor(1 + Math.random() * 3),
        requireAllDepartments: Math.random() > 0.5,
        timeLimit: 7 + Math.floor(Math.random() * 30)
      },
      createdBy: admin._id
    });
  }
  
  return forms;
};

// Generate clearance requests
const generateReferenceCode = () => {
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 10000);
  return `CR-${timestamp}-${randomSuffix}`;
};

const generateClearanceRequests = async (users, num) => {
  console.log(' Generating clearance requests...');
  const clearanceForms = await ClearanceForm.find({});

  if (users.length === 0) {
    console.error('Error: No users found to generate clearance requests.');
    return [];
  }
  if (clearanceForms.length === 0) {
    console.error('Error: No clearance forms found to generate clearance requests.');
    return [];
  }

  const requests = [];

  for (let i = 0; i < num; i++) {
    const randomUser = getRandomElement(users);
    const randomForm = getRandomElement(clearanceForms);

    const purpose = getRandomElement(CLEARANCE_REASONS);
    const staffId = `WU-${Math.floor(10000 + Math.random() * 90000)}`;

    const request = {
      initiatedBy: randomUser._id,
      formData: {
        reason: purpose,
        expectedEndDate: new Date(),
        handoverDetails: `Handover details for ${randomUser.name} for ${purpose} clearance.`,
        contactDuringProcess: randomUser.email,
        workLocation: 'Main Campus',
        additionalNotes: 'Seeded request.'
      },
      purpose: purpose,
      staffId: staffId,
      referenceCode: generateReferenceCode(),
      status: getRandomElement(CLEARANCE_STATUSES),
      submissionDate: getRandomDate(new Date(2023, 0, 1), new Date()),
      currentStep: 1,
    };
    requests.push(request);
  }

  try {
    await ClearanceRequest.insertMany(requests);
    console.log(`✅ Created ${requests.length} clearance requests`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// Generate clearance steps
const generateClearanceSteps = async (requests, users) => {
  const steps = [];
  const departmentReviewers = users.filter(u => u.role.includes('Reviewer'));

  for (const request of requests) {
    // Only generate steps for requests that are in_progress
    if (request.status !== 'in_progress' && request.status !== 'cleared') {
      continue;
    }

    const numSteps = 3 + Math.floor(Math.random() * 5); // 3-7 steps per request
    const departmentsForRequest = [...DEPARTMENTS].sort(() => 0.5 - Math.random()).slice(0, numSteps);

    for (let i = 0; i < departmentsForRequest.length; i++) {
      const department = departmentsForRequest[i];
      const reviewersInDept = departmentReviewers.filter(u => u.department === department);
      const reviewer = reviewersInDept.length > 0 ? getRandomElement(reviewersInDept) : getRandomElement(departmentReviewers);
      
      let stepStatus = getRandomElement(STEP_STATUSES);
      if (request.status === 'cleared') {
        stepStatus = 'cleared'; // If request is cleared, all steps should be cleared
      }

      steps.push({
        requestId: request._id,
        department: department,
        reviewerRole: reviewer.role,
        status: stepStatus,
        rejectionReason: stepStatus === 'issue' ? 'Simulated rejection reason for step' : null,
        lastUpdatedAt: getRandomDate(new Date(2024, 0, 1), new Date()),
        reviewedBy: reviewer ? reviewer._id : null,
        order: i + 1,
        notes: Math.random() > 0.7 ? `Step ${i + 1} processed successfully` : null
      });
    }
  }
  
  return steps;
};

// Generate activity logs
const generateActivityLogs = async (users, requests, count = 100) => {
  const logs = [];
  
  for (let i = 0; i < count; i++) {
    const user = getRandomElement(users);
    const request = Math.random() > 0.3 ? getRandomElement(requests) : null;
    const action = getRandomElement(ACTIVITY_ACTIONS);
    
    logs.push({
      userId: user._id,
      requestId: request ? request._id : null,
      action,
      description: `User ${user.name} performed ${action.toLowerCase().replace('_', ' ')}`,
      metadata: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: new Date(),
        source: 'web_application'
      },
      ipAddress: `192.168.1.${Math.floor(1 + Math.random() * 254)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      previousData: Math.random() > 0.7 ? { status: 'old_value' } : null,
      newData: Math.random() > 0.7 ? { status: 'new_value' } : null
    });
  }
  
  return logs;
};

// Generate system settings
const generateSystemSettings = async (users) => {
  const admin = users.find(u => u.role === 'SystemAdmin');
  
  return {
    siteName: 'TCS - Teacher Clearance System',
    siteDescription: 'Woldia University Academic Staff Clearance Management System',
    maintenanceMode: false,
    maxLoginAttempts: 5,
    lockoutDuration: 2 * 60 * 60 * 1000,
    sessionTimeout: 24 * 60 * 60 * 1000,
    emailSettings: {
      enabled: true,
      provider: 'smtp',
      host: 'smtp.woldia.edu.et',
      port: 587,
      secure: false,
      fromEmail: 'noreply@woldia.edu.et',
      fromName: 'Woldia University TCS'
    },
    backupSettings: {
      enabled: true,
      frequency: 'weekly',
      retentionDays: 30,
      location: 'local'
    },
    notificationSettings: {
      enablePushNotifications: true,
      enableEmailNotifications: true,
      enableSMSNotifications: false
    },
    securitySettings: {
      enforcePasswordComplexity: true,
      minPasswordLength: 8,
      passwordExpiryDays: 90,
      twoFactorAuth: false
    },
    clearanceSettings: {
      defaultProcessingDays: 14,
      urgentProcessingDays: 7,
      autoApprovalThreshold: 0
    },
    lastUpdatedBy: admin._id
  };
};

// Main seeding function
const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      ClearanceRequest.deleteMany({}),
      ClearanceStep.deleteMany({}),
      ClearanceForm.deleteMany({}),
      ActivityLog.deleteMany({}),
      SystemSettings.deleteMany({})
    ]);
    console.log('✅ Existing data cleared');

    console.log('👥 Generating users...');
    const users = await generateUsers(50);
    const insertedUsers = await User.create(users);
    console.log(`✅ Created ${insertedUsers.length} users`);

    console.log('📋 Generating clearance forms...');
    const forms = await generateClearanceForms(insertedUsers);
    const insertedForms = await ClearanceForm.insertMany(forms);
    console.log(`✅ Created ${insertedForms.length} clearance forms`);

    console.log('📝 Generating clearance requests...');
    await generateClearanceRequests(insertedUsers, 30);
    const insertedRequests = await ClearanceRequest.find({});

    console.log('👀 Generating clearance steps...');
    const steps = await generateClearanceSteps(insertedRequests, insertedUsers);
    const insertedSteps = await ClearanceStep.insertMany(steps);
    console.log(`✅ Created ${insertedSteps.length} clearance steps`);

    console.log('📊 Generating activity logs...');
    const logs = await generateActivityLogs(insertedUsers, insertedRequests, 100);
    const insertedLogs = await ActivityLog.insertMany(logs);
    console.log(`✅ Created ${insertedLogs.length} activity logs`);

    console.log('⚙️  Generating system settings...');
    const settings = await generateSystemSettings(insertedUsers);
    const insertedSettings = await SystemSettings.create(settings);
    console.log(`✅ Created system settings`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`  Users: ${insertedUsers.length}`);
    console.log(`  Clearance Forms: ${insertedForms.length}`);
    console.log(`  Clearance Requests: ${insertedRequests.length}`);
    console.log(`  Clearance Steps: ${insertedSteps.length}`);
    console.log(`  Activity Logs: ${insertedLogs.length}`);
    console.log(`  System Settings: 1`);
    
    console.log('\n🔐 Admin Credentials:');
    console.log('  Email: admin@woldia.edu.et');
    console.log('  Password: admin123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.disconnect();
    console.log('🔌 MongoDB connection closed.');
  }
};

// Run the seeder
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };