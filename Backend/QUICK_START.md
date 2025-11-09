# Quick Start Guide - After Database Reset

## ✅ Database Successfully Seeded!

Your database has been reseeded with all necessary users. The app is now ready to run smoothly.

## 🔐 Essential Login Credentials

### For Testing the Full Workflow:

#### 1. Academic Staff (Create Clearance Requests)
- **Email**: `staff@woldia.edu`
- **Password**: `password123`
- **Role**: AcademicStaff
- **Use**: Create and track clearance requests

#### 2. Academic Vice President (Initial & Final Approvals)
- **Email**: `vp@woldia.edu`
- **Password**: `vp1234`
- **Role**: AcademicVicePresident
- **Use**: Provide initial validation (Step 1) and final oversight (Step 12)

#### 3. System Administrator
- **Email**: `admin@woldia.edu`
- **Password**: `admin123`
- **Role**: SystemAdmin
- **Use**: Manage users, view all requests, system administration

#### 4. Department Head (Step 2)
- **Email**: `head.cs@woldia.edu`
- **Password**: `head.cs123`
- **Role**: DepartmentReviewer
- **Use**: Approve department-level clearance

#### 5. College Head (Step 3)
- **Email**: `collegehead@woldia.edu`
- **Password**: `college123`
- **Role**: CollegeReviewer
- **Use**: Approve college-level clearance

#### 6. ICT Executive (Step 5)
- **Email**: `ictexecutive@woldia.edu`
- **Password**: `ictexec123`
- **Role**: ICTExecutiveReviewer
- **Use**: Review equipment and deactivate email addresses

#### 7. Store Officers (Step 6 - Interdependent)
- **Store 1**: `store1@woldia.edu` / `store1123`
- **Store 2**: `store2@woldia.edu` / `store2123`
- **Roles**: Store1Reviewer, Store2Reviewer
- **Use**: Both must approve before Property Executive can proceed

#### 8. Property Executive Director (Step 7)
- **Email**: `propertyexec@woldia.edu`
- **Password**: `propertyexec123`
- **Role**: PropertyExecutiveDirectorReviewer
- **Use**: Validate after ICT and Store approvals

#### 9. Finance Team (Steps 8-10)
- **Finance Executive**: `finance@woldia.edu` / `finance123`
- **Senior Finance Specialist**: `seniorfinancespec@woldia.edu` / `seniorfinspec123`
- **Internal Audit Executive**: `internalauditexec@woldia.edu` / `internalaudit123`

#### 10. HR Development (Step 11)
- **Email**: `hrcompetency@woldia.edu`
- **Password**: `hrcompetency123`
- **Role**: HRCompetencyDevelopmentReviewer

#### 11. Records & Archives (Step 13 - Final)
- **Email**: `recordsarchivesofficer@woldia.edu`
- **Password**: `recordsarchives123`
- **Role**: RecordsArchivesOfficerReviewer
- **Use**: Archive completed clearance requests

## 🚀 Quick Test Workflow

1. **Start Backend**:
   ```bash
   cd Backend
   npm run dev
   ```

2. **Start Frontend** (in another terminal):
   ```bash
   npm run dev
   ```

3. **Test Login**:
   - Open browser to `http://localhost:5173`
   - Login with `staff@woldia.edu` / `password123`
   - Create a clearance request
   - Logout and login as VP to approve
   - Continue through the workflow steps

## 📋 All Available Reviewers

### Other Department Reviewers (Step 4 - Can process in parallel):
- Registrar: `registrar@woldia.edu` / `registrar123`
- Student Dean: `studentdean@woldia.edu` / `studentdean123`
- Distance Education: `disted@woldia.edu` / `disted123`
- Research Directorate: `research@woldia.edu` / `research123`
- Employee Finance: `empfinance@woldia.edu` / `empfinance123`
- Library: `library@woldia.edu` / `library123`
- General Service: `genservice@woldia.edu` / `genservice123`
- Property Director: `propertydir@woldia.edu` / `propdir123`
- Property Specialists: `propspec1@woldia.edu` / `propspec1123`, `propspec2@woldia.edu` / `propspec2123`
- Treasurer: `treasurer@woldia.edu` / `treasurer123`
- Ethics: `ethics@woldia.edu` / `ethics123`
- ICT: `ict@woldia.edu` / `ict123`
- Community Engagement: `community@woldia.edu` / `community123`
- HR Management: `hr@woldia.edu` / `hr1234`
- Records & Archives: `archives@woldia.edu` / `archives123`
- Facilities: `facilities@woldia.edu` / `facilities123`
- Case Executive: `case@woldia.edu` / `case123`
- HR Development: `hrdev@woldia.edu` / `hrdev123`

## ⚠️ Important Notes

1. **Workflow Order**: The clearance workflow follows a strict 13-step sequence. Steps must be completed in order (with some parallel processing in Step 4).

2. **Interdependent Steps**: Store 1 and Store 2 (Step 6) are interdependent - both must approve before Property Executive (Step 7) can proceed.

3. **VP Dual Signatures**: The Academic VP must sign twice:
   - **Initial Signature** (Step 1): Validates and authorizes the request
   - **Final Signature** (Step 12): Confirms full clearance completion

4. **Password Requirements**: All passwords must be at least 6 characters long.

5. **First Login**: Users may be required to change their password on first login (if `mustChangePassword` is set to `true`).

## 🔍 Verify Database

To verify the database was seeded correctly:

```bash
mongosh clearance_system
> db.users.countDocuments()
> db.users.find({ role: "AcademicStaff" })
> db.users.find({ role: "AcademicVicePresident" })
```

## 📝 Next Steps

1. Start your backend server: `cd Backend && npm run dev`
2. Start your frontend server: `npm run dev`
3. Login and test the application
4. Create a clearance request as Academic Staff
5. Test the approval workflow with different reviewer roles

---

**Database Status**: ✅ Seeded and Ready
**Total Users Created**: 35+ users with all required roles
**Workflow Steps**: All 13 steps have corresponding reviewers

