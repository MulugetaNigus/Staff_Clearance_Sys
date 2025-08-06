import React, { useState, useEffect } from 'react';
import { toastUtils } from '../utils/toastUtils';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { generateClearanceCertificate } from '../utils/pdfGenerator';
import { CLEARANCE_DEPARTMENTS } from '../types/departments';
import { clearanceService } from '../services/clearanceService';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [loadedSignatures, setLoadedSignatures] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const loadSignatures = async () => {
      const signaturesToLoad: { [key: string]: string } = {};
      CLEARANCE_DEPARTMENTS.forEach(dept => {
        const key = dept.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        // This assumes a naming convention for signature files, e.g., signature-academicdepartmenthead.png
        // The backend should save signatures with these standardized names.
        signaturesToLoad[key] = `/Backend/uploads/signature-${key}.png`;
      });

      const newSignatures: { [key: string]: string } = {};
      for (const [key, path] of Object.entries(signaturesToLoad)) {
        try {
          const response = await fetch(path);
          if (!response.ok) {
            console.warn(`Signature for ${key} not found at ${path}`);
            continue;
          }
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            newSignatures[key] = reader.result as string;
            setLoadedSignatures(prev => ({ ...prev, [key]: reader.result as string }));
          };
          reader.readAsDataURL(blob);
        } catch (error) {
          console.error(`Error loading signature ${key} from ${path}:`, error);
        }
      }
    };

    loadSignatures();
  }, []); // Empty dependency array means this runs once on mount

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
      if (err.response && err.response.data && err.response.data.message === 'Account is deactivated. Contact support.') {
        toastUtils.auth.accountDeactivated();
      } else {
        toastUtils.auth.loginError(err);
      }
    }
  };

  const handleDownloadSamplePdf = async () => {
    const sampleRequest = {
      _id: '65c7b1f1f1d1e1c1b1a1a1a1',
      referenceCode: 'WU-CLR-2025-001',
      initiatedBy: {
        _id: '65c7b1f1f1d1e1c1b1a1a1a2',
        name: 'Mulugeta Nigus',
        department: 'Computer Science',
        staffId: '2025-CS-013',
      },
      purpose: 'Resignation',
      status: 'cleared',
      createdAt: '2025-07-28T10:00:00Z',
      updatedAt: '2025-08-04T15:30:00Z',
      steps: CLEARANCE_DEPARTMENTS.map((dept, index) => ({
        id: `step${index + 1}`,
        requestId: '65c7b1f1f1d1e1c1b1a1a1a1',
        department: dept.name,
        status: 'cleared',
        comment: `${dept.responsibilities.split('.')[0]}.`,
        reviewerName: `Reviewer ${dept.name}`,
        createdAt: new Date(Date.now() - (27 - index) * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - (27 - index) * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
      })),
    };

    const sampleSignatures: { [key: string]: string } = {};
    CLEARANCE_DEPARTMENTS.forEach(dept => {
      const key = dept.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      sampleSignatures[key] = loadedSignatures[key] || '[sample_signature_placeholder]';
    });

    try {
      const pdfDoc = await generateClearanceCertificate(sampleRequest, sampleSignatures);
      pdfDoc.save('sample_cleared_certificate_all_departments.pdf');
      toastUtils.success('Sample PDF with all departments downloaded!');
    } catch (error) {
      console.error('Error generating sample PDF:', error);
      toastUtils.error('Failed to generate sample PDF.');
    }
  };

  

  const handleDownloadRealPdf = async () => {
    const referenceCode = prompt('Enter the reference code for the clearance request:');
    if (!referenceCode) {
      toastUtils.error('Reference code is required.');
      return;
    }

    const loadingToast = toastUtils.loading('Fetching clearance request...');
    try {
      const realRequest = await clearanceService.getClearanceRequestByReferenceCode(referenceCode);
      toastUtils.dismiss(loadingToast);

      if (!realRequest) {
        toastUtils.error('Clearance request not found.');
        return;
      }

      const realSignatures: { [key: string]: string } = {};
      for (const step of realRequest.steps) {
        if (step.status === 'cleared' && step.signature) {
          try {
            const response = await fetch(`/Backend/${step.signature}`);
            if (response.ok) {
              const blob = await response.blob();
              const reader = new FileReader();
              await new Promise((resolve) => {
                reader.onloadend = () => {
                  realSignatures[step.department.toLowerCase().replace(/[^a-z0-9]/g, '')] = reader.result as string;
                  resolve(null);
                };
                reader.readAsDataURL(blob);
              });
            }
          } catch (error) {
            console.error(`Error loading signature for ${step.department}:`, error);
          }
        }
      }

      CLEARANCE_DEPARTMENTS.forEach(dept => {
        const key = dept.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!realSignatures[key]) {
          realSignatures[key] = loadedSignatures[key] || '[signature_not_loaded]';
        }
      });

      const pdfDoc = await generateClearanceCertificate(realRequest, realSignatures);
      pdfDoc.save(`cleared_certificate_${referenceCode}.pdf`);
      toastUtils.success('Real PDF downloaded successfully!');
    } catch (error) {
      toastUtils.dismiss(loadingToast);
      console.error('Error generating real PDF:', error);
      toastUtils.error('Failed to generate real PDF. Make sure the reference code is correct and the request is cleared.');
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
                <a href="#" className="text-sm text-blue-600 hover:underline">
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

          <div className="mt-6 text-center">
            <button
              onClick={handleDownloadSamplePdf}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-lg font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ease-in-out"
            >
              Download Sample Cleared PDF
            </button>
            {/* <button
              onClick={handleDownloadRealPdf}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-lg font-semibold text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 ease-in-out mt-4"
            >
              Download Real Cleared PDF (for testing)
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

