# Enhanced Clearance Workflow - Testing Guide

## Overview
This guide provides comprehensive testing procedures for the enhanced academic staff clearance workflow system with 13 sequential workflow steps across 5 stages.

## Test Environment Setup

### Prerequisites
1. Backend server running on `http://localhost:5000`
2. MongoDB database connected
3. Frontend development server running on `http://localhost:3000`
4. Test users with appropriate roles created

## Test Scenarios

### 1. Workflow Stage 1: Initiation and Initial Approvals

#### Test Case 1.1: Create Clearance Request
- **Role**: Staff Member
- **Steps**:
  1. Login as staff member
  2. Navigate to clearance form
  3. Fill out form with required information
  4. Upload necessary documents
  5. Submit request
- **Expected Result**: Request created with status 'initiated', VP initial step available

#### Test Case 1.2: Academic VP Initial Validation
- **Role**: Academic Vice President
- **Steps**:
  1. Login as Academic VP
  2. Navigate to VP Approval Dashboard
  3. Select "Initial Validation" tab
  4. Review pending request
  5. Provide digital signature
  6. Approve request
- **Expected Result**: Request status changes to 'vp_initial_approval', next steps become available

#### Test Case 1.3: Department Head Approval
- **Role**: Department Head
- **Dependencies**: VP initial approval completed
- **Steps**:
  1. Login as Department Head
  2. Navigate to pending requests
  3. Review request details
  4. Approve/reject with comments
- **Expected Result**: Department step marked as cleared

#### Test Case 1.4: College Head Approval
- **Role**: College Head
- **Dependencies**: Department Head approval completed
- **Steps**:
  1. Login as College Head
  2. Review available requests
  3. Process approval with signature
- **Expected Result**: Stage 1 completion triggers Stage 2 availability

### 2. Workflow Stage 2: ICT & Property Clearances

#### Test Case 2.1: ICT Executive Equipment & Email Review
- **Role**: ICTExecutive
- **Dependencies**: Stage 1 completed (All other departments)
- **Steps**:
  1. Login as ICT Executive
  2. Review equipment/laptops assigned to staff
  3. Verify no equipment damage or missing items
  4. Deactivate staff email addresses and system access
  5. Provide digital signature and comments
- **Expected Result**: ICT step cleared, Store officers become available

#### Test Case 2.2: Store 1 Officer Clearance
- **Role**: Store1Officer
- **Dependencies**: ICT Executive approval completed
- **Steps**:
  1. Login as Store 1 Officer
  2. Process asset return clearance request
  3. Provide signature and comments
- **Expected Result**: Store 1 step cleared, but interdependent Store 2 still required

#### Test Case 2.3: Store 2 Officer Clearance (Interdependency Test)
- **Role**: Store2Officer
- **Dependencies**: ICT Executive approval completed
- **Steps**:
  1. Login as Store 2 Officer
  2. Process asset return clearance request
  3. Provide signature
- **Expected Result**: Both Store officers completed triggers Property Executive availability

#### Test Case 2.4: Property Executive Director Approval
- **Role**: PropertyExecutiveDirector
- **Dependencies**: ICT Executive AND both Store officers completed
- **Steps**:
  1. Login as Property Executive Director
  2. Review ICT clearance and interdependent store clearances
  3. Approve property clearance
- **Expected Result**: Stage 2 completion, Stage 3 becomes available

### 3. Workflow Stage 3: Financial Clearances

#### Test Case 3.1: Finance Executive Approval
- **Role**: FinanceExecutive
- **Dependencies**: Stage 2 completed
- **Steps**:
  1. Login as Finance Executive
  2. Review financial obligations
  3. Process clearance
- **Expected Result**: Finance step cleared

#### Test Case 3.2: Senior Finance Specialist Review
- **Role**: SeniorFinanceSpecialist
- **Dependencies**: Finance Executive approval
- **Steps**:
  1. Login as Senior Finance Specialist
  2. Verify financial clearance
  3. Approve request
- **Expected Result**: Senior finance step cleared

#### Test Case 3.3: Internal Audit Executive Director
- **Role**: InternalAuditExecutiveDirector
- **Dependencies**: Senior Finance Specialist approval
- **Steps**:
  1. Login as Internal Audit Executive Director
  2. Conduct audit review
  3. Provide final financial approval
