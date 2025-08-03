import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import type { User } from '../services/userService';
import { toastUtils } from '../utils/toastUtils';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await userService.getAllUsers();
        setUsers(fetchedUsers);
      } catch (err) {
        setError('Failed to fetch users.');
        toastUtils.error('Could not load user data.');
      }
      setIsLoading(false);
    };

    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    const loadingToast = toastUtils.loading(`Updating user status...`);
    const result = await userService.toggleUserStatus(userId);
    toastUtils.dismiss(loadingToast);
    if (result.success) {
      toastUtils.success(`User ${isActive ? 'deactivated' : 'activated'} successfully!`);
      setUsers(users.map(u => u.id === userId ? { ...u, isActive: !isActive } : u));
    } else {
      toastUtils.error('Failed to update user status.');
    }
  };

  const handleResetPassword = async (userId: string) => {
    const loadingToast = toastUtils.loading('Resetting password...');
    const result = await userService.resetUserPassword(userId);
    toastUtils.dismiss(loadingToast);
    if (result.success && result.newPassword) {
      toastUtils.success('Password has been reset successfully!');
      // Optionally, display the new password to the admin
      alert(`New password: ${result.newPassword}`);
    } else {
      toastUtils.error('Failed to reset password.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this user?')) {
        const loadingToast = toastUtils.loading('Deleting user...');
        const success = await userService.deleteUser(userId);
        toastUtils.dismiss(loadingToast);
        if (success) {
            toastUtils.success('User deleted successfully!');
            setUsers(users.filter(u => u.id !== userId));
        } else {
            toastUtils.error('Failed to delete user.');
        }
    }
  };

  if (isLoading) {
    return <div className="text-center p-10">Loading users...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">User Management</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button onClick={() => handleToggleStatus(user.id, user.isActive)} className={`px-3 py-1 text-white rounded-md ${user.isActive ? 'bg-gray-500 hover:bg-gray-600' : 'bg-green-500 hover:bg-green-600'}`}>
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => handleResetPassword(user.id)} className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">Reset Password</button>
                  <button onClick={() => handleDeleteUser(user.id)} className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;