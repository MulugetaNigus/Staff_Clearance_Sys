import React, { useEffect, useState } from 'react';
import { clearanceService } from '../services/clearanceService';
import { toastUtils } from '../utils/toastUtils';
import type { ClearanceRequest } from '../types/clearance';

interface Props {
  onOpen: (id: string) => void;
}

const MyClearances: React.FC<Props> = ({ onOpen }) => {
  const [requests, setRequests] = useState<ClearanceRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await clearanceService.getClearanceRequests();
      if (res.success) setRequests(res.data || []);
      else toastUtils.error('Failed to load clearance requests');
    } catch (_) {
      toastUtils.error('Failed to load clearance requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-2xl font-bold mb-4">My Clearance Forms</h2>

      {loading ? (
        <div>Loading...</div>
      ) : requests.length === 0 ? (
        <div className="text-gray-500">You have no clearance requests yet.</div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req._id} className="p-4 border rounded-lg flex justify-between items-center">
              <div>
                <div className="font-semibold">{req.referenceCode} — {req.purpose}</div>
                <div className="text-sm text-gray-500">Status: {req.status} • Created: {new Date(req.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpen(req._id)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyClearances;
