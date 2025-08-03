import React, { useState, useEffect } from 'react';
import { clearanceService } from '../services/clearanceService';
import { toastUtils } from '../utils/toastUtils';
import type { ClearanceRequest, ClearanceStep } from '../types/clearance';

interface RequestDetailsProps {
  request: ClearanceRequest;
  onBack: () => void;
}

const RequestDetails: React.FC<RequestDetailsProps> = ({ request, onBack }) => {
  const [steps, setSteps] = useState<ClearanceStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSteps = async () => {
      try {
        const response = await clearanceService.getClearanceRequestById(request._id);
        if (response.success) {
          setSteps(response.data.steps);
        } else {
          toastUtils.error(response.message || 'Failed to fetch clearance steps.');
        }
      } catch (error) {
        toastUtils.error('An error occurred while fetching steps.');
      }
      setIsLoading(false);
    };
    fetchSteps();
  }, [request._id]);

  const handleUpdateStep = async (stepId: string, status: 'cleared' | 'issue', comment?: string) => {
    if (request.status === 'pending_approval') {
      toastUtils.info('This request has not been approved by the VP yet.');
      return;
    }

    try {
      const response = await clearanceService.updateClearanceStep(stepId, { status, comment });
      if (response.success) {
        toastUtils.success('Step updated successfully.');
        // Refresh steps
        const updatedSteps = await clearanceService.getClearanceRequestById(request._id);
        if (updatedSteps.success) {
          setSteps(updatedSteps.data.steps);
        }
      } else {
        toastUtils.error(response.message || 'Failed to update step.');
      }
    } catch (error) {
      toastUtils.error('An error occurred while updating the step.');
    }
  };

  if (isLoading) {
    return <div>Loading details...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <button onClick={onBack} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg mb-4 hover:bg-gray-300">
        &larr; Back to Requests
      </button>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Clearance Request Details</h1>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div><strong>Reference:</strong> {request.referenceCode}</div>
          <div><strong>Status:</strong> {request.status.replace('_', ' ').toUpperCase()}</div>
          <div><strong>Initiator:</strong> {request.initiatedBy.name}</div>
          <div><strong>Purpose:</strong> {request.purpose}</div>
          <div><strong>Submitted:</strong> {new Date(request.createdAt).toLocaleDateString()}</div>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mt-6 mb-4">Clearance Steps</h2>
        <div className="space-y-4">
          {steps.map((step) => (
            <div key={step.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">{step.department}</div>
                  <div className="text-sm text-gray-600">Status: {step.status}</div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUpdateStep(step.id, 'cleared')}
                    disabled={request.status === 'pending_approval'}
                    className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm disabled:opacity-50">
                    Clear
                  </button>
                  <button
                    onClick={() => {
                      const comment = prompt('Please provide a reason for flagging this issue:');
                      if (comment) {
                        handleUpdateStep(step.id, 'issue', comment);
                      }
                    }}
                    disabled={request.status === 'pending_approval'}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm disabled:opacity-50">
                    Flag Issue
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RequestDetails;
