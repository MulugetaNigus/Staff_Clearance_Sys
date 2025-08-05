import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaFilePdf, FaFileImage, FaFileAlt, FaTimes } from 'react-icons/fa';

interface ClearanceFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  isLoading: boolean;
}

const getFileIcon = (fileName: string) => {
  if (fileName.endsWith('.pdf')) return <FaFilePdf className="text-red-500" />;
  if (/\.(jpg|jpeg|png|gif)$/i.test(fileName)) return <FaFileImage className="text-blue-500" />;
  return <FaFileAlt className="text-gray-500" />;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const ClearanceForm: React.FC<ClearanceFormProps> = ({ onSubmit, isLoading }) => {
  const { user } = useAuth();
  const [purpose, setPurpose] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [department, setDepartment] = useState('');
  const [supportingDocuments, setSupportingDocuments] = useState<File[]>([]);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSupportingDocuments(prevFiles => [...prevFiles, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSupportingDocuments(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

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

    if (supportingDocuments.length > 0) {
      supportingDocuments.forEach(file => {
        formData.append('clearanceFiles', file);
      });
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
          <label htmlFor="supportingDocuments" className="block text-sm font-medium text-gray-700 mb-2">Supporting Documents</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label htmlFor="supportingDocuments" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                  <span>Upload files</span>
                  <input id="supportingDocuments" name="clearanceFiles" type="file" multiple className="sr-only" onChange={handleFileChange} />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">Images & PDF up to 5MB each</p>
            </div>
          </div>
        </div>

        {supportingDocuments.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900">Uploaded Files</h3>
            <ul className="mt-4 space-y-3">
              {supportingDocuments.map((file, index) => (
                <li key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getFileIcon(file.name)}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="p-1.5 text-gray-500 rounded-full hover:bg-red-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <FaTimes className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

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
""
