import React, { useState, useEffect } from 'react';
import { clearanceService } from '../services/clearanceService';
import { toastUtils } from '../utils/toastUtils';
import { Download, Search, FileCheck, User } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import API from '../services/api';

interface ClearedRequest {
    _id: string;
    referenceCode: string;
    initiatedBy: {
        _id: string;
        name: string;
        email: string;
        department: string;
        staffId: string;
    };
    completedAt: string;
    status: string;
}

const AdminCertificateManager: React.FC = () => {
    const [requests, setRequests] = useState<ClearedRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const response = await clearanceService.getClearedAcademicStaffRequests();
            if (response.success) {
                setRequests(response.data);
            }
        } catch (error) {
            toastUtils.error('Failed to fetch cleared requests');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadCertificate = async (requestId: string, staffName: string) => {
        setDownloadingId(requestId);
        const loadingToast = toastUtils.loading('Generating certificate...');
        try {
            const response = await API.get(`/certificate/${requestId}/generate`, {
                responseType: 'blob',
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Clearance_Certificate_${staffName.replace(/\s+/g, '_')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toastUtils.dismiss(loadingToast);
            toastUtils.success('Certificate downloaded successfully');
        } catch (error) {
            toastUtils.dismiss(loadingToast);
            toastUtils.error('Failed to download certificate');
        } finally {
            setDownloadingId(null);
        }
    };

    const filteredRequests = requests.filter(req =>
        req.initiatedBy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.initiatedBy.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.referenceCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="h-12 bg-gray-100 rounded-xl animate-pulse w-1/3"></div>
                <div className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 font-['Plus_Jakarta_Sans_Variable']">Academic Staff Certificates</h2>
                    <p className="text-gray-500 text-sm mt-1">Download final clearance certificates for cleared academic staff</p>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search staff..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                </div>
            </div>

            <Card className="overflow-hidden border border-gray-100 shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Staff Member</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reference</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Completed Date</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredRequests.length > 0 ? (
                                filteredRequests.map((req) => (
                                    <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{req.initiatedBy.name}</div>
                                                    <div className="text-xs text-gray-500">{req.initiatedBy.staffId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {req.initiatedBy.department}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                            {req.referenceCode}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(req.completedAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <Button
                                                size="sm"
                                                variant="primary"
                                                icon={Download}
                                                isLoading={downloadingId === req._id}
                                                onClick={() => handleDownloadCertificate(req._id, req.initiatedBy.name)}
                                            >
                                                Download
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <FileCheck className="h-12 w-12 text-gray-300 mb-3" />
                                            <p>No cleared academic staff requests found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AdminCertificateManager;
