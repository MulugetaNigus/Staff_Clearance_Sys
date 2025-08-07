import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { clearanceService } from '../services/clearanceService';

const VerificationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyRequest = async () => {
      if (!id) return;
      try {
        const response = await clearanceService.verifyClearanceRequest(id);
        setRequest(response.data);
      } catch (err) {
        setError('Failed to verify clearance request. The ID may be invalid or the request does not exist.');
      } finally {
        setIsLoading(false);
      }
    };

    verifyRequest();
  }, [id]);

  if (isLoading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto my-10 p-8 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Clearance Verification</h2>
      {request && (
        <div>
          <div className="mb-4">
            <strong>Reference Code:</strong> {request.referenceCode}
          </div>
          <div className="mb-4">
            <strong>Status:</strong> {request.status}
          </div>
          <div className="mb-4">
            <strong>Initiated By:</strong> {request.initiatedBy.name}
          </div>
          <div className="mb-4">
            <strong>Department:</strong> {request.initiatedBy.department}
          </div>
          <div className="mb-4">
            <strong>Purpose:</strong> {request.purpose}
          </div>
          <div className="mb-4">
            <strong>Created At:</strong> {new Date(request.createdAt).toLocaleString()}
          </div>
          <div className="mb-4">
            <strong>Last Updated:</strong> {new Date(request.updatedAt).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationPage;
