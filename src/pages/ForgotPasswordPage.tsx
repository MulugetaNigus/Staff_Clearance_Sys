import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toastUtils } from '../utils/toastUtils';
import { userService } from '../services/userService';
import { FaEnvelope } from 'react-icons/fa';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email) {
      toastUtils.error('Please enter your email address.');
      setLoading(false);
      return;
    }

    try {
      const backendResponse = await userService.forgotPassword(email);
      if (backendResponse.success) {
        toastUtils.success('If an account with that email exists, a password reset link has been sent.');
      } else {
        toastUtils.error(backendResponse.message || 'Failed to initiate password reset.');
      }
    } catch (error: any) {
      toastUtils.error(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full bg-white shadow-2xl rounded-2xl overflow-hidden">

        <div className="hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-red-600 to-yellow-500 text-white">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tighter">Forgot Your Password?</h1>
          <p className="text-lg mt-4 font-light text-red-100">No problem. Enter your email below and we'll send you a link to reset it.</p>
        </div>

        <div className="p-8 md:p-12">
          <div className="text-center md:text-left mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Reset Password</h2>
            <p className="text-gray-500 mt-2">Enter your email to receive a reset link.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 pl-10 bg-gray-100 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-shadow"
                  placeholder="Enter your email"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-lg font-semibold text-white bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-700 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-60 transition-all duration-300 ease-in-out transform hover:scale-102"
            >
              {loading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : 'Send Reset Link'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-red-600 hover:text-red-800 font-medium">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;