import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { toastUtils } from '../utils/toastUtils';

// Create simple showToast helper
const showToast = {
  success: (msg: string) => toastUtils.success(msg),
  error: (msg: string) => toastUtils.error(msg)
};

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      showToast.error('Please enter both email and password');
      return;
    }

    try {
      const { mustChangePassword } = await login({ email, password });
      showToast.success('Welcome back!');

      if (mustChangePassword) {
        navigate('/force-change-password');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      if (err?.response?.data?.message === 'Account is deactivated. Contact support.') {
        showToast.error('Your account is deactivated. Please contact support.');
      } else {
        const errorMsg = err?.response?.data?.message || 'Invalid email or password';
        showToast.error(errorMsg);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-0 bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in">

        {/* Branding Section - Left Side */}
        <div className="hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Logo */}
            <div className="mb-8 flex items-center gap-3">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-3xl font-bold text-white font-['Plus_Jakarta_Sans_Variable']">WU</span>
              </div>
              <Sparkles className="h-8 w-8 text-yellow-300 animate-pulse" />
            </div>

            {/* Heading */}
            <h1 className="text-5xl font-extrabold leading-tight mb-4 font-['Plus_Jakarta_Sans_Variable'] animate-fade-in-down">
              Woldia University
            </h1>
            <p className="text-2xl font-semibold text-blue-100 mb-6 animate-fade-in-up">
              Clearance System
            </p>

            {/* Description */}
            <p className="text-lg text-blue-100 leading-relaxed mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Streamlining the clearance process for academic staff with efficiency and transparency.
            </p>

            {/* Features */}
            <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              {[
                'Digital signature workflow',
                '13-step approval process',
                'Real-time progress tracking',
                'Instant certificate generation'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-blue-50">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Section - Right Side */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          {/* Mobile Logo */}
          <div className="md:hidden mb-8 flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold text-white font-['Plus_Jakarta_Sans_Variable']">WU</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 font-['Plus_Jakarta_Sans_Variable']">Woldia University</h1>
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 font-['Plus_Jakarta_Sans_Variable']">
              Welcome Back
            </h2>
            <p className="text-gray-500 text-lg">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200"
                  placeholder="your.email@wldu.edu.et"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <a
                  href="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              Protected by industry-standard security measures
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
