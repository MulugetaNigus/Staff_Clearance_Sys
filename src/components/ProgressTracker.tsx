import React from 'react';
import type { ClearanceStep } from '../types/clearance';
import { getDepartmentByRole } from '../types/departments';
import { FaInbox } from 'react-icons/fa';

interface ProgressTrackerProps {
  steps: ClearanceStep[];
}

const statusStyles = {
  pending: { icon: 'P', color: 'bg-yellow-500', textColor: 'text-yellow-800', labelColor: 'bg-yellow-100 text-yellow-800', shadow: 'shadow-yellow-200' },
  cleared: { icon: '✓', color: 'bg-green-500', textColor: 'text-green-800', labelColor: 'bg-green-100 text-green-800', shadow: 'shadow-green-200' },
  issue: { icon: '✗', color: 'bg-red-500', textColor: 'text-red-800', labelColor: 'bg-red-100 text-red-800', shadow: 'shadow-red-200' },
};

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ steps }) => {
  if (!steps || steps.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-blue-600 text-center flex flex-col justify-center items-center h-full">
        <div className="w-28 h-28 bg-gray-100 rounded-full flex items-center justify-center border-4 border-gray-200 mb-6">
          <FaInbox className="text-5xl text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">No Active Clearance Request</h2>
        <p className="text-gray-500 mt-2 max-w-sm mx-auto">
          It looks like you don't have any ongoing clearance requests. When you start one, its progress will be tracked here.
        </p>
      </div>
    );
  }

  const getStepInfo = (step: ClearanceStep) => {
    const department = getDepartmentByRole(step.reviewerRole);
    return {
      name: department?.name || step.department,
      order: department?.order || 0,
    };
  };

  const sortedSteps = [...steps].sort((a, b) => getStepInfo(a).order - getStepInfo(b).order);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-blue-600">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Clearance Progress</h2>
      <div className="relative pl-4">
        {/* Vertical line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" aria-hidden="true"></div>

        {sortedSteps.map((step) => {
          const stepInfo = getStepInfo(step);
          const status = statusStyles[step.status];

          return (
            <div key={step.id} className="relative mb-8">
              <div className="flex items-center">
                {/* Status Icon */}
                <div className={`z-10 flex items-center justify-center w-12 h-12 rounded-full ${status.color} text-white font-bold text-lg shadow-md ${status.shadow}`}>
                  {status.icon}
                </div>
                {/* Department Name and Status Label*/}
                <div className="ml-6 flex items-center justify-between bg-gray-100 rounded-lg px-4 py-3 w-full">
                    <p className={`font-semibold text-lg ${status.textColor}`}>{stepInfo.name}</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${status.labelColor}`}>
                        {step.status}
                    </span>
                </div>
              </div>

              {/* Details Section */}
              {(step.status === 'issue' || step.status === 'cleared') && (
                <div className="ml-18 mt-2 pl-4 border-l-2 border-gray-200 py-2">
                  {step.status === 'issue' && step.comment && (
                    <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                      <p className="font-semibold text-red-700">Comment:</p>
                      <p className="text-sm text-red-600">{step.comment}</p>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    <p>Last Updated: {new Date(step.lastUpdatedAt).toLocaleString()}</p>
                    {step.reviewedBy && <p>Reviewed by: {step.reviewedBy.name}</p>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressTracker;