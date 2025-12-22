import React, { useState, useEffect } from 'react';
import SignatureModal from './SignatureModal';
import { useAuth } from '../context/AuthContext';
import { clearanceService } from '../services/clearanceService';
import { toastUtils } from '../utils/toastUtils';
import type { ClearanceRequest, ClearanceStep } from '../types/clearance';
import { FaFilePdf, FaFileImage, FaDownload, FaEye, FaTimes, FaTrash } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'https://staffclearancesys.onrender.com';

const getFileIcon = (fileName: string) => {
  if (fileName.endsWith('.pdf')) return <FaFilePdf className="text-red-500 text-3xl" />;
  if (/\.(jpg|jpeg|png|gif)$/i.test(fileName)) return <FaFileImage className="text-blue-500 text-3xl" />;
  return null;
};

const ReviewerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [steps, setSteps] = useState<ClearanceStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentingStepId, setCommentingStepId] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [signingStepId, setSigningStepId] = useState<string | null>(null);
  const [approvalInitiated, setApprovalInitiated] = useState(false);

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
        toastUtils.error(error);
      }
      setIsLoading(false);
    };
    fetchMySteps();
  }, []);

  const handleUpdateStep = async (stepId: string, status: 'cleared' | 'issue' | 'pending', signature?: string) => {
    const step = steps.find((s) => s._id === stepId);
    if (step?.requestId.status === 'pending_approval') {
      toastUtils.info('This request is still awaiting VP approval.');
      return;
    }

    if (status === 'issue' && !comment.trim()) {
      toastUtils.form.validationError('A comment is required when flagging an issue.');
      return;
    }

    setApprovalInitiated(true);
    try {
      const response = await clearanceService.updateClearanceStep(stepId, { status, comment, signature });
      if (response.success) {
        // Use enhanced clearance toast with step department/name
        toastUtils.clearance.stepUpdateSuccess(step?.department, status);
        setSteps(steps.map(s => s._id === stepId ? { ...s, status: status, comment: comment } : s));
        setCommentingStepId(null);
        setComment('');
      } else {
        toastUtils.clearance.stepUpdateError(response.message || 'Failed to update step.');
      }
    } catch (error) {
      toastUtils.clearance.stepUpdateError(error);
    } finally {
      setApprovalInitiated(false);
    }
  };

  const handleSaveSignature = async (signature: string) => {
    if (signingStepId) {
      setApprovalInitiated(true);
      try {
        await handleUpdateStep(signingStepId, 'cleared', signature);
      } finally {
        setApprovalInitiated(false);
      }
      setIsSignatureModalOpen(false);
      setSigningStepId(null);
    }
  };

  const handleHideStep = async (stepId: string) => {
    if (window.confirm('Are you sure you want to hide this step from your view?')) {
      try {
        const response = await clearanceService.hideClearanceStep(stepId);
        if (response.success) {
          toastUtils.clearance.hideStepSuccess();
          setSteps(steps.filter(s => s._id !== stepId));
        } else {
          toastUtils.clearance.hideStepError(response.message || 'Failed to hide step.');
        }
      } catch (error) {
        toastUtils.clearance.hideStepError(error);
      }
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
        <div className="space-y-8">
          {steps.filter(step => step.requestId).map((step) => (
            <div key={step._id} className="bg-white rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden">
              <div className="p-7 flex-grow">
                {/* Staff Information Section */}
                {step.requestId && step.requestId.formData && (step.requestId.formData.firstName || step.requestId.formData.lastName || step.requestId.formData.phoneNumber) && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6 border border-blue-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <span className="mr-2">👤</span> Staff Information
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      {step.requestId.formData.firstName && (
                        <div>
                          <span className="text-gray-500">First Name:</span>
                          <p className="font-semibold text-gray-900">{step.requestId.formData.firstName}</p>
                        </div>
                      )}
                      {step.requestId.formData.lastName && (
                        <div>
                          <span className="text-gray-500">Last Name:</span>
                          <p className="font-semibold text-gray-900">{step.requestId.formData.lastName}</p>
                        </div>
                      )}
                      {step.requestId.formData.phoneNumber && (
                        <div>
                          <span className="text-gray-500">Phone Number:</span>
                          <p className="font-semibold text-gray-900">{step.requestId.formData.phoneNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Request Info */}
                  <div className="md:col-span-2">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">📄</span>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {step.requestId?.referenceCode || 'Unknown Request'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Submitted: {step.requestId?.createdAt ? new Date(step.requestId.createdAt).toLocaleString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <span className={`px-4 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800`}>
                        {step.requestId?.status?.replace('_', ' ').toUpperCase() || 'N/A'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                      <p><strong>Purpose:</strong> {step.requestId?.purpose || 'N/A'}</p>
                      <p><strong>Department:</strong> {step.requestId?.formData?.department || 'N/A'}</p>
                      <p><strong>Teacher ID:</strong> {step.requestId?.formData?.teacherId || 'N/A'}</p>
                      <p><strong>Submitted:</strong> {step.requestId?.createdAt ? new Date(step.requestId.createdAt).toLocaleString() : 'N/A'}</p>
                    </div>
                  </div>

                  {/* Uploaded Files */}
                  <div className="md:col-span-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Uploaded Files</h4>
                    {step.requestId?.uploadedFiles && step.requestId.uploadedFiles.length > 0 ? (
                      <ul className="space-y-3">
                        {step.requestId.uploadedFiles
                          .filter(file => {
                            const userRole = user?.role;
                            if (!userRole) return false;

                            // Reviewers should only see files marked as 'all'
                            return file.visibility === 'all';
                          })
                          .map(file => (
                            <li key={file._id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                              <div className="flex items-center space-x-3 overflow-hidden">
                                {getFileIcon(file.fileName)}
                                <span className="text-sm font-medium text-gray-800 truncate">{file.fileName}</span>
                              </div>
                              <div className="flex items-center space-x-2 flex-shrink-0">
                                <a href={`${API_BASE_URL}/${file.filePath}`} download target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 hover:text-blue-600">
                                  <FaDownload />
                                </a>
                                <button onClick={() => setPreviewFile(`${API_BASE_URL}/${file.filePath}`)} className="p-2 text-gray-500 hover:text-green-600">
                                  <FaEye />
                                </button>
                              </div>
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No files uploaded.</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Actions */}
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end items-center space-x-4">
                {step.status === 'cleared' ? (
                  <div className="flex items-center space-x-4">
                    <button onClick={() => handleUpdateStep(step._id, 'pending')} className="px-6 py-2 text-sm font-medium bg-yellow-500 text-white rounded-xl hover:bg-yellow-600">
                      Unclear
                    </button>
                    <button onClick={() => handleHideStep(step._id)} className="p-2 text-gray-500 hover:text-red-600">
                      <FaTrash />
                    </button>
                  </div>
                ) : step.status === 'issue' ? (
                  <div className="flex items-center space-x-4">
                    <button onClick={() => handleUpdateStep(step._id, 'pending')} className="px-6 py-2 text-sm font-medium bg-yellow-500 text-white rounded-xl hover:bg-yellow-600">
                      Unflag
                    </button>
                    <button onClick={() => handleHideStep(step._id)} className="p-2 text-gray-500 hover:text-red-600">
                      <FaTrash />
                    </button>
                  </div>
                ) : commentingStepId === step._id ? (
                  <div className="w-full">
                    <textarea
                      placeholder="Provide a clear reason for the issue..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full p-4 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800 text-sm"
                      rows={4}
                    />
                    <div className="flex justify-end space-x-4 mt-4">
                      <button onClick={() => setCommentingStepId(null)} className="px-6 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-100">
                        Cancel
                      </button>
                      <button onClick={() => handleUpdateStep(step._id, 'issue')} disabled={!comment.trim()} className="px-6 py-2 text-sm font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50">
                        Flag Issue
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button onClick={() => setCommentingStepId(step._id)} className="px-6 py-2 text-sm font-medium border border-red-300 text-red-700 rounded-xl hover:bg-red-50">
                      Flag Issue
                    </button>
                    <button onClick={() => handleUpdateStep(step._id, 'cleared')} disabled={approvalInitiated || isSignatureModalOpen} className="px-6 py-2 text-sm font-medium bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50">
                      Clear
                    </button>
                    <button onClick={() => {
                      setSigningStepId(step._id);
                      setIsSignatureModalOpen(true);
                    }} disabled={approvalInitiated || isSignatureModalOpen} className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50">
                      Sign & Clear
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSave={handleSaveSignature}
        title="Sign & Clear Step"
      />

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setPreviewFile(null)}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h5 className="text-lg font-bold text-gray-900">File Preview</h5>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                aria-label="Close preview"
              >
                <FaTimes className="text-gray-600" />
              </button>
            </div>
            <div className="flex-grow overflow-auto bg-gray-100">
              {previewFile.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={previewFile}
                  className="w-full h-full min-h-[600px]"
                  title="PDF Preview"
                  style={{ border: 'none' }}
                />
              ) : /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(previewFile.toLowerCase()) ? (
                <div className="flex items-center justify-center h-full p-4">
                  <img
                    src={previewFile}
                    alt="File Preview"
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxNHB4IiBmaWxsPSIjOTk5Ij5JbWFnZSBDb3VsZCBOb3QgQmUgTG9hZGVkPC90ZXh0Pjwvc3ZnPg==';
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-8">
                    <p className="text-gray-600 text-lg mb-4">Preview not available for this file type.</p>
                    <a
                      href={previewFile}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FaDownload className="mr-2" />
                      Download File
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewerDashboard;
