import React, { useState, useEffect } from 'react';
import { clearanceService } from '../services/clearanceService';
import { toastUtils } from '../utils/toastUtils';
import { generateClearanceCertificate } from '../utils/pdfGenerator';
import emailjs from 'emailjs-com';

const VPApprovalDashboard: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await clearanceService.getRequestsForVP();
        if (response.success) {
          setRequests(response.data);
        }
      } catch (error) {
        toastUtils.error('Failed to fetch requests for approval.');
      }
      setIsLoading(false);
    };
    fetchRequests();
  }, []);

  const handleInitialApproval = async (id: string) => {
    try {
      const response = await clearanceService.approveInitialRequest(id);
      if (response.success) {
        toastUtils.success('Request approved successfully.');
        setRequests(requests.filter(req => req._id !== id));
      }
    } catch (error) {
      toastUtils.error('Failed to approve request.');
    }
  };

  const handleFinalApproval = async (id: string) => {
    try {
      const response = await clearanceService.approveFinalRequest(id);
      if (response.success) {
        toastUtils.success('Final approval successful.');
        setRequests(requests.filter(req => req._id !== id));

        // Generate PDF
        const pdf = generateClearanceCertificate(response.data);
        const pdfData = pdf.output('blob');

        // Send email
        const emailParams = {
          to_name: response.data.initiatedBy.name,
          to_email: response.data.initiatedBy.email,
          from_name: 'Woldia University',
          message: 'Please find your clearance certificate attached.',
        };

        // You would need to configure your EmailJS account and replace these with your actual IDs
        emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', emailParams, 'YOUR_USER_ID')
          .then((result) => {
              console.log(result.text);
              toastUtils.success('Certificate emailed successfully.');
          }, (error) => {
              console.log(error.text);
              toastUtils.error('Failed to email certificate.');
          });

        // Offer PDF download
        pdf.save(`clearance-certificate-${response.data.referenceCode}.pdf`);
      }
    } catch (error) {
      toastUtils.error('Failed to grant final approval.');
    }
  };

  if (isLoading) {
    return <div>Loading requests...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">VP Approval Dashboard</h1>
      <div>
        <h2 className="text-xl font-bold mb-2">Initial Approvals</h2>
        {requests.filter(req => req.status === 'pending_approval').map(req => (
          <div key={req._id} className="border p-4 mb-4">
            <p>Reference: {req.referenceCode}</p>
            <p>Initiated by: {req.initiatedBy.name}</p>
            <button onClick={() => handleInitialApproval(req._id)} className="bg-green-500 text-white px-4 py-2 rounded">Approve</button>
          </div>
        ))}
      </div>
      <div>
        <h2 className="text-xl font-bold mb-2">Final Approvals</h2>
        {requests.filter(req => req.status === 'in_progress').map(req => (
          <div key={req._id} className="border p-4 mb-4">
            <p>Reference: {req.referenceCode}</p>
            <p>Initiated by: {req.initiatedBy.name}</p>
            <button onClick={() => handleFinalApproval(req._id)} className="bg-green-500 text-white px-4 py-2 rounded">Final Approve</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VPApprovalDashboard;
