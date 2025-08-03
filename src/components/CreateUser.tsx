import React, { useState } from 'react';
import { userService, type CreateUserData } from '../services/userService';
import { toastUtils } from '../utils/toastUtils';
import { emailService } from '../services/emailService';

const USER_ROLES = [
  { value: 'AcademicStaff', label: 'Academic Staff' },
  { value: 'SystemAdmin', label: 'System Admin' },
  { value: 'AcademicVicePresident', label: 'Academic Vice President' },
  { value: 'Registrar', label: 'Registrar' },
  { value: 'HumanResources', label: 'Human Resources' },
  { value: 'AcademicDepartmentReviewer', label: 'Academic Department Reviewer' },
  { value: 'RegistrarReviewer', label: 'Registrar Reviewer' },
  { value: 'StudentDeanReviewer', label: 'Student Dean Reviewer' },
  { value: 'DistanceEducationReviewer', label: 'Distance Education Reviewer' },
  { value: 'ResearchDirectorateReviewer', label: 'Research Directorate Reviewer' },
  { value: 'CollegeReviewer', label: 'College Reviewer' },
  { value: 'DepartmentReviewer', label: 'Department Reviewer' },
  { value: 'EmployeeFinanceReviewer', label: 'Employee Finance Reviewer' },
  { value: 'LibraryReviewer', label: 'Library Reviewer' },
  { value: 'GeneralServiceReviewer', label: 'General Service Reviewer' },
  { value: 'PropertyDirectorReviewer', label: 'Property Director Reviewer' },
  { value: 'Store1Reviewer', label: 'Store 1 Reviewer' },
  { value: 'Store2Reviewer', label: 'Store 2 Reviewer' },
  { value: 'PropertySpecialist1Reviewer', label: 'Property Specialist 1 Reviewer' },
  { value: 'PropertySpecialist2Reviewer', label: 'Property Specialist 2 Reviewer' },
  { value: 'InternalAuditReviewer', label: 'Internal Audit Reviewer' },
  { value: 'FinanceExecutiveReviewer', label: 'Finance Executive Reviewer' },
  { value: 'FinanceSpecialistReviewer', label: 'Finance Specialist Reviewer' },
  { value: 'TreasurerReviewer', label: 'Treasurer Reviewer' },
  { value: 'EthicsReviewer', label: 'Ethics Reviewer' },
  { value: 'ICTReviewer', label: 'ICT Reviewer' },
  { value: 'CommunityEngagementReviewer', label: 'Community Engagement Reviewer' },
  { value: 'HRManagementReviewer', label: 'HR Management Reviewer' },
  { value: 'RecordsArchivesReviewer', label: 'Records Archives Reviewer' },
  { value: 'FacilitiesReviewer', label: 'Facilities Reviewer' },
  { value: 'CaseExecutiveReviewer', label: 'Case Executive Reviewer' },
  { value: 'HRDevelopmentReviewer', label: 'HR Development Reviewer' },
];

const CreateUser: React.FC = () => {
  const [newUser, setNewUser] = useState<CreateUserData>({
    name: '',
    email: '',
    role: 'AcademicStaff',
    department: '',
    contactInfo: '',
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const loadingToast = toastUtils.loading('Creating user...');
      
      // Create user via API
      const response = await userService.createUser(newUser);
      
      if (response.success && response.data) {
        toastUtils.dismiss(loadingToast);
        toastUtils.success('User created successfully!');
        
        // Send welcome email with credentials
        try {
          const emailResult = await emailService.sendUserCreationEmail({
            to_name: newUser.name,
            to_email: newUser.email,
            username: response.data.credentials.username,
            password: response.data.credentials.password,
            role: newUser.role,
            department: newUser.department,
          });
          
          if (emailResult.success) {
            toastUtils.success('Welcome email sent successfully!');
          } else {
            toastUtils.warning('User created but email notification failed to send.');
            console.error('Email sending failed:', emailResult.error);
          }
        } catch (emailError) {
          console.error('Email service error:', emailError);
          toastUtils.warning('User created but email notification failed to send.');
        }
        
        // Reset form
        setNewUser({ name: '', email: '', role: 'AcademicStaff', department: '', contactInfo: '' });
      } else {
        toastUtils.dismiss(loadingToast);
        toastUtils.error(response.message || 'Failed to create user');
      }
    } catch (error: any) {
      console.error('Failed to create user:', error);
      toastUtils.error(error.response?.data?.message || error.message || 'Failed to create user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-green-600">
        <h1 className="text-3xl font-bold text-gray-800">Create New User</h1>
        <p className="text-gray-500 mt-1">Fill in the details to create a new user.</p>
      </div>
      <form onSubmit={handleCreateUser} className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <input
              type="text"
              value={newUser.department}
              onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter department"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Information</label>
            <input
              type="text"
              value={newUser.contactInfo}
              onChange={(e) => setNewUser({ ...newUser, contactInfo: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter contact information"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {USER_ROLES.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            type="reset"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
            onClick={() => setNewUser({ name: '', email: '', role: 'AcademicStaff', department: '', contactInfo: '' })}
          >
            Reset
          </button>
          <button
            type="submit"
            className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
          >
            Create User
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUser;

