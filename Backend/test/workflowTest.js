const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const ClearanceRequest = require('../models/ClearanceRequest');
const ClearanceStep = require('../models/ClearanceStep');
const { getWorkflowStatus, validateStepDependencies } = require('../utils/workflowUtils');

// Mock test data for enhanced clearance workflow
const testUsers = {
  staff: {
    name: 'Test Staff',
    email: 'staff@test.edu',
    role: 'Staff',
    staffId: 'TS001'
  },
  vpAcademic: {
    name: 'Academic VP',
    email: 'vp.academic@test.edu',
    role: 'AcademicVicePresident'
  },
  deptHead: {
    name: 'Department Head',
    email: 'dept.head@test.edu',
    role: 'DepartmentHead'
  },
  collegeHead: {
    name: 'College Head',
    email: 'college.head@test.edu',
    role: 'CollegeHead'
  },
  store1Officer: {
    name: 'Store 1 Officer',
    email: 'store1@test.edu',
    role: 'Store1Officer'
  },
  store2Officer: {
    name: 'Store 2 Officer',
    email: 'store2@test.edu',
    role: 'Store2Officer'
  },
  propertyExecDir: {
    name: 'Property Executive Director',
    email: 'property.exec@test.edu',
    role: 'PropertyExecutiveDirector'
  },
  financeExec: {
    name: 'Finance Executive',
    email: 'finance.exec@test.edu',
    role: 'FinanceExecutive'
  },
  seniorFinanceSpec: {
    name: 'Senior Finance Specialist',
    email: 'senior.finance@test.edu',
    role: 'SeniorFinanceSpecialist'
  },
  auditExecDir: {
    name: 'Audit Executive Director',
    email: 'audit.exec@test.edu',
    role: 'InternalAuditExecutiveDirector'
  },
  hrExec: {
    name: 'HR Executive',
    email: 'hr.exec@test.edu',
    role: 'HumanResourceExecutive'
  },
  archivesOfficer: {
    name: 'Archives Officer',
    email: 'archives@test.edu',
    role: 'RecordsArchivesReviewer'
  }
};

