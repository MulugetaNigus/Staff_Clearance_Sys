import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { clearanceService } from '../services/clearanceService';
import { toastUtils } from '../utils/toastUtils';
import type { ClearanceStep } from '../types/clearance';

const ReviewerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [steps, setSteps] = useState<ClearanceStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentingStepId, setCommentingStepId] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchMySteps = async () => {
      try {
        const response = await clearanceService.getMyReviewSteps();
        if (response.success) {
          setSteps(response.data);
        } else {
          toastUtils.error(response.message || 'Failed to fetch review steps.');
        }
      } catch (error) {
        toastUtils.error('An error occurred while fetching review steps.');
      }
      setIsLoading(false);
    };
    fetchMySteps();
  }, []);

  const handleUpdateStep = async (stepId: string, status: 'cleared' | 'issue') => {
    const step = steps.find((s) => s.id === stepId);
    if (step?.requestId.status === 'pending_approval') {
      toastUtils.info('This request is still awaiting VP approval.');
      return;
    }

    if (status === 'issue' && !comment.trim()) {
      toastUtils.error('A comment is required when flagging an issue.');
      return;
    }

    try {
      const response = await clearanceService.updateClearanceStep(stepId, { status, comment });
      if (response.success) {
        toastUtils.success(`Step successfully updated to ${status}.`);
        setSteps(steps.map(s => s.id === stepId ? { ...s, status: status, comment: comment } : s));
        setCommentingStepId(null);
        setComment('');
      } else {
        toastUtils.error(response.message || 'Failed to update step.');
      }
    } catch (error) {
      toastUtils.error('An error occurred while updating the step.');
    }
  };

  if (isLoading) {
    return <div className="text-center p-10">Loading your assigned reviews...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
        <h1 className="text-3xl font-bold text-gray-900">My Review Queue</h1>
        <p className="text-gray-600 mt-2">Clearance requests assigned to your department.</p>
      </div>

      {steps.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-gray-800">All Clear!</h3>
          <p className="text-gray-500 mt-2">You have no pending reviews at this time. Great job!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div key={step.id} className="bg-white rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden">
              <div className="p-7 flex-grow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{step.requestId.initiatedBy.name}</h3>
                    <p className="text-sm text-gray-500">Request ID: {step.requestId._id.slice(-6).toUpperCase()}</p>
                  </div>
                  <span className={`px-4 py-1 text-xs font-semibold rounded-full ${step.requestId.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                    {step.requestId.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-base text-gray-700 leading-relaxed">
                  <strong className="font-semibold">Purpose:</strong> {step.requestId.purpose}
                </p>
                <p className="text-sm text-gray-500 mt-3">
                  <strong className="font-medium">Submitted:</strong> {new Date(step.requestId.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {step.status === 'pending' && (
                commentingStepId === step.id ? (
                  <div className="p-7 bg-gray-50 border-t border-gray-100">
                    <textarea
                      placeholder="Provide a clear reason for the issue..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full p-4 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800 text-sm"
                      rows={4}
                    />
                    <div className="flex justify-end space-x-4 mt-4">
                      <button
                        onClick={() => { setCommentingStepId(null); setComment(''); }}
                        className="px-6 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateStep(step.id, 'issue')}
                        disabled={!comment.trim()}
                        className="px-6 py-2 text-sm font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Confirm Issue
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end space-x-4">
                    <button
                      onClick={() => setCommentingStepId(step.id)}
                      className="px-6 py-2 text-sm font-medium border border-red-300 text-red-700 rounded-xl hover:bg-red-50 transition-colors duration-200 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Flag Issue
                    </button>
                    <button
                      onClick={() => handleUpdateStep(step.id, 'cleared')}
                      className="px-6 py-2 text-sm font-medium bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Clear
                    </button>
                  </div>
                )
              )}

              {step.status === 'cleared' && (
                <div className="p-6 bg-green-50 border-t border-green-100 flex justify-end space-x-4">
                  <span className="text-green-700 font-semibold flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Cleared
                  </span>
                  <button
                    onClick={() => handleUpdateStep(step.id, 'pending')} // Assuming 'pending' is the state to revert to
                    className="px-6 py-2 text-sm font-medium border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors duration-200 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Undo Clear
                  </button>
                </div>
              )}

              {step.status === 'issue' && (
                <div className="p-6 bg-red-50 border-t border-red-100 flex justify-end space-x-4">
                  <span className="text-red-700 font-semibold flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Issue Flagged
                  </span>
                  <button
                    onClick={() => handleUpdateStep(step.id, 'pending')} // Assuming 'pending' is the state to revert to
                    className="px-6 py-2 text-sm font-medium border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors duration-200 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Undo Issue
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewerDashboard;