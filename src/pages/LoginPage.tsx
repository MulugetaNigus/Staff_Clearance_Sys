import React, { useState } from 'react';
import { toastUtils } from '../utils/toastUtils';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeDropper } from 'react-icons/fa6'

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState(''); // Changed from username to email
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const loadingToast = toastUtils.loading('Signing in...');

    try {
      const { mustChangePassword } = await login({ email, password }); // Changed from username to email

      toastUtils.dismiss(loadingToast);
      toastUtils.auth.loginSuccess();

      if (mustChangePassword) {
        navigate('/force-change-password');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toastUtils.dismiss(loadingToast);
      if (err.response && err.response.data && err.response.data.message === 'Account is deactivated. Contact support.') {
        toastUtils.auth.accountDeactivated();
      } else {
        toastUtils.auth.loginError(err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full flex items-center justify-center shadow-lg mb-4">
            <span className="text-white font-bold text-2xl">WU</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Woldia University</h1>
          <h2 className="text-xl font-semibold text-gray-600 mt-2">Clearance Management System</h2>
          <p className="text-gray-500 mt-3">Sign in to access your dashboard</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                placeholder="your.email@wldu.edu.et"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>

              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.981 8.75C4.454 10.81 6.159 12.516 8.221 12.989m10.038-1.478c.246.146.507.278.78.398m-1.787-1.787A3.375 3.375 0 0 0 12 9.75c-1.03 0-1.9.693-2.312 1.647M15.75 14.25a3.375 3.375 0 0 1-3.375 3.375c-1.03 0-1.9-.693-2.312-1.647m1.787-1.787c.246.146.507.278.78.398m-1.787-1.787A3.375 3.375 0 0 0 12 9.75c-1.03 0-1.9.693-2.312 1.647M15.75 14.25a3.375 3.375 0 0 1-3.375 3.375c-1.03 0-1.9-.693-2.312-1.647" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75c-3.148 0-5.97-1.703-7.257-4.243a3.375 3.375 0 0 1 0-4.514C6.03 1.703 8.852 0 12 0s5.97 1.703 7.257 4.243a3.375 3.375 0 0 1 0 4.514C17.97 11.047 15.148 12.75 12 12.75z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                  {/* {showPassword ? (
                    <FaEye />
                  ) : (
                    <FaEyeDropper />

                  )} */}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75 transition-all duration-300 ease-in-out transform hover:scale-105 group"
              >
                {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Sign In'}
                <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Demo Credentials Section */}
      {/* <div className="max-w-3xl w-full mx-auto mt-8">
        <div className="bg-white rounded-2xl shadow-xl p-6">
           <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">Demo Login Credentials</h3>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-center max-h-48 overflow-y-auto p-2 rounded-lg bg-gray-50">
             {/* Demo user credentials */}
      {/* </div> */}
      {/* // </div> */}
      {/* // </div> */}

    </div>
  );
};

export default LoginPage;

