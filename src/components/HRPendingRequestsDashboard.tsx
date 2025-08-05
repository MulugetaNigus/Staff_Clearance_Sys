import React, { useState, useEffect } from 'react';
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

const HRPendingRequestsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ClearanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<string | null>(null);

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

                            if (userRole === 'HROfficer' || userRole === 'HRDevelopmentReviewer') {
                              return file.visibility === 'hr' || file.visibility === 'all';
                            }
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
              {rejectingRequestId === request._id ? (
                <div className="p-7 bg-gray-50 border-t border-gray-100">
                  <textarea
                    placeholder="Provide a clear reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800 text-sm"
                    rows={4}
                  />
                  <div className="flex justify-end space-x-4 mt-4">
                    <button onClick={() => setRejectingRequestId(null)} className="px-6 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-100">
                      Cancel
                    </button>
                    <button onClick={() => handleHRReview(request._id, 'reject')} disabled={!rejectionReason.trim()} className="px-6 py-2 text-sm font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50">
                      Confirm Reject
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end space-x-4">
                  <button onClick={() => setRejectingRequestId(request._id)} className="px-6 py-2 text-sm font-medium border border-red-300 text-red-700 rounded-xl hover:bg-red-50">
                    Reject
                  </button>
                  <button onClick={() => handleHRReview(request._id, 'approve')} className="px-6 py-2 text-sm font-medium bg-green-600 text-white rounded-xl hover:bg-green-700">
                    Approve & Forward
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

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

export default HRPendingRequestsDashboard;
