const ClearanceRequest = require('../models/ClearanceRequest');
const ClearanceStep = require('../models/ClearanceStep');
const User = require('../models/User');
const { asyncHandler } = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const jsPDF = require('jspdf');
const QRCode = require('qrcode');

// Generate certificate with workflow sequence and authorized person names
const generateCertificate = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const request = await ClearanceRequest.findById(id)
    .populate('initiatedBy', 'name email department')
    .populate('hrReviewer', 'name email')
    .populate('vpReviewer', 'name email')
    .lean();

  if (!request) {
    return next(new AppError('Clearance request not found', 404));
  }

  if (request.status !== 'cleared') {
    return next(new AppError('Certificate can only be generated for cleared requests', 400));
  }

  // Get all approved clearance steps in workflow order
  const clearanceSteps = await ClearanceStep.find({ requestId: id })
    .populate('approvedBy', 'name email')
    .sort({ order: 1 })
    .lean();

  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('WOLDIA UNIVERSITY', 105, 20, { align: 'center' });
  
  doc.setFontSize(16);
  doc.text('STAFF CLEARANCE CERTIFICATE', 105, 30, { align: 'center' });
  
  // Certificate details
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  const staffName = request.initiatedBy.name;
  const department = request.initiatedBy.department;
  const referenceCode = request.referenceCode;
  
  doc.text(`This is to certify that ${staffName} from ${department} department`, 20, 50);
  doc.text(`has successfully completed the staff clearance process.`, 20, 60);
  doc.text(`Reference Code: ${referenceCode}`, 20, 70);
  
  // Authorized person at top (Initial Approval)
  doc.text('Authorized Person:', 20, 90);
  doc.setFont('helvetica', 'bold');
  doc.text(request.authorizedPersonName || 'University Administration', 20, 100);
  
  // Workflow sequence table
  doc.setFont('helvetica', 'normal');
  doc.text('Clearance Workflow Sequence:', 20, 120);
  
  let yPos = 130;
  const stepHeight = 15;
  
  clearanceSteps.forEach((step, index) => {
    const stepNumber = index + 1;
    const departmentName = step.department;
    const approvedBy = step.approvedBy?.name || 'Pending';
    const approvalDate = step.approvedAt ? new Date(step.approvedAt).toLocaleDateString() : 'Pending';
    
    doc.text(`${stepNumber}. ${departmentName}`, 25, yPos);
    doc.text(`Approved by: ${approvedBy}`, 60, yPos);
    doc.text(`Date: ${approvalDate}`, 140, yPos);
    
    yPos += stepHeight;
  });
  
  // QR Code for verification
  const qrData = JSON.stringify({
    referenceCode,
    staffName,
    department,
    status: 'cleared',
    verificationUrl: `${process.env.FRONTEND_URL}/verify/${referenceCode}`
  });
  
  const qrCodeDataURL = await QRCode.toDataURL(qrData);
  
  // Add QR code to PDF
  doc.addImage(qrCodeDataURL, 'PNG', 150, 250, 30, 30);
  
  // Footer
  doc.setFontSize(10);
  doc.text('Generated on: ' + new Date().toLocaleDateString(), 20, 280);
  doc.text('This certificate is valid only with official university seal', 20, 290);
  
  // Save PDF
  const pdfBuffer = doc.output('arraybuffer');
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="clearance-certificate-${referenceCode}.pdf"`);
  res.send(Buffer.from(pdfBuffer));
});

// Get certificate data for frontend display
const getCertificateData = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const request = await ClearanceRequest.findById(id)
    .populate('initiatedBy', 'name email department')
    .lean();

  if (!request) {
    return next(new AppError('Clearance request not found', 404));
  }

  const clearanceSteps = await ClearanceStep.find({ requestId: id })
    .populate('approvedBy', 'name email')
    .sort({ order: 1 })
    .lean();

  const certificateData = {
    staffName: request.initiatedBy.name,
    department: request.initiatedBy.department,
    referenceCode: request.referenceCode,
    authorizedPerson: request.authorizedPersonName || 'University Administration',
    workflowSequence: clearanceSteps.map((step, index) => ({
      step: index + 1,
      department: step.department,
      approvedBy: step.approvedBy?.name,
      approvedAt: step.approvedAt,
      status: step.status
    })),
    generatedAt: new Date()
  };

  res.status(200).json({
    success: true,
    data: certificateData
  });
});

module.exports = {
  generateCertificate,
  getCertificateData
};
