import React from 'react';
import { getDepartmentByRole } from '../types/departments';
import { FaInbox, FaClock, FaCheck, FaExclamationTriangle, FaLock } from 'react-icons/fa';

interface EnhancedClearanceStep {
  id: string;
  requestId: string;
  department: string;
  reviewerRole: string;
  status: 'pending' | 'available' | 'cleared' | 'issue' | 'blocked';
  comment?: string;
  lastUpdatedAt: string;
  reviewedBy?: { name: string };
  order: number;
  notes?: string;
  signature?: string;
  stage?: string;
  description?: string;
  isSequential?: boolean;
  dependsOn?: number[];
  isInterdependent?: boolean;
  interdependentWith?: string[];
  vpSignatureType?: 'initial' | 'final';
  canProcess?: boolean;
}

interface ProgressTrackerProps {
  steps: EnhancedClearanceStep[];
}

const statusStyles = {
  pending: { icon: FaClock, color: 'bg-gray-400', textColor: 'text-gray-800', labelColor: 'bg-gray-100 text-gray-800', shadow: 'shadow-gray-200', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' },
  available: { icon: FaClock, color: 'bg-blue-500', textColor: 'text-blue-800', labelColor: 'bg-blue-100 text-blue-800', shadow: 'shadow-blue-200', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  cleared: { icon: FaCheck, color: 'bg-green-500', textColor: 'text-green-800', labelColor: 'bg-green-100 text-green-800', shadow: 'shadow-green-200', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  issue: { icon: FaExclamationTriangle, color: 'bg-red-500', textColor: 'text-red-800', labelColor: 'bg-red-100 text-red-800', shadow: 'shadow-red-200', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  blocked: { icon: FaLock, color: 'bg-yellow-500', textColor: 'text-yellow-800', labelColor: 'bg-yellow-100 text-yellow-800', shadow: 'shadow-yellow-200', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
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

  const getStepInfo = (step: EnhancedClearanceStep) => {
    const department = getDepartmentByRole(step.reviewerRole);
    return {
      name: department?.name || step.department,
      order: department?.order || 0,
    };
  };

  // Group steps by stage for better visualization
  const groupedSteps = steps.reduce((acc, step) => {
    const stage = step.stage || 'General';
    if (!acc[stage]) {
      acc[stage] = [];
    }
    acc[stage].push(step);
    return acc;
  }, {} as Record<string, EnhancedClearanceStep[]>);

  // Sort stages by workflow order
  const stageOrder = [
    'Initiation',
    'General Departmental Clearance',
    'Conditional & Interdependent Clearances',
    'Financial Clearance',
    'Human Resource & Final Approvals',
    'Archiving'
  ];

  const sortedStages = stageOrder.filter(stage => groupedSteps[stage]);

  const getStageProgress = (stageSteps: EnhancedClearanceStep[]) => {
    const total = stageSteps.length;
    const completed = stageSteps.filter(step => step.status === 'cleared').length;
    const available = stageSteps.filter(step => step.status === 'available').length;
    const issues = stageSteps.filter(step => step.status === 'issue').length;
    
    return { total, completed, available, issues, percentage: total > 0 ? (completed / total) * 100 : 0 };
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-blue-600">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Enhanced Clearance Progress</h2>
        <div className="text-sm text-gray-500">
          {steps.filter(s => s.status === 'cleared').length} of {steps.length} steps completed
        </div>
      </div>

      <div className="space-y-8">
        {sortedStages.map((stageName, stageIndex) => {
          const stageSteps = groupedSteps[stageName].sort((a, b) => a.order - b.order);
          const stageProgress = getStageProgress(stageSteps);
          const isStageActive = stageSteps.some(step => step.status === 'available');
          const isStageCompleted = stageSteps.every(step => step.status === 'cleared');

          return (
            <div key={stageName} className="relative">
              {/* Stage Header */}
              <div className={`flex items-center justify-between p-4 rounded-lg border-2 mb-4 ${
                isStageCompleted ? 'bg-green-50 border-green-200' :
                isStageActive ? 'bg-blue-50 border-blue-200' :
                'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isStageCompleted ? 'bg-green-500 text-white' :
                    isStageActive ? 'bg-blue-500 text-white' :
                    'bg-gray-400 text-white'
                  }`}>
                    {stageIndex + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">{stageName}</h3>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    {stageProgress.completed}/{stageProgress.total} completed
                  </div>
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ width: `${stageProgress.percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Stage Steps */}
              <div className="relative pl-4">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" aria-hidden="true"></div>
                
                {stageSteps.map((step) => {
                  const stepInfo = getStepInfo(step);
                  const status = statusStyles[step.status as keyof typeof statusStyles] || statusStyles.pending;
                  const IconComponent = status.icon;

                  return (
                    <div key={step.id} className="relative mb-6">
                      <div className="flex items-center">
                        {/* Status Icon */}
                        <div className={`z-10 flex items-center justify-center w-12 h-12 rounded-full ${status.color} text-white shadow-md ${status.shadow}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        
                        {/* Step Card */}
                        <div className={`ml-6 flex-1 rounded-lg border-2 ${status.borderColor} ${status.bgColor} p-4`}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className={`font-semibold text-lg ${status.textColor}`}>
                                {stepInfo.name}
                              </h4>
                              {step.description && (
                                <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                              )}
                              
                              {/* VP Signature Type */}
                              {step.vpSignatureType && (
                                <div className="mt-2">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    step.vpSignatureType === 'initial' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                  }`}>
                                    {step.vpSignatureType === 'initial' ? 'Initial VP Validation' : 'Final VP Oversight'}
                                  </span>
                                </div>
                              )}
                              
                              {/* Interdependency Notice */}
                              {step.isInterdependent && (
                                <div className="mt-2">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    Interdependent with: {step.interdependentWith?.join(', ')}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <div className="ml-4">
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${status.labelColor}`}>
                                {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                              </span>
                            </div>
                          </div>

                          {/* Additional Details */}
                          {(step.status === 'issue' || step.status === 'cleared' || step.comment) && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              {step.comment && (
                                <div className={`p-3 rounded-lg border ${
                                  step.status === 'issue' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                                }`}>
                                  <p className={`font-semibold ${
                                    step.status === 'issue' ? 'text-red-700' : 'text-green-700'
                                  }`}>Comment:</p>
                                  <p className={`text-sm ${
                                    step.status === 'issue' ? 'text-red-600' : 'text-green-600'
                                  }`}>{step.comment}</p>
                                </div>
                              )}
                              
                              <div className="text-xs text-gray-500 mt-3 grid grid-cols-2 gap-4">
                                <div>
                                  <p>Order: #{step.order}</p>
                                  <p>Last Updated: {new Date(step.lastUpdatedAt).toLocaleString()}</p>
                                </div>
                                {step.reviewedBy && (
                                  <div>
                                    <p>Reviewed by: {step.reviewedBy.name}</p>
                                    <p>Can Process: {step.canProcess ? 'Yes' : 'No'}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressTracker;