import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toastUtils } from '../utils/toastUtils';
import { userService } from '../services/userService';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ResetPasswordPage: React.FC = () => {
  const { resettoken } = useParams<{ resettoken: string }>();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!resettoken) {
      toastUtils.error('Password reset token is missing.');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      toastUtils.error('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      toastUtils.error('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      const response = await userService.resetPassword(resettoken, newPassword);
      if (response.success) {
        toastUtils.success('Your password has been reset successfully. You can now log in.');
        navigate('/login');
      } else {
        toastUtils.error(response.message || 'Failed to reset password.');
      }
    } catch (error: any) {
      toastUtils.error(error.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full bg-white shadow-2xl rounded-2xl overflow-hidden">
        
        <div className="hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-red-600 to-yellow-500 text-white">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tighter">Create a New Password</h1>
          <p className="text-lg mt-4 font-light text-red-100">Choose a strong, new password to secure your account.</p>
        </div>

        <div className="p-8 md:p-12">
          <div className="text-center md:text-left mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Reset Your Password</h2>
            <p className="text-gray-500 mt-2">Enter and confirm your new password below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-shadow"
                  placeholder="Confirm your new password"
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-500 hover:text-gray-700">
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-lg font-semibold text-white bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-700 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-60 transition-all duration-300 ease-in-out transform hover:scale-102"
            >
              {loading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;