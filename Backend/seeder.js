const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config({ path: './config.env' });

const MONGODB_URI = "mongodb://127.0.0.1:27017/clearance_system"

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

const mockUsers = [
  // Academic Staff
  {
    email: 'staff@woldia.edu',
    password: 'password123',
    name: 'Dr. Almaz Ayana',
    role: 'AcademicStaff',
    department: 'Computer Science',
    contactInfo: 'almaz.ayana@woldia.edu',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
  // System Administrator
  {
    email: 'admin@woldia.edu',
    password: 'admin123',
    name: 'Admin User',
    role: 'SystemAdmin',
    department: 'IT Services',
    contactInfo: 'admin@woldia.edu',
    avatar: 'https://randomuser.me/api/portraits/men/43.jpg',
  },
  // Academic Vice President
  {
    email: 'vp@woldia.edu',
    password: 'vp1234',
    name: 'Academic Vice President',
    role: 'AcademicVicePresident',
    department: 'Academic Affairs',
    contactInfo: 'vp.academic@woldia.edu',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
  },
  // Departmental Reviewers
  {
    email: 'head.cs@woldia.edu',
    password: 'head.cs123',
    name: 'CS Department Head',
    role: 'DepartmentReviewer',
    department: 'Computer Science',
    contactInfo: 'head.cs@woldia.edu',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    email: 'registrar@woldia.edu',
    password: 'registrar123',
    name: 'Registrar Reviewer',
    role: 'RegistrarReviewer',
    department: 'Registrar Office',
    contactInfo: 'registrar@woldia.edu',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
  },
  {
    email: 'studentdean@woldia.edu',
    password: 'studentdean123',
    name: 'Student Dean',
    role: 'StudentDeanReviewer',
    department: 'Student Affairs',
    contactInfo: 'studentdean@woldia.edu',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
  },
  {
    email: 'disted@woldia.edu',
    password: 'disted123',
    name: 'Distance Ed Reviewer',
    role: 'DistanceEducationReviewer',
    department: 'Distance & Continuing Ed',
    contactInfo: 'disted@woldia.edu',
    avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
  },
  {
    email: 'research@woldia.edu',
    password: 'research123',
    name: 'Research Directorate',
    role: 'ResearchDirectorateReviewer',
    department: 'Research Directorate',
    contactInfo: 'research@woldia.edu',
    avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
  },
  {
    email: 'collegehead@woldia.edu',
    password: 'college123',
    name: 'College Head',
    role: 'CollegeReviewer',
    department: 'College of Engineering',
    contactInfo: 'collegehead@woldia.edu',
    avatar: 'https://randomuser.me/api/portraits/men/6.jpg',
  },
  {
    email: 'empfinance@woldia.edu',
    password: 'empfinance123',
    name: 'Employee Finance Reviewer',
    role: 'EmployeeFinanceReviewer',
    department: 'Employee Finance Enterprise',
    contactInfo: 'empfinance@woldia.edu',
    avatar: 'https://randomuser.me/api/portraits/men/7.jpg',
  },
  {
    email: 'library@woldia.edu',
    password: 'library123',
    name: 'Library Reviewer',
    role: 'LibraryReviewer',
    department: 'Library Services',
    contactInfo: 'library.reviewer@woldia.edu',
    avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
  },
  {
    email: 'genservice@woldia.edu',
    password: 'genservice123',
    name: 'General Service Exec',
    role: 'GeneralServiceReviewer',
    department: 'General Services',
    contactInfo: 'genservice@woldia.edu',
    avatar: 'https://randomuser.me/api/portraits/men/8.jpg',
  },
  {
    email: 'propertydir@woldia.edu',
    password: 'propdir123',
    name: 'Property Exec Director',
    role: 'PropertyDirectorReviewer',
    department: 'Property Management',
    contactInfo: 'propertydir@woldia.edu',
    avatar: 'https://randomuser.me/api/portraits/men/9.jpg',
  },
  {
    email: 'propertyexec@woldia.edu',
    password: 'propertyexec123',
    name: 'Property Executive Director',
    role: 'PropertyExecutiveDirectorReviewer',
    department: 'Property Management',
    contactInfo: 'propertyexec@woldia.edu',
    avatar: 'https://randomuser.me/api/portraits/men/27.jpg',
  },
  {
    email: 'store1@woldia.edu',
    password: 'store1123',
    name: 'Store 1 Officer',
    role: 'Store1Reviewer',
    department: 'Central Store 1',
    contactInfo: 'store1@woldia.edu',
    avatar: 'https://randomuser.me/api/portraits/men/10.jpg',
  },
  {
    email: 'store2@woldia.edu',
    password: 'store2123',
    name: 'Store 2 Officer',
    role: 'Store2Reviewer',
    department: 'Central Store 2',
    contactInfo: 'store2@woldia.edu',
    avatar: 'https://randomuser.me/api/portraits/men/11.jpg',
  },
  {
    email: 'propspec1@woldia.edu',
    password: 'propspec1123',
    name: 'Property Specialist 1',
    role: 'PropertySpecialist1Reviewer',
    department: 'Property Management',
    contactInfo: 'propspec1@woldia.edu',
    avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
  },
  {
    email: 'propspec2@woldia.edu',
    password: 'propspec2123',
    name: 'Property Specialist 2',
    role: 'PropertySpecialist2Reviewer',
    department: 'Property Management',
    contactInfo: 'propspec2@woldia.edu',
    avatar: 'https://randomuser.me/api/portraits/men/13.jpg',
  },
  {
    email: 'audit@woldia.edu',
    password: 'audit123',
    name: 'Internal Audit Director',
    role: 'InternalAuditReviewer',
    department: 'Internal Audit',
    contactInfo: 'audit@woldia.edu',
    avatar: 'https://randomuser.me/api/portraits/men/14.jpg',
  },
  {
    email: 'internalauditexec@woldia.edu',
    password: 'internalaudit123',
    name: 'Internal Audit Executive Director',
    role: 'InternalAuditExecutiveDirectorReviewer',
    department: 'Internal Audit',
    contactInfo: 'internalauditexec@woldia.edu',
    avatar: 'https://randomuser.me/api/portraits/men/29.jpg',
  },
  {
    email: 'finance@woldia.edu',
    password: 'finance123',
    name: 'Finance Executive',
    role: 'FinanceExecutiveReviewer',
    department: 'Finance',
    contactInfo: 'finance@woldia.edu',
    avatar: 'https://randomuser.me/api/portraits/men/15.jpg',
  },
  {
    email: 'seniorfinance@woldia.edu',
    password: 'seniorfinance123',
    name: 'Senior Finance Specialist',
    role: 'FinanceSpecialistReviewer',
    department: 'Finance',
    contactInfo: 'seniorfinance@woldia.edu',
    avatar: 'https://randomuser.me/api/portraits/men/16.jpg',
  },
  {
    email: 'seniorfinancespec@woldia.edu',
    password: 'seniorfinspec123',
    name: 'Senior Finance Specialist Reviewer',
    role: 'SeniorFinanceSpecialistReviewer',
    department: 'Finance',
    contactInfo: 'seniorfinancespec@woldia.edu',
    avatar: 'https://randomuser.me/api/portraits/men/28.jpg',
  },
  {
    email: 'treasurer@woldia.edu',
    password: 'treasurer123',
    name: 'Treasurer',
    role: 'TreasurerReviewer',
    department: 'Finance',
    contactInfo: 'treasurer@woldia.edu',
    avatar: 'https://randomuser.me/api/portraits/men/17.jpg',
  },
  {
    email: 'ethics@woldia.edu',
    password: 'ethics123',
    name: 'Ethics Monitoring Exec',
    role: 'EthicsReviewer',
    department: 'Ethics & Anti-Corruption',
    contactInfo: 'ethics@woldia.edu',
    avatar: 'https://randomuser.me/api/portraits/men/18.jpg',
  },
  {
    email: 'ict@woldia.edu',
    password: 'ict123',
    name: 'ICT Executive',
    role: 'ICTReviewer',
    department: 'ICT Services',
    contactInfo: 'ict@woldia.edu',
    avatar: 'https://randomuser.me/api/portraits/men/19.jpg',
  },
  {
    email: 'ictexecutive@woldia.edu',
    password: 'ictexec123',
    name: 'ICT Executive Reviewer',
    role: 'ICTExecutiveReviewer',
    department: 'ICT Services',
    contactInfo: 'ictexecutive@woldia.edu',
    avatar: 'https://randomuser.me/api/portraits/men/26.jpg',
  },
  {
    email: 'community@woldia.edu',
    password: 'community123',
    name: 'Community Engagement Dir',
    role: 'CommunityEngagementReviewer',
    department: 'Community Engagement',
    contactInfo: 'community@woldia.edu',
    avatar: 'https://randomuser.me/api/portraits/men/20.jpg',
  },
  {
    email: 'hr@woldia.edu',
    password: 'hr1234',
    name: 'HR Management Exec',
    role: 'HRManagementReviewer',
    department: 'Human Resources',
    contactInfo: 'hr@woldia.edu',
    avatar: 'https://randomuser.me/api/portraits/men/21.jpg',
  },
  {
    email: 'archives@woldia.edu',
    password: 'archives123',
    name: 'Records & Archives Officer',
    role: 'RecordsArchivesReviewer',
    department: 'Records & Archives',
    contactInfo: 'archives@woldia.edu',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
  },
  {
    email: 'recordsarchivesofficer@woldia.edu',
    password: 'recordsarchives123',
    name: 'Records & Archives Officer Reviewer',
    role: 'RecordsArchivesOfficerReviewer',
    department: 'Records & Archives',
    contactInfo: 'recordsarchivesofficer@woldia.edu',
    avatar: 'https://randomuser.me/api/portraits/men/31.jpg',
  },
  {
    email: 'facilities@woldia.edu',
    password: 'facilities123',
    name: 'Facilities Specialist',
    role: 'FacilitiesReviewer',
    department: 'Facilities Management',
    contactInfo: 'facilities@woldia.edu',
    avatar: 'https://randomuser.me/api/portraits/men/23.jpg',
  },
  {
    email: 'case@woldia.edu',
    password: 'case123',
    name: 'Case Executive',
    role: 'CaseExecutiveReviewer',
    department: 'Legal & Case Management',
    contactInfo: 'case@woldia.edu',
    avatar: 'https://randomuser.me/api/portraits/men/24.jpg',
  },
  {
    email: 'hrdev@woldia.edu',
    password: 'hrdev123',
    name: 'HR Development TL',
    role: 'HRDevelopmentReviewer',
    department: 'HR Development',
    contactInfo: 'hrdev@woldia.edu',
    avatar: 'https://randomuser.me/api/portraits/men/25.jpg',
  },
  {
    email: 'hrcompetency@woldia.edu',
    password: 'hrcompetency123',
    name: 'HR Competency Development TL',
    role: 'HRCompetencyDevelopmentReviewer',
    department: 'HR Development',
    contactInfo: 'hrcompetency@woldia.edu',
    avatar: 'https://randomuser.me/api/portraits/men/30.jpg',
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing users
    await User.deleteMany({});
    console.log('Existing users cleared.');

    // Create users one by one to ensure pre-save middleware runs (password hashing)
    console.log('Creating users with hashed passwords...');
    const createdUsers = [];
    for (const userData of mockUsers) {
      try {
        const user = await User.create(userData);
        createdUsers.push(user);
      } catch (error) {
        console.error(`Error creating user ${userData.email}:`, error.message);
      }
    }
    console.log(`✅ Successfully created ${createdUsers.length} users with hashed passwords.`);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
};

seedDatabase();