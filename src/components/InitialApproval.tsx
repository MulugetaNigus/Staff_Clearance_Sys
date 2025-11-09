import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { ClearanceRequest } from '../types/clearance';

const InitialApproval: React.FC = () => {
  const { user } = useAuth();
  const [reviewingRequest, setReviewingRequest] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data for pending initial approvals
  const mockPendingInitialApprovals: ClearanceRequest[] = [
    {
      id: 'req-001',
      staffId: 'WU-001',
      reason: 'EndOfContract',
      status: 'PendingInitialApproval',
      initiatedAt: new Date('2025-07-29'),
    },
    {
      id: 'req-002',
      staffId: 'WU-002', 
      reason: 'Retirement',
      status: 'PendingInitialApproval',
      initiatedAt: new Date('2025-07-30'),
    }
  ];

  const handleInitialApproval = async (requestId: string, action: 'approve' | 'reject') => {
    setIsSubmitting(true);
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (action === 'approve') {
      console.log(`Initial approval granted for request ${requestId}`);
      // This would trigger creation of all 27 departmental review steps
    } else {
      console.log(`Initial approval rejected for request ${requestId}: ${rejectionReason}`);
    }
    
    setIsSubmitting(false);
    setReviewingRequest(null);
    setRejectionReason('');
  };

  const handleReject = (requestId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    handleInitialApproval(requestId, 'reject');
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6">
        <h1 className="text-3xl font-bold text-gray-900">Initial Clearance Approvals</h1>
        <p className="text-gray-600 mt-2">
          Review and approve clearance requests to begin the departmental review process
        </p>
        <div className="mt-4 bg-white rounded-lg px-4 py-2 shadow-md inline-block">
          <span className="text-sm text-gray-500">Pending Initial Approvals</span>
          <p className="text-lg font-semibold text-gray-900">{mockPendingInitialApprovals.length}</p>
        </div>
      </div>

      <div className="grid gap-6">
        {mockPendingInitialApprovals.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-600">No pending initial approval requests at this time.</p>
          </div>
        ) : (
          mockPendingInitialApprovals.map((request) => (
            <div key={request.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Initial Approval - Request #{request.id.toUpperCase()}
                  </h3>
                  <p className="text-gray-600">
                    Staff ID: {request.staffId} • Reason: {request.reason.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Submitted: {request.initiatedAt.toLocaleDateString()}
                  </p>
                </div>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                  Awaiting Initial Approval
                </span>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-purple-900 mb-2">Your Role as Academic Vice President:</h4>
                <ul className="text-purple-800 text-sm space-y-1">
                  <li>• Review the reason for clearance request</li>
                  <li>• Verify staff member's eligibility for clearance</li>
                  <li>• Give official "go-ahead" to begin departmental review process</li>
                  <li>• If approved, all 27 departments will be notified simultaneously</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Staff Information:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Staff ID:</span>
                    <span className="font-medium text-gray-900 ml-2">{request.staffId}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Department:</span>
                    <span className="font-medium text-gray-900 ml-2">Computer Science</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Clearance Reason:</span>
                    <span className="font-medium text-gray-900 ml-2">
                      {request.reason.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Request Date:</span>
                    <span className="font-medium text-gray-900 ml-2">
                      {request.initiatedAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {reviewingRequest === request.id ? (
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Rejection:
                  </label>
                  <textarea
                    placeholder="Please provide a detailed reason for rejecting this clearance request..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                  />
                  <div className="flex justify-end space-x-3 mt-4">
                    <button
                      onClick={() => {
                        setReviewingRequest(null);
                        setRejectionReason('');
                      }}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      disabled={isSubmitting || !rejectionReason.trim()}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Rejecting...</span>
                        </>
                      ) : (
                        <span>Confirm Rejection</span>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setReviewingRequest(request.id)}
                    className="px-6 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                    disabled={isSubmitting}
                  >
                    Reject Request
                  </button>
                  <button
                    onClick={() => handleInitialApproval(request.id, 'approve')}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Approving...</span>
                      </>
                    ) : (
                      <>
                        <span>🚀</span>
                        <span>Approve & Start Process</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InitialApproval;
