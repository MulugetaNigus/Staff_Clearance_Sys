import React, { useState, useEffect } from 'react';
import SignatureModal from './SignatureModal';
import { useAuth } from '../context/AuthContext';
import { clearanceService } from '../services/clearanceService';
import { toastUtils } from '../utils/toastUtils';
import type { ClearanceRequest } from '../types/clearance';
import { FaFilePdf, FaFileImage, FaDownload, FaEye, FaTimes } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'https://staffclearancesys.onrender.com';

const getFileIcon = (fileName: string) => {
  if (fileName.endsWith('.pdf')) return <FaFilePdf className="text-red-500 text-3xl" />;
  if (/\.(jpg|jpeg|png|gif)$/i.test(fileName)) return <FaFileImage className="text-blue-500 text-3xl" />;
  return null;
};

const VPApprovalDashboard: React.FC = () => {
  const { user } = useAuth();
  const [initialApprovalRequests, setInitialApprovalRequests] = useState<ClearanceRequest[]>([]);
  const [finalApprovalRequests, setFinalApprovalRequests] = useState<ClearanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [signingRequestId, setSigningRequestId] = useState<string | null>(null);
  const [signingType, setSigningType] = useState<'initial' | 'final'>('initial');
  const [approvalInitiated, setApprovalInitiated] = useState(false);
  const [activeTab, setActiveTab] = useState<'initial' | 'final'>('initial');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await clearanceService.getRequestsForVP();
        if (response.success) {
          // Separate requests by VP approval type
          const initial = response.data.filter((req: ClearanceRequest) =>
            req.status === 'initiated'
          );
          const final = response.data.filter((req: ClearanceRequest) => {
            // Requests ready for final VP approval (all departments completed except final VP step)
            return req.status === 'in_progress' && req.vpInitialSignature && !req.vpFinalSignature;
          });

          setInitialApprovalRequests(initial);
          setFinalApprovalRequests(final);
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

  const handleInitialApproval = async (id: string, signature?: string) => {
    setApprovalInitiated(true);
    try {
      const response = await clearanceService.approveInitialRequest(id, signature);
      if (response.success) {
        toastUtils.success('Initial validation completed successfully. Clearance process can now begin.');
        setInitialApprovalRequests(initialApprovalRequests.filter(req => req._id !== id));
      } else {
        toastUtils.error(response.message || 'Failed to approve request.');
      }
    } catch (error) {
      toastUtils.error('An error occurred while approving the request.');
    } finally {
      setApprovalInitiated(false);
    }
  };

  const handleFinalApproval = async (id: string, signature?: string) => {
    setApprovalInitiated(true);
    try {
      const response = await clearanceService.approveFinalRequest(id, signature);
      if (response.success) {
        toastUtils.success('Final VP oversight completed. Request is now ready for archiving.');
        setFinalApprovalRequests(finalApprovalRequests.filter(req => req._id !== id));
      } else {
        toastUtils.error(response.message || 'Failed to complete final approval.');
      }
    } catch (error) {
      toastUtils.error('An error occurred while processing final approval.');
    } finally {
      setApprovalInitiated(false);
    }
  };

  const handleSaveSignature = async (signature: string) => {
    if (signingRequestId && signingType) {
      setApprovalInitiated(true);
      console.log(`${signingType} signature for request`, signingRequestId, signature);

      if (signingType === 'initial') {
        await handleInitialApproval(signingRequestId, signature);
      } else {
        await handleFinalApproval(signingRequestId, signature);
      }

      setIsSignatureModalOpen(false);
      setSigningRequestId(null);
      setSigningType('initial');
      setApprovalInitiated(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-10">Loading VP requests...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
        <h1 className="text-3xl font-bold text-gray-900">Enhanced VP Approval Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage both initial validation and final oversight approvals.</p>

        {/* Tab Navigation */}
        <div className="mt-6 flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('initial')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'initial'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            Initial Validation ({initialApprovalRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('final')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'final'
                ? 'bg-purple-500 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            Final Oversight ({finalApprovalRequests.length})
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'initial' ? (
        initialApprovalRequests.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-gray-800">No Pending Initial Validations!</h3>
            <p className="text-gray-500 mt-2">All new clearance requests have been validated.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Stage 1: Initial Validation</h3>
              <p className="text-sm text-blue-700">
                Your first signature validates that this is a legitimate clearance request and authorizes it to move forward.
                This acts as a "green light" for the clearance process to officially start.
              </p>
            </div>
            {initialApprovalRequests.map((request) => (
              <div key={request._id} className="bg-white rounded-3xl shadow-xl border border-blue-200 hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden">
                <div className="p-7 flex-grow">
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Request Info */}
                    <div className="md:col-span-2">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-1">{request.initiatedBy.name}</h3>
                          <p className="text-sm text-gray-500">ID: {request.referenceCode}</p>
                        </div>
                        <span className={`px-4 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800`}>
                          {request.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                        <p><strong>Purpose:</strong> {request.purpose}</p>
                        <p><strong>Department:</strong> {request.formData.department}</p>
                        <p><strong>Teacher ID:</strong> {request.formData.teacherId}</p>
                        <p><strong>Submitted:</strong> {new Date(request.createdAt).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Uploaded Files */}
                    <div className="md:col-span-1">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Uploaded Files</h4>
                      {request.uploadedFiles.length > 0 ? (
                        <ul className="space-y-3">
                          {request.uploadedFiles
                            .filter(file => {
                              const userRole = user?.role;
                              if (!userRole) return false;

                              if (userRole === 'AcademicVicePresident') {
                                return file.visibility === 'vp' || file.visibility === 'all';
                              }
                              // For other roles, only show files marked as 'all'
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

                {/* Actions for Initial Approval */}
                <div className="p-6 bg-blue-50 border-t border-blue-100 flex justify-end space-x-4">
                  <button onClick={() => {
                    setSigningRequestId(request._id);
                    setSigningType('initial');
                    setIsSignatureModalOpen(true);
                  }}
                    disabled={approvalInitiated || isSignatureModalOpen}
                    className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2">
                    <span>✓</span>
                    <span>Validate & Authorize</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )) : (
        finalApprovalRequests.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏁</div>
            <h3 className="text-2xl font-bold text-gray-800">No Pending Final Oversight!</h3>
            <p className="text-gray-500 mt-2">All cleared requests have received final VP oversight.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h3 className="font-semibold text-purple-800 mb-2">Stage 5: Final Oversight</h3>
              <p className="text-sm text-purple-700">
                Your second signature occurs after all other departments have signed, confirming that the staff
                member has been fully cleared through all required stages.
              </p>
            </div>
            {finalApprovalRequests.map((request) => (
              <div key={request._id} className="bg-white rounded-3xl shadow-xl border border-purple-200 hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden">
                <div className="p-7 flex-grow">
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Request Info */}
                    <div className="md:col-span-2">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-1">{request.initiatedBy.name}</h3>
                          <p className="text-sm text-gray-500">ID: {request.referenceCode}</p>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <span className="px-4 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            READY FOR FINAL OVERSIGHT
                          </span>
                          <span className="px-4 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Initially Validated ✓
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                        <p><strong>Purpose:</strong> {request.purpose}</p>
                        <p><strong>Department:</strong> {request.formData.department}</p>
                        <p><strong>Teacher ID:</strong> {request.formData.teacherId}</p>
                        <p><strong>Initially Approved:</strong> {request.vpInitialSignedAt ? new Date(request.vpInitialSignedAt).toLocaleString() : 'N/A'}</p>
                      </div>
                    </div>

                    {/* Clearance Progress Summary */}
                    <div className="md:col-span-1">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Clearance Status</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-700">All departments cleared</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-blue-700">Initial VP validation ✓</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span className="text-sm text-purple-700">Awaiting final oversight</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions for Final Approval */}
                <div className="p-6 bg-purple-50 border-t border-purple-100 flex justify-end space-x-4">
                  <button onClick={() => {
                    setSigningRequestId(request._id);
                    setSigningType('final');
                    setIsSignatureModalOpen(true);
                  }}
                    disabled={approvalInitiated || isSignatureModalOpen}
                    className="px-6 py-2 text-sm font-medium bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2">
                    <span>🏁</span>
                    <span>Provide Final Oversight</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSave={handleSaveSignature}
        title={signingType === 'initial' ? "Initial VP Validation Signature" : "Final VP Oversight Signature"}
      />

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h5 className="text-lg font-bold">File Preview</h5>
              <button onClick={() => setPreviewFile(null)} className="p-2 rounded-full hover:bg-gray-200">
                <FaTimes />
              </button>
            </div>
            <div className="flex-grow p-4 overflow-auto">
              {previewFile.endsWith('.pdf') ? (
                <iframe src={previewFile} className="w-full h-full" title="File Preview"></iframe>
              ) : (
                <img src={previewFile} alt="Preview" className="max-w-full max-h-full mx-auto" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VPApprovalDashboard;
