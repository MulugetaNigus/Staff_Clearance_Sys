import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { clearanceService } from '../services/clearanceService';
import { CheckCircle, XCircle, AlertTriangle, Loader, ShieldCheck } from 'lucide-react';

interface VerificationDetails {
  staffName: string;
  department: string;
  staffId: string;
  referenceCode: string;
  issueDate: string;
  generatedAt: string;
}

const VerificationPage: React.FC = () => {
  const { referenceCode } = useParams<{ referenceCode: string }>();
  const [details, setDetails] = useState<VerificationDetails | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyRequest = async () => {
      if (!referenceCode) return;
      try {
        const response = await clearanceService.verifyClearanceRequest(referenceCode);
        if (response.success) {
          setIsValid(response.isValid);
          setDetails(response.details);
        } else {
          setIsValid(false);
          setError(response.message || 'Verification failed');
        }
      } catch (err) {
        setIsValid(false);
        setError('Unable to verify certificate. Please check your connection or try again.');
      } finally {
        setIsLoading(false);
      }
    };

    verifyRequest();
  }, [referenceCode]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Verifying certificate authenticity...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header Banner */}
        <div className={`p-6 text-center ${isValid ? 'bg-green-600' : 'bg-red-600'}`}>
          <div className="flex justify-center mb-4">
            {isValid ? (
              <div className="bg-white p-3 rounded-full shadow-lg">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            ) : (
              <div className="bg-white p-3 rounded-full shadow-lg">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {isValid ? 'Officially Verified' : 'Verification Failed'}
          </h1>
          <p className="text-white/90 text-sm">
            {isValid
              ? 'This certificate is valid and authentic.'
              : 'This certificate could not be verified.'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {isValid && details ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 text-blue-900 mb-6">
                <ShieldCheck className="w-5 h-5" />
                <span className="font-semibold tracking-wide text-sm uppercase">Woldia University</span>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Staff Name</p>
                  <p className="font-semibold text-gray-900">{details.staffName}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Department</p>
                  <p className="font-medium text-gray-900">{details.department}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Staff ID</p>
                    <p className="font-medium text-gray-900">{details.staffId}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Issue Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(details.issueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-4">
                  <p className="text-xs text-blue-600 uppercase tracking-wider mb-1">Reference Code</p>
                  <p className="font-mono font-bold text-blue-800 tracking-wider">{details.referenceCode}</p>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-400">
                  Verified at {new Date().toLocaleString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-100 flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <h3 className="text-sm font-bold text-red-800">Invalid Certificate</h3>
                  <p className="text-xs text-red-600 mt-1">
                    The reference code provided does not match any valid clearance records in our system.
                  </p>
                </div>
              </div>

              <div className="text-sm text-gray-600 px-4">
                <p className="mb-2">Possible reasons:</p>
                <ul className="list-disc text-left pl-6 space-y-1 text-xs">
                  <li>The certificate has been revoked.</li>
                  <li>The reference code is incorrect.</li>
                  <li>The clearance process is not yet complete.</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-gray-100 mt-4">
                <p className="text-xs text-gray-500">
                  If you believe this is an error, please contact the<br />
                  <span className="font-semibold text-gray-700">Office of the Registrar</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Woldia University Teacher Clearance System
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
