import React, { useEffect, useState } from 'react';
import { clearanceService } from '../services/clearanceService';
import { toastUtils } from '../utils/toastUtils';
import type { ClearanceRequest } from '../types/clearance';

interface Props {
  requestId: string;
}

const MyClearanceDetails: React.FC<Props> = ({ requestId }) => {
  const [request, setRequest] = useState<ClearanceRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formState, setFormState] = useState<any>({});
  const [files, setFiles] = useState<FileList | null>(null);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await clearanceService.getClearanceRequestById(requestId);
      if (res.success) {
        setRequest(res.data);
        setFormState(res.data.formData || {});
      } else {
        toastUtils.error('Failed to load request details');
      }
    } catch {
      toastUtils.error('Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [requestId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const handleUpdate = async () => {
    if (!request) return;
    const data = new FormData();
    data.append('formData', JSON.stringify(formState));
    if (files) {
      Array.from(files).forEach((f) => data.append('clearanceFiles', f));
    }

    try {
      const res = await clearanceService.updateClearanceRequest(request._id, data);
      if (res.success) {
        toastUtils.success('Request updated');
        setEditing(false);
        fetchDetails();
      } else {
        toastUtils.error('Failed to update request');
      }
    } catch {
      toastUtils.error('Failed to update request');
    }
  };



  if (loading) return <div>Loading...</div>;

  if (!request) return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="text-gray-500">Request not found.</div>
    </div>
  );

  const isEditable = request.status !== 'cleared' && request.status !== 'archived';

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{request.referenceCode} • {request.purpose}</h2>
          <div className="text-sm text-gray-500">Status: {request.status} • Created: {new Date(request.createdAt).toLocaleString()}</div>
        </div>
        {isEditable && (
          <div className="space-x-2">
            <button onClick={() => setEditing(!editing)} className="px-3 py-1 bg-indigo-600 text-white rounded">{editing ? 'Cancel' : 'Edit'}</button>
            {editing && <button onClick={handleUpdate} className="px-3 py-1 bg-green-600 text-white rounded">Save</button>}
          </div>
        )}
      </div>

      {/* Form Data */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">First Name</label>
          {editing ? (
            <input value={formState.firstName || ''} onChange={(e) => setFormState({ ...formState, firstName: e.target.value })} className="mt-1 block w-full rounded-md border-gray-200" />
          ) : (
            <div className="mt-1 text-gray-700">{request.formData?.firstName}</div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Last Name</label>
          {editing ? (
            <input value={formState.lastName || ''} onChange={(e) => setFormState({ ...formState, lastName: e.target.value })} className="mt-1 block w-full rounded-md border-gray-200" />
          ) : (
            <div className="mt-1 text-gray-700">{request.formData?.lastName}</div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Phone</label>
          {editing ? (
            <input value={formState.phoneNumber || ''} onChange={(e) => setFormState({ ...formState, phoneNumber: e.target.value })} className="mt-1 block w-full rounded-md border-gray-200" />
          ) : (
            <div className="mt-1 text-gray-700">{request.formData?.phoneNumber}</div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Department</label>
          <div className="mt-1 text-gray-700">{request.formData?.department}</div>
        </div>
      </div>

      {/* File upload - owner can add supporting files while request is editable */}
      {editing && (
        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700">Upload Supporting Files</label>
          <input type="file" multiple onChange={handleFileChange} className="mt-2" />
        </div>
      )}

      {/* Existing uploaded files */}
      {request.uploadedFiles && request.uploadedFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-800">Uploaded Files</h4>
          <div className="mt-2 space-y-2">
            {request.uploadedFiles.map((f) => (
              <div key={f._id} className="flex items-center justify-between p-2 border rounded">
                <a href={`${import.meta.env.VITE_API_BASE_URL?.replace('/api','') || ''}${f.filePath}`} target="_blank" rel="noreferrer" className="text-blue-600 underline">{f.fileName}</a>
                {isEditable && (
                  <div className="flex items-center space-x-2">
                    <input id={`replace-input-${f._id}`} type="file" className="hidden" onChange={async (e) => {
                      const target = e.target as HTMLInputElement;
                      if (!target.files || target.files.length === 0) return;
                      const file = target.files[0];
                      const fd = new FormData();
                      fd.append('clearanceFile', file);
                      try {
                        const res = await clearanceService.replaceUploadedFile(request._id, f._id!, fd);
                        if (res.success) {
                          toastUtils.success('File replaced');
                          fetchDetails();
                        } else {
                          toastUtils.error('Failed to replace file');
                        }
                      } catch {
                        toastUtils.error('Failed to replace file');
                      }
                    }} />
                    <button onClick={() => document.getElementById(`replace-input-${f._id}`)!.click()} className="text-sm text-indigo-600">Replace</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clearance steps removed from owner view per UI update. */}
    </div>
  );
};

export default MyClearanceDetails;