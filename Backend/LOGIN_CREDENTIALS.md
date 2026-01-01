# Login Credentials for Teacher Clearance System

After running `npm run seed`, you can login with any of these credentials:

## Academic Staff
- **Email**: `staff@woldia.edu`
- **Password**: `password123`
- **Role**: AcademicStaff
- **Name**: Dr. Almaz Ayana

## System Administrator
- **Email**: `admin@woldia.edu`
- **Password**: `admin123`
- **Role**: SystemAdmin
- **Name**: Admin User

## Academic Vice President
- **Email**: `vp@woldia.edu`
- **Password**: `vp123`
- **Role**: AcademicVicePresident
- **Name**: Academic Vice President

## Departmental Reviewers

### Academic Department Head
- **Email**: `head.cs@woldia.edu`
- **Password**: `head.cs123`
- **Role**: AcademicDepartmentReviewer

### Registrar
- **Email**: `registrar@woldia.edu`
- **Password**: `registrar123`
- **Role**: RegistrarReviewer

### Student Dean
- **Email**: `studentdean@woldia.edu`
- **Password**: `studentdean123`
- **Role**: StudentDeanReviewer

### Distance Education
- **Email**: `disted@woldia.edu`
- **Password**: `disted123`
- **Role**: DistanceEducationReviewer

### Research Directorate
- **Email**: `research@woldia.edu`
- **Password**: `research123`
- **Role**: ResearchDirectorateReviewer

### College Head
- **Email**: `collegehead@woldia.edu`
- **Password**: `college123`
- **Role**: CollegeReviewer

### Employee Finance
- **Email**: `empfinance@woldia.edu`
- **Password**: `empfinance123`
- **Role**: EmployeeFinanceReviewer

### Library
- **Email**: `library@woldia.edu`
- **Password**: `library123`
- **Role**: LibraryReviewer

### General Service
- **Email**: `genservice@woldia.edu`
- **Password**: `genservice123`
- **Role**: GeneralServiceReviewer

### Property Director
- **Email**: `propertydir@woldia.edu`
- **Password**: `propdir123`
- **Role**: PropertyDirectorReviewer

### Store Officers
- **Email**: `store1@woldia.edu`
- **Password**: `store1123`
- **Role**: Store1Reviewer

- **Email**: `store2@woldia.edu`
- **Password**: `store2123`
- **Role**: Store2Reviewer

### Property Specialists
- **Email**: `propspec1@woldia.edu`
- **Password**: `propspec1123`
- **Role**: PropertySpecialist1Reviewer

- **Email**: `propspec2@woldia.edu`
- **Password**: `propspec2123`
- **Role**: PropertySpecialist2Reviewer

### Internal Audit
- **Email**: `audit@woldia.edu`
- **Password**: `audit123`
- **Role**: InternalAuditReviewer

### Finance Team
- **Email**: `finance@woldia.edu`
- **Password**: `finance123`
- **Role**: FinanceExecutiveReviewer

- **Email**: `seniorfinance@woldia.edu`
- **Password**: `seniorfinance123`
- **Role**: FinanceSpecialistReviewer

- **Email**: `treasurer@woldia.edu`
- **Password**: `treasurer123`
- **Role**: TreasurerReviewer

### Ethics & Anti-Corruption
- **Email**: `ethics@woldia.edu`
- **Password**: `ethics123`
- **Role**: EthicsReviewer

### ICT
- **Email**: `ict@woldia.edu`
- **Password**: `ict123`
- **Role**: ICTReviewer

### Community Engagement
- **Email**: `community@woldia.edu`
- **Password**: `community123`
- **Role**: CommunityEngagementReviewer

### Human Resources
- **Email**: `hr@woldia.edu`
- **Password**: `hr123`
- **Role**: HRManagementReviewer

### Records & Archives
- **Email**: `recordsarchivesofficer@woldia.edu`
- **Password**: `recordsarchives123`
- **Role**: RecordsArchivesOfficerReviewer

### Facilities
- **Email**: `facilities@woldia.edu`
- **Password**: `facilities123`
- **Role**: FacilitiesReviewer

### Case Executive
- **Email**: `case@woldia.edu`
- **Password**: `case123`
- **Role**: CaseExecutiveReviewer

### HR Development
- **Email**: `hrdev@woldia.edu`
- **Password**: `hrdev123`
- **Role**: HRDevelopmentReviewer

---

## How to Login

1. Start your frontend application
2. Go to the login page
3. Use any email and password combination from above
4. The system will authenticate against the MongoDB database
5. You'll be logged in with the appropriate role and permissions

## Testing Different Roles

- **Academic Staff**: Can create clearance requests
- **Reviewers**: Can approve/reject clearance steps for their department
- **Admin/Vice President**: Can view all requests and have elevated permissions

Each role will see different interfaces and have different capabilities based on their permissions.