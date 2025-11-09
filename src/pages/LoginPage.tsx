import React, { useState } from 'react';
import { toastUtils } from '../utils/toastUtils';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { generateClearanceCertificate } from '../utils/pdfGenerator';
import { CLEARANCE_DEPARTMENTS } from '../types/departments';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toastUtils.loading('Signing in...');
    try {
      const { mustChangePassword } = await login({ email, password });
      toastUtils.dismiss(loadingToast);
      toastUtils.auth.loginSuccess();
      if (mustChangePassword) {
        navigate('/force-change-password');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toastUtils.dismiss(loadingToast);
      if ((err as any).response && (err as any).response.data && (err as any).response.data.message === 'Account is deactivated. Contact support.') {
        toastUtils.auth.accountDeactivated();
      } else {
        console.error('Error during login:', (err as Error).message || err);
        toastUtils.auth.loginError(err as Error);
      }
    }
  };

  const handleDownloadSamplePdf = async (e?: React.MouseEvent) => {
    console.log('PDF button clicked!');
    
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const loadingToast = toastUtils.loading('Generating sample PDF...');
    
    try {
      // Enhanced sample data that meets new validation requirements
      const sampleRequest = {
        _id: '65c7b1f1f1d1e1c1b1a1a1a1',
        referenceCode: 'WU-CLR-2025-DEMO-001',
        initiatedBy: {
          _id: '65c7b1f1f1d1e1c1b1a1a1a2',
          name: 'Mulugeta Nigus',
          department: 'Computer Science',
          staffId: 'WU-CS-2025-013',
          email: 'mulugeta.nigus@wldu.edu.et'
        },
        status: 'cleared',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        
        steps: CLEARANCE_DEPARTMENTS.slice(0, 25).map((dept, index) => ({
          _id: `step${index + 1}`,
          requestId: '65c7b1f1f1d1e1c1b1a1a1a1',
          department: dept.name,
          reviewerRole: dept.reviewerRole,
          status: 'cleared',
          comment: `Cleared by ${dept.name}. All requirements met and documentation verified.`,
          signature: '', // Will be fetched from backend
          order: dept.order,
          createdAt: new Date(Date.now() - (30 - index) * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - (25 - index) * 24 * 60 * 60 * 1000).toISOString(),
          approvedAt: new Date(Date.now() - (25 - index) * 24 * 60 * 60 * 1000 + 3600000).toISOString()
        })).concat([
          // Add VP Final signature as separate step
          {
            _id: 'step26',
            requestId: '65c7b1f1f1d1e1c1b1a1a1a1',
            department: 'Academic Vice President (Final Oversight)',
            reviewerRole: 'AcademicVicePresident',
            status: 'cleared',
            comment: 'Final oversight approval granted after all departmental clearances completed.',
            signature: '', // Will be fetched from backend
            order: 11,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            approvedAt: new Date().toISOString()
          }
        ])
      };

      // For now, let validation handle empty signatures with proper placeholders
      console.log('Generating PDF with signature validation...');
      
      // Try to fetch a real clearance request from your database for testing
      let realRequestData = null;
      let signaturesFromBackend = {};
      
      try {
        // Fetch signatures first
        console.log('🔧 Attempting to fetch signatures from: http://localhost:5000/api/signatures/sample');
        const sigResponse = await fetch('http://localhost:5000/api/signatures/sample');
        console.log('📡 Signature API response status:', sigResponse.status);
        
        if (sigResponse.ok) {
          // First get the response text to debug what we're actually receiving
          const responseText = await sigResponse.text();
          console.log('📦 Raw signature API response text (first 200 chars):', responseText.substring(0, 200));
          
          try {
            const sigData = JSON.parse(responseText);
            console.log('📦 Parsed signature API response:', sigData);
            signaturesFromBackend = sigData.data?.signatures || {};
            console.log(`✅ Fetched ${Object.keys(signaturesFromBackend).length} signatures from backend`);
            console.log('🔑 Available signature keys:', Object.keys(signaturesFromBackend));
          } catch (parseError) {
            console.error('❌ JSON parsing failed:', parseError);
            console.error('❌ Response was HTML, not JSON. Response text:', responseText.substring(0, 500));
          }
        } else {
          const errorText = await sigResponse.text();
          console.error('❌ Signature API error:', sigResponse.status, errorText);
        }

        // Try to fetch the specific request from your database
        const reqResponse = await fetch('http://localhost:5000/api/clearance/requests/68a8d10025faadef8335ad1e');
        if (reqResponse.ok) {
          realRequestData = await reqResponse.json();
          console.log('✅ Using real request data from database:', realRequestData?.data?.referenceCode);
        } else {
          console.warn('Could not fetch real request, using sample data');
        }
      } catch (fetchError) {
        console.warn('Failed to fetch data from backend:', fetchError);
      }

      // Use real request data if available, otherwise fall back to sample
      let requestToUse = realRequestData?.data || sampleRequest;
      console.log('📄 Using request data:', requestToUse.referenceCode);
      console.log('📋 Request steps count:', requestToUse.steps?.length || 0);

      // Manually inject VP signatures into the steps array for the PDF generator
      if (realRequestData?.data) {
        const vpInitialStep = requestToUse.steps.find((step: any) => step.vpSignatureType === 'initial');
        if (vpInitialStep && realRequestData.data.vpInitialSignature) {
          console.log('💉 Injecting VP Initial Signature into steps array...');
          vpInitialStep.signature = realRequestData.data.vpInitialSignature;
        }

        const vpFinalStep = requestToUse.steps.find((step: any) => step.vpSignatureType === 'final');
        if (vpFinalStep && realRequestData.data.vpFinalSignature) {
          console.log('💉 Injecting VP Final Signature into steps array...');
          vpFinalStep.signature = realRequestData.data.vpFinalSignature;
        }
      }
      
      const pdfDoc = await generateClearanceCertificate(requestToUse, signaturesFromBackend);
      
      console.log('PDF generated, attempting to save...');
      pdfDoc.save(`cleared_certificate_${requestToUse.referenceCode}.pdf`);
      
      toastUtils.dismiss(loadingToast);
      toastUtils.success(`✅ PDF generated successfully for ${requestToUse.referenceCode}!`);
      
    } catch (error) {
      toastUtils.dismiss(loadingToast);
      console.error('Error generating sample PDF:', error);
      toastUtils.error(`❌ Failed to generate PDF: ${(error as Error).message || 'Unknown error'}`);
    }
  };

  


  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="grid md:grid-cols-2 gap-8 max-w-6xl w-full bg-white shadow-2xl rounded-2xl overflow-hidden">
        
        {/* Branding Section */}
        <div className="hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-blue-700 to-indigo-900 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-blue-800 opacity-20 transform -skew-y-12 scale-150"></div>
          <div className="relative z-10">
            <div className="mb-6 flex items-center">
              <span className="text-5xl font-bold bg-white text-blue-700 rounded-full px-4 py-2">WU</span>
            </div>
            <h1 className="text-5xl font-extrabold leading-tight tracking-tighter animate-fade-in-down">Woldia University</h1>
            <p className="text-xl mt-4 font-light text-blue-200 animate-fade-in-up">Streamlining the clearance process for a seamless transition.</p>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-8 md:p-12">
          <div className="text-center md:text-left mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-500 mt-2">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                placeholder="your.email@wldu.edu.et"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 transition-all duration-300 ease-in-out transform hover:scale-102 group"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  <div className="flex items-center">
                    <span>Sign In</span>
                    <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Move PDF button completely outside the form container */}
      <div className="mt-6 max-w-md mx-auto">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDownloadSamplePdf(e);
          }}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-lg font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ease-in-out"
        >
          Download Sample Cleared PDF
        </button>
      </div>
      
    </div>
  );
};

export default LoginPage;

