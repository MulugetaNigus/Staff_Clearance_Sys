
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { toastUtils } from '../utils/toastUtils';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useParams } from 'react-router-dom';

const ForceChangePassword: React.FC = () => {
  const { user } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { resetToken } = useParams<{ resetToken: string }>();

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
        window.location.href = '/login';
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full bg-white shadow-2xl rounded-2xl overflow-hidden">
        
        {/* Branding Section */}
        <div className="hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-red-600 to-yellow-500 text-white">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tighter">Security Update Required</h1>
          <p className="text-lg mt-4 font-light text-red-100">To protect your account, please choose a new, strong password.</p>
        </div>

        {/* Form Section */}
        <div className="p-8 md:p-12">
          <div className="text-center md:text-left mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Change Your Password</h2>
            <p className="text-gray-500 mt-2">Enter your old and new passwords below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!resetToken && (
              <div>
                <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-2">Old Password</label>
                <div className="relative">
                  <input
                    id="oldPassword"
                    type={showOldPassword ? 'text' : 'password'}
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-shadow"
                    placeholder="Enter your old password"
                  />
                  <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-500 hover:text-gray-700">
                    {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            )}

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-shadow"
                  placeholder="Enter your new password"
                />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-500 hover:text-gray-700">
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <div className="relative">
                <input
                  id="confirmNewPassword"
                  type={showConfirmNewPassword ? 'text' : 'password'}
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-shadow"
                  placeholder="Confirm your new password"
                />
                <button type="button" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-500 hover:text-gray-700">
                  {showConfirmNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-lg font-semibold text-white bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-700 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-60 transition-all duration-300 ease-in-out transform hover:scale-102"
            >
              {isLoading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForceChangePassword;
