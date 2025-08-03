
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { toastUtils } from '../utils/toastUtils';

const ForceChangePassword: React.FC = () => {
  const { user, login } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toastUtils.error('New passwords do not match.');
      return;
    }

    if (!user) {
      toastUtils.error('User not authenticated.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await API.post('/auth/change-password', {
        email: user.email,
        oldPassword,
        newPassword,
      });

      if (response.data.success) {
        toastUtils.success('Password changed successfully! Please log in again.');
        // Redirect to login page after password change
        window.location.href = '/login'; // Full page reload to clear auth state
      } else {
        toastUtils.error(response.data.message || 'Failed to change password.');
      }
    } catch (error: any) {
      toastUtils.error(error.response?.data?.message || 'An error occurred while changing password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Change Your Password</h2>
        <p className="text-gray-600 mb-6 text-center">For security reasons, you must change your password before proceeding.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700">Old Password</label>
            <input
              type="password"
              id="oldPassword"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              id="newPassword"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <input
              type="password"
              id="confirmNewPassword"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            {isLoading ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForceChangePassword;
