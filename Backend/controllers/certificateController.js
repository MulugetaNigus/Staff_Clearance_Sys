const ClearanceRequest = require('../models/ClearanceRequest');
const ClearanceStep = require('../models/ClearanceStep');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { asyncHandler } = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const jsPDF = require('jspdf');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

// Generate certificate with workflow sequence and authorized person names
const generateCertificate = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Enhanced validation
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return next(new AppError('Invalid request ID format', 400));
    }

    const request = await ClearanceRequest.findById(id)
      .populate('initiatedBy', 'name email department staffId')
      .populate('hrReviewer', 'name email')
      .populate('vpReviewer', 'name email')
      .lean();

    if (!request) {
      return next(new AppError('Clearance request not found', 404));
    }

    // Production-ready validation
    if (request.status !== 'cleared') {
      return next(new AppError('Certificate can only be generated for cleared requests', 400));
    }

    // Validate required fields
    if (!request.initiatedBy || !request.referenceCode) {
      return next(new AppError('Invalid request data: missing required fields', 400));
    }

    // Authorization check - only certain roles can generate certificates
    const authorizedRoles = ['SystemAdmin', 'RecordsArchivesReviewer', 'AcademicVicePresident'];
    if (!authorizedRoles.includes(userRole) && request.initiatedBy._id.toString() !== userId.toString()) {
      return next(new AppError('You do not have permission to generate this certificate', 403));
    }

    // Get all clearance steps with signatures
    const clearanceSteps = await ClearanceStep.find({ requestId: id })
      .populate('approvedBy', 'name email')
      .sort({ order: 1 })
      .lean();

    // Build signatures object for consistent access
    const signatures = {};
    clearanceSteps.forEach(step => {
      if (step.signature) {
        const key = step.department.toLowerCase().replace(/[^a-z0-9]/g, '');
        signatures[key] = step.signature;
      }
    });

    // Add VP signatures from request if they exist
    if (request.vpInitialSignature) {
      signatures['vpinitialsignature'] = request.vpInitialSignature;
    }
    if (request.vpFinalSignature) {
      signatures['vpfinalsignature'] = request.vpFinalSignature;
    }

    // Validate all steps are completed
    const incompleteSteps = clearanceSteps.filter(step => step.status !== 'cleared');
    if (incompleteSteps.length > 0) {
      return next(new AppError('Cannot generate certificate: not all clearance steps are completed', 400));
    }

    // Generate PDF with enhanced error handling
    let doc, pdfBuffer;
    try {
      doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let yPos = margin;
      
      // Certificate Border
      doc.setDrawColor(150, 150, 150);
      doc.setLineWidth(0.5);
      doc.rect(margin / 2, margin / 2, pageWidth - margin, pageHeight - margin);
      
      // University Logo - Load dynamically
      try {
        const logoPath = path.join(__dirname, '../../public/assets/woldia-logo.png');
        if (fs.existsSync(logoPath)) {
          const logoBase64 = fs.readFileSync(logoPath, { encoding: 'base64' });
          doc.addImage(`data:image/png;base64,${logoBase64}`, 'PNG', margin, yPos, 30, 30);
        } else {
          // Fallback placeholder
          doc.setDrawColor(150, 150, 150);
          doc.setFillColor(240, 240, 240);
          doc.rect(margin, yPos, 30, 30, 'FD');
          doc.setFontSize(8);
          doc.text('LOGO', margin + 15, yPos + 18, { align: 'center' });
        }
      } catch (logoError) {
        console.warn('Error loading logo:', logoError.message);
        // Draw placeholder on error
        doc.setDrawColor(150, 150, 150);
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, yPos, 30, 30, 'FD');
        doc.setFontSize(8);
        doc.text('LOGO', margin + 15, yPos + 18, { align: 'center' });
      }
      yPos += 35;
      
      // Header
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Staff Clearance Certificate', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('Woldia University – Academic Staff Clearance', pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;
      
      // Staff information box
      const staffName = request.initiatedBy.name;
      const department = request.initiatedBy.department || 'N/A';
      const staffId = request.initiatedBy.staffId || 'N/A';
      const referenceCode = request.referenceCode;
      
      doc.setDrawColor(0);
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPos, pageWidth - 2 * margin, 40, 'F');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Staff Information:', margin + 5, yPos + 7);
      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${staffName}`, margin + 5, yPos + 17);
      doc.text(`Department: ${department}`, margin + 5, yPos + 24);
      doc.text(`Staff ID: ${staffId}`, margin + 5, yPos + 31);
      doc.text(`Reference Code: ${referenceCode}`, pageWidth / 2 + 10, yPos + 17);
      doc.text(`Generated On: ${new Date().toLocaleDateString()}`, pageWidth / 2 + 10, yPos + 24);
      yPos += 50;
      
      // Workflow sequence table with enhanced formatting
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Clearance Workflow Sequence:', margin, yPos);
      yPos += 10;
      
      // Table headers
      const colWidths = [15, 70, 35, 50];
      const colPositions = [margin, margin + colWidths[0], margin + colWidths[0] + colWidths[1], margin + colWidths[0] + colWidths[1] + colWidths[2]];
      const rowHeight = 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(220, 220, 220);
      doc.rect(margin, yPos, pageWidth - 2 * margin, rowHeight, 'F');
      doc.text('#', colPositions[0] + 2, yPos + rowHeight / 2 + 1, { align: 'left' });
      doc.text('Department', colPositions[1] + 2, yPos + rowHeight / 2 + 1, { align: 'left' });
      doc.text('Approved By', colPositions[2] + 2, yPos + rowHeight / 2 + 1, { align: 'left' });
      doc.text('Approval Date', colPositions[3] + 2, yPos + rowHeight / 2 + 1, { align: 'left' });
      yPos += rowHeight;
      
      doc.setFont('helvetica', 'normal');
      clearanceSteps.forEach((step, index) => {
        if (yPos + rowHeight > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
        }
        
        const rowColor = index % 2 === 0 ? 255 : 245;
        doc.setFillColor(230, 255, 230); // Light green for completed
        doc.rect(margin, yPos, pageWidth - 2 * margin, rowHeight, 'F');
        
        doc.setTextColor(0, 0, 0);
        doc.text(`${index + 1}`, colPositions[0] + 2, yPos + rowHeight / 2 + 1, { align: 'left' });
        doc.text(step.department, colPositions[1] + 2, yPos + rowHeight / 2 + 1, { align: 'left', maxWidth: colWidths[1] - 4 });
        doc.text(step.approvedBy?.name || 'System', colPositions[2] + 2, yPos + rowHeight / 2 + 1, { align: 'left', maxWidth: colWidths[2] - 4 });
        doc.text(new Date(step.approvedAt || step.updatedAt).toLocaleDateString(), colPositions[3] + 2, yPos + rowHeight / 2 + 1, { align: 'left' });
        
        yPos += rowHeight;
      });
      
      yPos += 20;
      
      // QR Code for verification with enhanced data
      const baseUrl = process.env.FRONTEND_URL || 'https://clearance.wldu.edu.et';
      const verificationData = {
        referenceCode,
        staffName,
        department,
        staffId,
        status: 'cleared',
        verificationUrl: `${baseUrl}/verify/${referenceCode}`,
        generatedAt: new Date().toISOString(),
        totalSteps: clearanceSteps.length
      };
      
      try {
        const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(verificationData), {
          errorCorrectionLevel: 'H',
          width: 100
        });
        
        if (yPos + 40 > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.addImage(qrCodeDataURL, 'PNG', margin, pageHeight - margin - 60, 35, 35);
        doc.setFontSize(8);
        doc.text('Scan to Verify', margin + 17.5, pageHeight - margin - 20, { align: 'center' });
      } catch (qrError) {
        console.warn('Error generating QR code:', qrError.message);
        doc.setFontSize(8);
        doc.text(`Verify at: ${baseUrl}/verify/${referenceCode}`, margin, pageHeight - margin - 40);
      }
      
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Generated by Woldia University Teacher Clearance System', pageWidth / 2, pageHeight - margin - 10, { align: 'center' });
      doc.text('This certificate is valid only with digital verification', pageWidth / 2, pageHeight - margin, { align: 'center' });
      
      pdfBuffer = doc.output('arraybuffer');
    } catch (pdfError) {
      console.error('Error generating PDF:', pdfError);
      return next(new AppError('Failed to generate PDF certificate', 500));
    }
    
    // Log certificate generation activity
    try {
      await ActivityLog.create({
        userId: userId,
        action: 'CERTIFICATE_GENERATED',
        details: {
          requestId: id,
          referenceCode: request.referenceCode,
          staffName: request.initiatedBy.name,
          generatedBy: req.user.name,
          generatedAt: new Date()
        },
        ipAddress: req.ip || req.connection.remoteAddress
      });
    } catch (logError) {
      console.warn('Failed to log certificate generation:', logError.message);
      // Don't fail the request if logging fails
    }
    
    // Send PDF response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="clearance-certificate-${request.referenceCode}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.byteLength);
    res.send(Buffer.from(pdfBuffer));
    
  } catch (error) {
    console.error('Certificate generation error:', error);
    return next(new AppError('Internal server error during certificate generation', 500));
  }
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
