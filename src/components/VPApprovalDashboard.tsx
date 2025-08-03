import React, { useState, useEffect } from 'react';
import { clearanceService } from '../services/clearanceService';
import { toastUtils } from '../utils/toastUtils';
import { generateClearanceCertificate } from '../utils/pdfGenerator';
import emailjs from 'emailjs-com';
import type { ClearanceRequest } from '../types/clearance'; // Assuming you have this type

const VPApprovalDashboard: React.FC = () => {
  const [requests, setRequests] = useState<ClearanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await clearanceService.getRequestsForVP();
        if (response.success) {
          setRequests(response.data);
        } else {
          toastUtils.error(response.message || 'Failed to fetch requests for approval.');
        }
      } catch (error) {
        toastUtils.error('An error occurred while fetching requests for approval.');
      }
      setIsLoading(false);
    };
    fetchRequests();
  }, []);

  const handleInitialApproval = async (id: string) => {
    try {
      const response = await clearanceService.approveInitialRequest(id);
      if (response.success) {
        toastUtils.success('Request approved successfully.');
        setRequests(requests.filter(req => req._id !== id));
      } else {
        toastUtils.error(response.message || 'Failed to approve request.');
      }
    } catch (error) {
      toastUtils.error('An error occurred while approving the request.');
    }
  };

  const handleFinalApproval = async (id: string) => {
    try {
      const response = await clearanceService.approveFinalRequest(id);
      if (response.success) {
        toastUtils.success('Final approval successful.');
        setRequests(requests.filter(req => req._id !== id));

        // Generate PDF
        const pdf = generateClearanceCertificate(response.data);
        const pdfData = pdf.output('blob');

        // Send email
        const emailParams = {
          to_name: response.data.initiatedBy.name,
          to_email: response.data.initiatedBy.email,
          from_name: 'Woldia University',
          message: 'Please find your clearance certificate attached.',
        };

        // You would need to configure your EmailJS account and replace these with your actual IDs
        emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', emailParams, 'YOUR_USER_ID')
          .then((result) => {
              console.log(result.text);
              toastUtils.success('Certificate emailed successfully.');
          }, (error) => {
              console.log(error.text);
              toastUtils.error('Failed to email certificate.');
          });

        // Offer PDF download
        pdf.save(`clearance-certificate-${response.data.referenceCode}.pdf`);
      } else {
        toastUtils.error(response.message || 'Failed to grant final approval.');
      }
    } catch (error) {
      toastUtils.error('An error occurred while granting final approval.');
    }
  };

  if (isLoading) {
    return <div className="text-center p-10">Loading VP requests...</div>;
  }

  const initialApprovalRequests = requests.filter(req => req.status === 'pending_vp_approval');
  const finalApprovalRequests = requests.filter(req => req.status === 'in_progress');

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
        <h1 className="text-3xl font-bold text-gray-900">VP Approval Dashboard</h1>
        <p className="text-gray-600 mt-2">Review and approve clearance requests.</p>
      </div>

      {initialApprovalRequests.length === 0 && finalApprovalRequests.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-gray-800">No Pending VP Reviews!</h3>
          <p className="text-gray-500 mt-2">All clearance requests have been reviewed by the VP.</p>
        </div>
      ) : (
        <>
          {initialApprovalRequests.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Initial Approvals</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {initialApprovalRequests.map((request) => (
                  <div key={request._id} className="bg-white rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden">
                    <div className="p-7 flex-grow">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{request.initiatedBy.name}</h3>
                          <p className="text-sm text-gray-500">Request ID: {request._id.slice(-6).toUpperCase()}</p>
                        </div>
                        <span className={`px-4 py-1 text-xs font-semibold rounded-full
                          ${request.status === 'pending_vp_approval' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800' // Default fallback
                        }`}>
                          {request.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-base text-gray-700 leading-relaxed">
                        <strong className="font-semibold">Purpose:</strong> {request.purpose}
                      </p>
                      <p className="text-sm text-gray-500 mt-3">
                        <strong className="font-medium">Submitted:</strong> {new Date(request.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end space-x-4">
                      <button
                        onClick={() => handleInitialApproval(request._id)}
                        className="px-6 py-2 text-sm font-medium bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Approve Initial Request
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {finalApprovalRequests.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Final Approvals</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {finalApprovalRequests.map((request) => (
                  <div key={request._id} className="bg-white rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden">
                    <div className="p-7 flex-grow">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{request.initiatedBy.name}</h3>
                          <p className="text-sm text-gray-500">Request ID: {request._id.slice(-6).toUpperCase()}</p>
                        </div>
                        <span className={`px-4 py-1 text-xs font-semibold rounded-full
                          ${request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800' // Default fallback
                        }`}>
                          {request.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-base text-gray-700 leading-relaxed">
                        <strong className="font-semibold">Purpose:</strong> {request.purpose}
                      </p>
                      <p className="text-sm text-gray-500 mt-3">
                        <strong className="font-medium">Submitted:</strong> {new Date(request.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end space-x-4">
                      <button
                        onClick={() => handleFinalApproval(request._id)}
                        className="px-6 py-2 text-sm font-medium bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Approve Final Request
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VPApprovalDashboard;