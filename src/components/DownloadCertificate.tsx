import React, { useState } from 'react';
import { clearanceService } from '../services/clearanceService';
import { toastUtils } from '../utils/toastUtils';
import { Download, FileText, AlertCircle } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';

const DownloadCertificate: React.FC = () => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [requests, setRequests] = useState<any[]>([]);
    const [requestSteps, setRequestSteps] = useState<{ [key: string]: any[] }>({});
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await clearanceService.getClearanceRequests();
                if (response.success) {
                    setRequests(response.data);

                    // Fetch steps for each request to check actual completion
                    const stepsMap: { [key: string]: any[] } = {};
                    for (const request of response.data) {
                        try {
                            const stepsResponse = await clearanceService.getClearanceRequestById(request._id);
                            if (stepsResponse.success) {
                                stepsMap[request._id] = stepsResponse.data.steps || [];
                            }
                        } catch (err) {
                            console.warn(`Failed to fetch steps for ${request._id}`);
                            stepsMap[request._id] = [];
                        }
                    }
                    setRequestSteps(stepsMap);
                }
            } catch (error) {
                console.error('Failed to fetch requests:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRequests();
    }, []);

    // Check if ALL steps are cleared (matches backend validation)
    const isRequestFullyCleared = (requestId: string): boolean => {
        const steps = requestSteps[requestId] || [];
        if (steps.length === 0) return false;

        const clearedSteps = steps.filter((s: any) => s.status === 'cleared');
        return clearedSteps.length === steps.length;
    };

    const handleDownloadCertificate = async (requestId: string) => {
        setIsDownloading(true);
        const loadingToast = toastUtils.loading('Generating certificate PDF...');

        try {
            const response = await fetch(
                `http://localhost:5000/api/certificate/${requestId}/generate`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/pdf',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to generate certificate');
            }

            // Get the PDF blob
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // Create a temporary link and trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = `clearance-certificate-${Date.now()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up
            window.URL.revokeObjectURL(url);

            toastUtils.dismiss(loadingToast);
            toastUtils.success('Certificate downloaded successfully!');
        } catch (error: any) {
            toastUtils.dismiss(loadingToast);
            toastUtils.error(error.message || 'Failed to download certificate');
        } finally {
            setIsDownloading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-500 rounded-lg">
                        <FileText className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 font-['Plus_Jakarta_Sans_Variable']">
                        Download Certificate
                    </h1>
                </div>
                <p className="text-gray-600 mt-2">
                    Download your official clearance certificate. Available for cleared requests only.
                </p>
            </div>

            {/* Certificate Preview Info */}
            <Card className="p-6 bg-blue-50 border-blue-200">
                <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-blue-900 mb-1">New Certificate Design!</h3>
                        <p className="text-sm text-blue-800">
                            We've enhanced the certificate with security features including:
                        </p>
                        <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                            <li>Diagonal "OFFICIAL" watermark</li>
                            <li>SHA-256 security hash</li>
                            <li>QR code for verification</li>
                            <li>Verification warning banner</li>
                        </ul>
                    </div>
                </div>
            </Card>

            {/* Clearance Requests List */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">Your Clearance Requests</h2>

                {requests.length === 0 ? (
                    <Card className="p-12 text-center">
                        <div className="flex flex-col items-center">
                            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <FileText className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No Clearance Requests
                            </h3>
                            <p className="text-gray-600">
                                You haven't submitted any clearance requests yet.
                            </p>
                        </div>
                    </Card>
                ) : (
                    requests.map((request) => (
                        <Card key={request._id} className="p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {request.referenceCode}
                                        </h3>
                                        <span
                                            className={`px-3 py-1 text-xs font-semibold rounded-full ${request.status === 'cleared'
                                                ? 'bg-green-100 text-green-800'
                                                : request.status === 'in_progress'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : request.status === 'initiated'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {request.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
                                        <p>
                                            <span className="font-medium">Purpose:</span> {request.purpose}
                                        </p>
                                        <p>
                                            <span className="font-medium">Submitted:</span>{' '}
                                            {new Date(request.createdAt).toLocaleDateString()}
                                        </p>
                                        {request.completedAt && (
                                            <p>
                                                <span className="font-medium">Completed:</span>{' '}
                                                {new Date(request.completedAt).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="ml-6">
                                    {/* Check if ALL steps are cleared, not just request status */}
                                    {isRequestFullyCleared(request._id) ? (
                                        <Button
                                            onClick={() => handleDownloadCertificate(request._id)}
                                            isLoading={isDownloading}
                                            icon={Download}
                                            variant="primary"
                                        >
                                            Download PDF
                                        </Button>
                                    ) : (
                                        <div className="text-center">
                                            <div className="px-4 py-2 bg-gray-100 rounded-xl text-gray-600 text-sm">
                                                <AlertCircle className="h-4 w-4 inline mr-1" />
                                                Not All Steps Cleared
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {requestSteps[request._id]?.length > 0
                                                    ? `${requestSteps[request._id].filter((s: any) => s.status === 'cleared').length}/${requestSteps[request._id].length} steps completed`
                                                    : 'Loading steps...'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Sample Preview Section (For Testing) */}
            <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-500 rounded-lg">
                        <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Preview Certificate Design (Testing)
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Click the button below to download a sample certificate with the new design.
                            This button will work for any request with all steps cleared.
                        </p>

                        {requests.find((r) => isRequestFullyCleared(r._id)) ? (
                            <Button
                                onClick={() =>
                                    handleDownloadCertificate(
                                        requests.find((r) => isRequestFullyCleared(r._id))?._id
                                    )
                                }
                                isLoading={isDownloading}
                                icon={Download}
                                variant="secondary"
                            >
                                Download Sample PDF
                            </Button>
                        ) : (
                            <div className="text-sm text-gray-600 italic">
                                {requests.length > 0
                                    ? 'No requests with all steps cleared yet'
                                    : 'No cleared requests available for sample download'}
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default DownloadCertificate;
