import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { clearanceService } from '../services/clearanceService';
import { toastUtils } from '../utils/toastUtils';
import type { ClearanceRequest } from '../types/clearance';

const HRPendingRequestsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ClearanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);

  useEffect(() => {
    const fetchHRPendingRequests = async () => {
      try {
        const response = await clearanceService.getHRPendingRequests();
        if (response.success) {
          setRequests(response.data);
        } else {
          toastUtils.error(response.message || 'Failed to fetch HR pending requests.');
        }
      } catch (error) {
        toastUtils.error('An error occurred while fetching HR pending requests.');
      }
      setIsLoading(false);
    };
    fetchHRPendingRequests();
  }, []);

  const handleHRReview = async (requestId: string, action: 'approve' | 'reject') => {
    if (action === 'reject' && !rejectionReason.trim()) {
      toastUtils.error('Rejection reason is required.');
      return;
    }

    try {
      const response = await clearanceService.hrReviewRequest(requestId, action, rejectionReason);
      if (response.success) {
        toastUtils.success(`Request ${action === 'approve' ? 'approved and sent to VP' : 'rejected'} successfully.`);
        // Remove the reviewed request from the list
        setRequests(requests.filter(req => req._id !== requestId));
        setRejectingRequestId(null);
        setRejectionReason('');
      } else {
        toastUtils.error(response.message || `Failed to ${action} request.`);
      }
    } catch (error) {
      toastUtils.error(`An error occurred while ${action}ing the request.`);
    }
  };

  if (isLoading) {
    return <div className="text-center p-10">Loading HR pending requests...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
        <h1 className="text-3xl font-bold text-gray-900">HR Pending Clearance Requests</h1>
        <p className="text-gray-600 mt-2">Requests awaiting your review before forwarding to the VP.</p>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-gray-800">No Pending HR Reviews!</h3>
          <p className="text-gray-500 mt-2">All clearance requests have been reviewed by HR.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => (
            <div key={request._id} className="bg-white rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden">
              <div className="p-7 flex-grow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{request.initiatedBy.name}</h3>
                    <p className="text-sm text-gray-500">Request ID: {request._id.slice(-6).toUpperCase()}</p>
                  </div>
                  <span className={`px-4 py-1 text-xs font-semibold rounded-full
                    ${request.status === 'pending_hr_review' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'rejected' ? 'bg-red-100 text-red-800' :
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
                {request.rejectionReason && (
                  <p className="text-sm text-red-500 mt-2">
                    <strong className="font-medium">Reason:</strong> {request.rejectionReason}
                  </p>
                )}
              </div>

              {request.status === 'pending_hr_review' && (
                rejectingRequestId === request._id ? (
                  <div className="p-7 bg-gray-50 border-t border-gray-100">
                    <textarea
                      placeholder="Provide a clear reason for rejection..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full p-4 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800 text-sm"
                      rows={4}
                    />
                    <div className="flex justify-end space-x-4 mt-4">
                      <button
                        onClick={() => { setRejectingRequestId(null); setRejectionReason(''); }}
                        className="px-6 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleHRReview(request._id, 'reject')}
                        disabled={!rejectionReason.trim()}
                        className="px-6 py-2 text-sm font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Confirm Reject
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end space-x-4">
                    <button
                      onClick={() => setRejectingRequestId(request._id)}
                      className="px-6 py-2 text-sm font-medium border border-red-300 text-red-700 rounded-xl hover:bg-red-50 transition-colors duration-200 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Reject
                    </button>
                    <button
                      onClick={() => handleHRReview(request._id, 'approve')}
                      className="px-6 py-2 text-sm font-medium bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Approve & Forward
                    </button>
                  </div>
                )
              )}

              {request.status === 'rejected' && (
                <div className="p-6 bg-red-50 border-t border-red-100 flex justify-end space-x-4">
                  <span className="text-red-700 font-semibold flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Rejected by HR
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HRPendingRequestsDashboard;
