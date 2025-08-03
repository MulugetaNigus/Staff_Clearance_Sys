import React, { useEffect, useState } from 'react';
import { getAllUsers, deleteUser, toggleUserStatus, resetUserPassword, createUser, type CreateUserData } from '../services/userService';
import { emailService } from '../services/emailService';
import { toastUtils } from '../utils/toastUtils';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  contactInfo: string;
  isActive: boolean;
  username?: string;
  createdAt: string;
  updatedAt: string;
}

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

const EnhancedUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [newUser, setNewUser] = useState<CreateUserData>({
    name: '',
    email: '',
    role: 'AcademicStaff',
    department: '',
    contactInfo: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toastUtils.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const loadingToast = toastUtils.loading('Creating user...');
      await createUser(newUser);
      toastUtils.dismiss(loadingToast);
      toastUtils.success('User created successfully!');
      fetchUsers();
      setNewUser({ name: '', email: '', role: 'AcademicStaff', department: '', contactInfo: '' });
      setShowCreateForm(false);
    } catch (error: any) {
      console.error('Failed to create user:', error);
      toastUtils.error(error.message || 'Failed to create user');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      try {
        const loadingToast = toastUtils.loading('Deleting user...');
        await deleteUser(userId);
        toastUtils.dismiss(loadingToast);
        toastUtils.success('User deleted successfully!');
        setUsers(users.filter(user => user._id !== userId));
      } catch (error: any) {
        console.error('Failed to delete user:', error);
        toastUtils.error(error.message || 'Failed to delete user');
      }
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      const user = users.find(u => u._id === userId);
      if (!user) return;

      const loadingToast = toastUtils.loading(`${user.isActive ? 'Deactivating' : 'Activating'} user...`);
      await toggleUserStatus(userId);
      toastUtils.dismiss(loadingToast);
      
      user.isActive = !user.isActive;
      setUsers([...users]);
      
      toastUtils.success(`User ${user.isActive ? 'activated' : 'deactivated'} successfully!`);
      
      await emailService.sendAccountStatusEmail({
        to_email: user.email,
        to_name: user.name,
        status: user.isActive ? 'activated' : 'deactivated'
      });
    } catch (error: any) {
      console.error('Failed to toggle user status:', error);
      toastUtils.error(error.message || 'Failed to toggle user status');
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      const user = users.find(u => u._id === userId);
      if (!user) return;

      if (window.confirm(`Are you sure you want to reset ${user.name}'s password? They will be notified via email.`)) {
        const loadingToast = toastUtils.loading('Resetting password...');
        const { newPassword } = await resetUserPassword(userId);
        toastUtils.dismiss(loadingToast);
        toastUtils.success('Password reset successfully! User has been notified via email.');
        
        await emailService.sendPasswordResetEmail({
          to_email: user.email,
          to_name: user.name,
          new_password: newPassword
        });
      }
    } catch (error: any) {
      console.error('Failed to reset password:', error);
      toastUtils.error(error.message || 'Failed to reset password');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === '' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-blue-600">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
            <p className="text-gray-500 mt-1">Create and manage user accounts and access levels</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
          >
            {showCreateForm ? '✕ Cancel' : '➕ Add New User'}
          </button>
        </div>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New User</h2>
          <form onSubmit={handleCreateUser} className="space-y-4">
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
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
              >
                Create User
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search users by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Roles</option>
              {USER_ROLES.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {USER_ROLES.find(r => r.value === user.role)?.label || user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleToggleStatus(user._id)}
                        className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors duration-200 ${
                          user.isActive 
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleResetPassword(user._id)}
                        className="px-3 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors duration-200"
                      >
                        Reset Password
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id, user.name)}
                        className="px-3 py-1 rounded-md text-xs font-semibold bg-red-100 text-red-800 hover:bg-red-200 transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{users.length}</div>
            <div className="text-sm text-gray-500">Total Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{users.filter(u => u.isActive).length}</div>
            <div className="text-sm text-gray-500">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{users.filter(u => !u.isActive).length}</div>
            <div className="text-sm text-gray-500">Inactive Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{filteredUsers.length}</div>
            <div className="text-sm text-gray-500">Filtered Results</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedUserManagement;