describe('Enhanced Clearance Workflow Integration Tests', () => {
  let authTokens = {};
  let testRequestId;

  beforeAll(async () => {
    // Create test users and get auth tokens
    for (const [key, userData] of Object.entries(testUsers)) {
      const user = await User.create({
        ...userData,
        password: 'testpass123',
        department: 'Computer Science',
        isActive: true
      });
      
      // Generate auth token for each user
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: 'testpass123'
        });
      
      authTokens[key] = loginRes.body.token;
    }
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: { $regex: /@test\.edu$/ } });
    await ClearanceRequest.deleteMany({ staffId: 'TS001' });
    await ClearanceStep.deleteMany({});
    await mongoose.connection.close();
  });

  describe('Stage 1: Initiation and Initial Approvals', () => {
    test('Staff should create clearance request successfully', async () => {
      const formData = {
        staffId: 'TS001',
        purpose: 'End of Contract',
        personalInfo: {
          fullName: 'Test Staff',
          department: 'Computer Science',
          position: 'Lecturer'
        }
      };

      const res = await request(app)
        .post('/api/clearance/requests')
        .set('Authorization', `Bearer ${authTokens.staff}`)
        .field('formData', JSON.stringify(formData))
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('initiated');
      testRequestId = res.body.data._id;
    });

    test('VP should approve initial request', async () => {
      const res = await request(app)
        .put(`/api/clearance/requests/${testRequestId}/approve-initial`)
        .set('Authorization', `Bearer ${authTokens.vpAcademic}`)
        .send({ signature: 'VP_Initial_Signature_Data' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('vp_initial_approval');
    });

    test('Department Head should approve after VP initial', async () => {
      const steps = await ClearanceStep.find({ 
        requestId: testRequestId,
        reviewerRole: 'DepartmentHead'
      });
      
      const res = await request(app)
        .put(`/api/clearance/steps/${steps[0]._id}`)
        .set('Authorization', `Bearer ${authTokens.deptHead}`)
        .send({
          status: 'cleared',
          signature: 'DeptHead_Signature_Data',
          comment: 'Approved by Department Head'
        })
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('Stage 2: Property Clearances with Interdependency', () => {
    test('Store 1 Officer should approve', async () => {
      const steps = await ClearanceStep.find({ 
        requestId: testRequestId,
        reviewerRole: 'Store1Officer'
      });

      const res = await request(app)
        .put(`/api/clearance/steps/${steps[0]._id}`)
        .set('Authorization', `Bearer ${authTokens.store1Officer}`)
        .send({
          status: 'cleared',
          signature: 'Store1_Signature_Data'
        })
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    test('Property Executive should NOT be available until Store 2 approves', async () => {
      const steps = await ClearanceStep.find({ 
        requestId: testRequestId,
        reviewerRole: 'PropertyExecutiveDirector'
      });

      expect(steps[0].canProcess).toBe(false);
      expect(steps[0].status).toBe('pending');
    });

    test('Store 2 Officer approval should enable Property Executive', async () => {
      const steps = await ClearanceStep.find({ 
        requestId: testRequestId,
        reviewerRole: 'Store2Officer'
      });

      await request(app)
        .put(`/api/clearance/steps/${steps[0]._id}`)
        .set('Authorization', `Bearer ${authTokens.store2Officer}`)
        .send({
          status: 'cleared',
          signature: 'Store2_Signature_Data'
        })
        .expect(200);

      // Check that Property Executive is now available
      const propSteps = await ClearanceStep.find({ 
        requestId: testRequestId,
        reviewerRole: 'PropertyExecutiveDirector'
      });
      
      expect(propSteps[0].canProcess).toBe(true);
      expect(propSteps[0].status).toBe('available');
    });
  });

  describe('Stage 3: Financial Clearances', () => {
    test('Complete Stage 2 and test Stage 3 dependency', async () => {
      // Complete Property Executive approval
      const propSteps = await ClearanceStep.find({ 
        requestId: testRequestId,
        reviewerRole: 'PropertyExecutiveDirector'
      });

      await request(app)
        .put(`/api/clearance/steps/${propSteps[0]._id}`)
        .set('Authorization', `Bearer ${authTokens.propertyExecDir}`)
        .send({
          status: 'cleared',
          signature: 'PropertyExec_Signature_Data'
        })
        .expect(200);

      // Finance Executive should now be available
      const finSteps = await ClearanceStep.find({ 
        requestId: testRequestId,
        reviewerRole: 'FinanceExecutive'
      });
      
      expect(finSteps[0].canProcess).toBe(true);
    });

    test('Sequential finance approvals should work correctly', async () => {
      // Finance Executive
      const finExecSteps = await ClearanceStep.find({ 
        requestId: testRequestId,
        reviewerRole: 'FinanceExecutive'
      });

      await request(app)
        .put(`/api/clearance/steps/${finExecSteps[0]._id}`)
        .set('Authorization', `Bearer ${authTokens.financeExec}`)
        .send({
          status: 'cleared',
          signature: 'FinanceExec_Signature_Data'
        })
        .expect(200);

      // Senior Finance Specialist
      const seniorFinSteps = await ClearanceStep.find({ 
        requestId: testRequestId,
        reviewerRole: 'SeniorFinanceSpecialist'
      });

      await request(app)
        .put(`/api/clearance/steps/${seniorFinSteps[0]._id}`)
        .set('Authorization', `Bearer ${authTokens.seniorFinanceSpec}`)
        .send({
          status: 'cleared',
          signature: 'SeniorFinance_Signature_Data'
        })
        .expect(200);

      // Internal Audit Executive Director
      const auditSteps = await ClearanceStep.find({ 
        requestId: testRequestId,
        reviewerRole: 'InternalAuditExecutiveDirector'
      });

      await request(app)
        .put(`/api/clearance/steps/${auditSteps[0]._id}`)
        .set('Authorization', `Bearer ${authTokens.auditExecDir}`)
        .send({
          status: 'cleared',
          signature: 'Audit_Signature_Data'
        })
        .expect(200);
    });
  });

  describe('Stage 4: HR and Final VP Approval', () => {
    test('HR approval should enable final VP step', async () => {
      const hrSteps = await ClearanceStep.find({ 
        requestId: testRequestId,
        reviewerRole: 'HumanResourceExecutive'
      });

      await request(app)
        .put(`/api/clearance/steps/${hrSteps[0]._id}`)
        .set('Authorization', `Bearer ${authTokens.hrExec}`)
        .send({
          status: 'cleared',
          signature: 'HR_Signature_Data'
        })
        .expect(200);

      // VP Final should now be available
      const vpFinalSteps = await ClearanceStep.find({ 
        requestId: testRequestId,
        reviewerRole: 'AcademicVicePresident',
        vpSignatureType: 'final'
      });
      
      expect(vpFinalSteps[0].canProcess).toBe(true);
    });

    test('VP should provide final approval', async () => {
      const res = await request(app)
        .put(`/api/clearance/requests/${testRequestId}/approve-final`)
        .set('Authorization', `Bearer ${authTokens.vpAcademic}`)
        .send({ signature: 'VP_Final_Signature_Data' })
        .expect(200);

      expect(res.body.success).toBe(true);
      
      // Check request has VP final signature
      const request = await ClearanceRequest.findById(testRequestId);
      expect(request.vpFinalSignature).toBe('VP_Final_Signature_Data');
    });
  });

  describe('Stage 5: Archiving', () => {
    test('Archives Officer should archive completed request', async () => {
      const res = await request(app)
        .put(`/api/clearance/requests/${testRequestId}/archive`)
        .set('Authorization', `Bearer ${authTokens.archivesOfficer}`)
        .send({ signature: 'Archives_Signature_Data' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('archived');
    });
  });

  describe('Workflow Utility Functions', () => {
    test('getWorkflowStatus should return comprehensive status', async () => {
      const status = await getWorkflowStatus(testRequestId);
      
      expect(status).toHaveProperty('requestId');
      expect(status).toHaveProperty('overallProgress');
      expect(status).toHaveProperty('stagesSummary');
      expect(status.overallProgress.completionPercentage).toBe(100);
    });

    test('validateStepDependencies should work correctly', async () => {
      const steps = await ClearanceStep.find({ requestId: testRequestId });
      const randomStep = steps[5]; // Pick a middle step
      
      const validation = await validateStepDependencies(randomStep._id);
      expect(validation).toHaveProperty('isValid');
    });
  });

  describe('Error Scenarios', () => {
    test('Wrong role should not be able to process step', async () => {
      // Try to use Staff token for VP approval
      await request(app)
        .put(`/api/clearance/requests/${testRequestId}/approve-initial`)
        .set('Authorization', `Bearer ${authTokens.staff}`)
        .send({ signature: 'Invalid_Signature' })
        .expect(403);
    });

    test('Processing step without dependencies should fail', async () => {
      // Create new request to test dependency violation
      const formData = {
        staffId: 'TS002',
        purpose: 'Test Dependencies'
      };

      const res = await request(app)
        .post('/api/clearance/requests')
        .set('Authorization', `Bearer ${authTokens.staff}`)
        .field('formData', JSON.stringify(formData));

      const newRequestId = res.body.data._id;
      
      // Try to process Department Head before VP initial
      const steps = await ClearanceStep.find({ 
        requestId: newRequestId,
        reviewerRole: 'DepartmentHead'
      });

      await request(app)
        .put(`/api/clearance/steps/${steps[0]._id}`)
        .set('Authorization', `Bearer ${authTokens.deptHead}`)
        .send({
          status: 'cleared',
          signature: 'Should_Fail'
        })
        .expect(400);
    });
  });
});

// Manual test helper functions
const runManualWorkflowTest = async () => {
  console.log('🧪 Starting Enhanced Clearance Workflow Manual Test...\n');
  
  try {
    // Test workflow status utility
    if (testRequestId) {
      const status = await getWorkflowStatus(testRequestId);
      console.log('📊 Workflow Status:', {
        completionPercentage: status.overallProgress.completionPercentage,
        currentStage: status.currentStage,
        totalSteps: status.overallProgress.totalSteps,
        completedSteps: status.overallProgress.completedSteps
      });
    }
    
    console.log('✅ Enhanced Clearance Workflow test completed successfully!');
  } catch (error) {
    console.error('❌ Workflow test failed:', error.message);
  }
};

module.exports = {
  testUsers,
  runManualWorkflowTest
};
