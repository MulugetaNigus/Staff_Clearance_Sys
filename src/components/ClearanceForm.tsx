import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { clearanceService } from '../services/clearanceService';
import { toastUtils } from '../utils/toastUtils';

interface ClearanceFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  isLoading: boolean;
}

const ClearanceForm: React.FC<ClearanceFormProps> = ({ onSubmit, isLoading }) => {
  const { user } = useAuth();
  const [purpose, setPurpose] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [department, setDepartment] = useState('');
  const [supportingDocuments, setSupportingDocuments] = useState<FileList | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose || !teacherId || !department) {
      setError('Please fill in all required fields.');
      return;
    }

    setError('');

    const formData = new FormData();
    formData.append('formData', JSON.stringify({
      purpose,
      teacherId,
      department,
    }));

    if (supportingDocuments) {
      for (let i = 0; i < supportingDocuments.length; i++) {
        formData.append('clearanceFiles', supportingDocuments[i]);
      }
    }

    await onSubmit(formData);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl p-8 sm:p-12 border-t-4 border-blue-600">
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-bold text-gray-900">Initiate Teacher Clearance</h2>
        <p className="text-gray-600 mt-3 text-lg">Complete the form to start your clearance process as a teacher.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">Purpose of Clearance *</label>
          <select
            id="purpose"
            name="purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a purpose</option>
            <option value="Resignation">Resignation</option>
            <option value="Retirement">Retirement</option>
            <option value="Transfer">Transfer</option>
            <option value="Leave">Leave</option>
            <option value="End of Contract">End of Contract</option>
            <option value="Study Leave">Study Leave</option>
          </select>
          {error && !purpose && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        <div>
          <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700 mb-2">Teacher ID *</label>
          <input
            type="text"
            id="teacherId"
            name="teacherId"
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your teacher ID"
          />
          {error && !teacherId && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
          <input
            type="text"
            id="department"
            name="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Computer Science, Physics"
          />
          {error && !department && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        <div>
          <label htmlFor="supportingDocuments" className="block text-sm font-medium text-gray-700 mb-2">Supporting Documents (Multiple files allowed)</label>
          <input
            id="supportingDocuments"
            name="clearanceFiles"
            type="file"
            multiple
            onChange={(e) => setSupportingDocuments(e.target.files)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-sm text-gray-500 mt-2">Max 10 files, up to 5MB each. Allowed types: images (JPG, PNG, GIF) and PDF.</p>
        </div>

        <div className="flex justify-end pt-6 border-t mt-10">
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all duration-300 flex items-center space-x-2 shadow-lg"
          >
            {isLoading ? 'Submitting...' : 'Submit for Approval'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClearanceForm;