- **Expected Result**: Stage 3 completion, Stage 4 becomes available

### 4. Workflow Stage 4: HR and Final VP Approval

#### Test Case 4.1: Human Resource Executive Clearance
- **Role**: HumanResourceExecutive
- **Dependencies**: Stage 3 completed
- **Steps**:
  1. Login as HR Executive
  2. Review HR obligations
  3. Process HR clearance
- **Expected Result**: HR step cleared, VP final approval available

#### Test Case 4.2: Academic VP Final Oversight
- **Role**: Academic Vice President
- **Dependencies**: HR clearance completed
- **Steps**:
  1. Login as Academic VP
  2. Navigate to VP Approval Dashboard
  3. Select "Final Oversight" tab
  4. Review completed stages
  5. Provide final signature
- **Expected Result**: Request status changes to 'completed', Stage 5 available

### 5. Workflow Stage 5: Archiving

#### Test Case 5.1: Records and Archives Officer
- **Role**: RecordsArchivesReviewer
- **Dependencies**: All previous stages completed
- **Steps**:
  1. Login as Records and Archives Officer
  2. Review completed request
  3. Archive the request
- **Expected Result**: Request status changes to 'archived', workflow complete

## Edge Cases and Error Scenarios

### Edge Case 1: Dependency Violations
- **Test**: Attempt to process a step before dependencies are met
- **Expected Result**: Error message, step remains unprocessable

### Edge Case 2: Role Authorization
- **Test**: User tries to process step for wrong role
- **Expected Result**: Access denied error

### Edge Case 3: ICT Executive Dependency
- **Test**: Store officers try to process before ICT Executive approval
- **Expected Result**: Store officer steps remain unavailable until ICT Executive completes

### Edge Case 4: Interdependency Breaking
- **Test**: Only one Store officer approves, Property Executive tries to process
- **Expected Result**: Step remains unavailable until both Store officers complete

### Edge Case 5: Dual VP Signature Validation
- **Test**: Verify VP can't provide final approval without initial approval
- **Expected Result**: Proper validation and error handling

## UI Component Testing

### Progress Tracker Component
- **Test**: Verify stage visualization with proper status indicators
- **Expected**: Stages show correct completion status and dependencies

### VP Approval Dashboard
- **Test**: Tab switching between Initial Validation and Final Oversight
- **Expected**: Proper request filtering and signature modal functionality

### Clearance Form
- **Test**: Form validation and file upload
- **Expected**: Proper form submission and error handling

## API Endpoint Testing

### Test API Routes
- `POST /api/clearance/requests` - Create clearance request
- `GET /api/clearance/requests/vp-review` - Get VP review requests
- `PUT /api/clearance/requests/:id/approve-initial` - VP initial approval
- `PUT /api/clearance/requests/:id/approve-final` - VP final approval
- `PUT /api/clearance/steps/:id` - Update clearance step
- `PUT /api/clearance/requests/:id/archive` - Archive request
- `GET /api/clearance/steps/my-reviews` - Get user's assigned steps

## Performance Testing
- **Load Test**: Multiple simultaneous requests
- **Database Performance**: Query optimization with populated references
- **File Upload**: Large document handling

## Security Testing
- **Authentication**: JWT token validation
- **Authorization**: Role-based access control
- **Data Privacy**: Step visibility based on user roles

## Browser Compatibility
- Chrome, Firefox, Safari, Edge
- Mobile responsiveness
- Signature pad functionality across devices

## Deployment Testing
- **Production Environment**: Full workflow in production-like setup
- **Database Migration**: Schema changes and data integrity
- **Environment Variables**: Proper configuration management

## Regression Testing
- **Previous Functionality**: Ensure existing features still work
- **User Management**: Authentication and authorization
- **Email Notifications**: If applicable

## Success Criteria
- ✅ All 5 workflow stages process sequentially (13 total steps)
- ✅ ICT Executive step processes before Store officers and Property Executive Director
- ✅ Interdependencies properly enforced (Store 1 & Store 2 depend on ICT Executive)
- ✅ Dual VP signatures work correctly (initial + final)
- ✅ Role-based access control functions properly
- ✅ UI components display accurate workflow status
- ✅ Error handling for edge cases works
- ✅ Performance meets acceptable standards
- ✅ Security requirements satisfied
