import React, { useState, useEffect } from 'react';
import SignatureModal from './SignatureModal';
import { useAuth } from '../context/AuthContext';
import { clearanceService } from '../services/clearanceService';
import { toastUtils } from '../utils/toastUtils';
import type { ClearanceRequest } from '../types/clearance';
import { FaFilePdf, FaFileImage, FaDownload, FaEye, FaTimes } from 'react-icons/fa';

const API_BASE_URL = 'http://localhost:5000';

const getFileIcon = (fileName: string) => {
  if (fileName.endsWith('.pdf')) return <FaFilePdf className="text-red-500 text-3xl" />;
  if (/\.(jpg|jpeg|png|gif)$/i.test(fileName)) return <FaFileImage className="text-blue-500 text-3xl" />;
  return null;
};

const VPApprovalDashboard: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ClearanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [signingRequestId, setSigningRequestId] = useState<string | null>(null);
  const [approvalInitiated, setApprovalInitiated] = useState(false);

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

  const handleInitialApproval = async (id: string, signature?: string) => {
    setApprovalInitiated(true);
    try {
      const response = await clearanceService.approveInitialRequest(id, signature);
      if (response.success) {
        toastUtils.success('Request approved successfully.');
        setRequests(requests.filter(req => req._id !== id));
      } else {
        toastUtils.error(response.message || 'Failed to approve request.');
      }
    } catch (error) {
      toastUtils.error('An error occurred while approving the request.');
    } finally {
      setApprovalInitiated(false);
    }
  };

  const handleSaveSignature = async (signature: string) => {
    if (signingRequestId) {
      setApprovalInitiated(true);
      // Here you would typically send the signature to the backend
      // For now, we'll just log it and then approve the request
      console.log('Signature for request', signingRequestId, signature);
      await handleInitialApproval(signingRequestId, signature);
      setIsSignatureModalOpen(false);
      setSigningRequestId(null);
      setApprovalInitiated(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-10">Loading VP requests...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
        <h1 className="text-3xl font-bold text-gray-900">VP Approval Dashboard</h1>
        <p className="text-gray-600 mt-2">Review and approve clearance requests.</p>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-gray-800">No Pending VP Reviews!</h3>
          <p className="text-gray-500 mt-2">All clearance requests have been reviewed by the VP.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {requests.map((request) => (
            <div key={request._id} className="bg-white rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden">
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

              {/* Actions */}
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end space-x-4">
                <button
                  onClick={() => handleInitialApproval(request._id)}
                  disabled={approvalInitiated || isSignatureModalOpen}
                  className="px-6 py-2 text-sm font-medium bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 flex items-center disabled:opacity-50"
                >
                  Approve Initial Request
                </button>
                <button onClick={() => {
                    setSigningRequestId(request._id);
                    setIsSignatureModalOpen(true);
                  }}
                  disabled={approvalInitiated || isSignatureModalOpen}
                  className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50">
                    Sign & Approve
                  </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSave={handleSaveSignature}
        title="Sign Clearance Request"
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
