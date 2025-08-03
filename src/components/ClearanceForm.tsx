import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { clearanceService } from '../services/clearanceService';
import { toastUtils } from '../utils/toastUtils';

interface ClearanceFormProps {
  onSubmit: (data: { purpose: string; supportingDocumentUrl?: string; formData: any }) => Promise<void>;
  isLoading: boolean;
}

const ClearanceForm: React.FC<ClearanceFormProps> = ({ onSubmit, isLoading }) => {
  const { user } = useAuth();
  const [purpose, setPurpose] = useState('');
  const [supportingDocument, setSupportingDocument] = useState<File | null>(null);
  const [formData, setFormData] = useState<string>('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose) {
      setError('Purpose of clearance is required.');
      return;
    }

    let supportingDocumentUrl = '';
    if (supportingDocument) {
      // In a real application, you would upload the file to a service
      // and get back a URL. For this example, we'll just use a placeholder.
      supportingDocumentUrl = `uploads/${supportingDocument.name}`;
    }

    await onSubmit({ purpose, supportingDocumentUrl, formData });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8 sm:p-12 border-t-4 border-blue-600">
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-bold text-gray-900">Initiate Clearance</h2>
        <p className="text-gray-600 mt-3 text-lg">Complete the form to start your clearance process.</p>
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
          </select>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        <div>
          <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-2">Supporting Document (Optional)</label>
          <input
            id="document"
            name="document"
            type="file"
            onChange={(e) => setSupportingDocument(e.target.files ? e.target.files[0] : null)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="formData" className="block text-sm font-medium text-gray-700 mb-2">Additional Details (Form Data) *</label>
          <textarea
            id="formData"
            name="formData"
            value={formData}
            onChange={(e) => setFormData(e.target.value)}
            required
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter any additional details or form data here..."
          ></textarea>
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
