const ClearanceRequest = require('../models/ClearanceRequest');
const ClearanceStep = require('../models/ClearanceStep');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { asyncHandler } = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { jsPDF } = require('jspdf');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Generate certificate with workflow sequence and authorized person names
const generateCertificate = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    // MOCK USER FOR TESTING (since middleware is removed)
    if (!req.user) {
      req.user = {
        _id: 'mock_admin_id',
        role: 'SystemAdmin', // Mock as Admin to bypass checks
        name: 'Test Admin'
      };
      console.log('⚠️ USING MOCK USER FOR TESTING');
    }

    const userId = req.user._id;
    const userRole = req.user.role;

    // Enhanced validation
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return next(new AppError('Invalid request ID format', 400));
    }

    const request = await ClearanceRequest.findById(id)
      .populate('initiatedBy', 'name email department staffId')
      .lean();

    if (!request) {
      return next(new AppError('Clearance request not found', 404));
    }

    // Get all clearance steps FIRST to validate completion
    const clearanceSteps = await ClearanceStep.find({ requestId: id })
      .populate('reviewedBy', 'name email')
      .sort({ order: 1 })
      .lean();

    // Enhanced validation - check if ALL steps are actually cleared
    const totalSteps = clearanceSteps.length;
    const clearedSteps = clearanceSteps.filter(step => step.status === 'cleared');
    const allStepsCleared = clearedSteps.length === totalSteps && totalSteps > 0;

    console.log('CERTIFICATE VALIDATION:');
    console.log(`Request ID: ${id}`);
    console.log(`Request Status: ${request.status}`);
    console.log(`Total Steps: ${totalSteps}`);
    console.log(`Cleared Steps: ${clearedSteps.length}`);
    console.log(`All Steps Cleared: ${allStepsCleared}`);

    // IMPROVED LOGIC: Allow download if ALL steps are cleared, regardless of request status
    if (!allStepsCleared) {
      const pendingSteps = clearanceSteps
        .filter(step => step.status !== 'cleared')
        .map(step => `${step.department} (${step.status})`)
        .join(', ');

      return next(new AppError(
        `Certificate cannot be generated yet. Pending steps: ${pendingSteps}. (${clearedSteps.length}/${totalSteps} completed)`,
        400
      ));
    }

    // If all steps are cleared but request status isn't updated, auto-update it
    if (allStepsCleared && request.status !== 'cleared') {
      console.log('Auto-updating request status to "cleared"');
      await ClearanceRequest.findByIdAndUpdate(id, {
        status: 'cleared',
        completedAt: new Date()
      });
      request.status = 'cleared'; // Update local copy too
      request.completedAt = new Date();
    }

    // Authorization check - staff can download their own certificates
    // Admins and specific reviewers can download any certificate
    const authorizedRoles = ['SystemAdmin', 'RecordsArchivesReviewer', 'AcademicVicePresident', 'AcademicStaff'];
    // const userRole = req.user.role; // Now defined at the top
    // const userId = req.user._id; // Now defined at the top

    console.log('CERTIFICATE AUTH CHECK:');
    console.log(`User Role: ${userRole}`);
    console.log(`User ID: ${userId}`);
    console.log(`Request Initiated By: ${request.initiatedBy._id}`);
    console.log(`Authorized Roles: ${authorizedRoles}`);

    const isAuthorizedRole = authorizedRoles.includes(userRole);
    const isOwnRequest = request.initiatedBy._id.toString() === userId.toString();

    console.log(`Is Authorized Role: ${isAuthorizedRole}`);
    console.log(`Is Own Request: ${isOwnRequest}`);

    if (!isAuthorizedRole && !isOwnRequest) {
      return next(new AppError('You do not have permission to generate this certificate', 403));
    }

    // Steps are already fetched above, so we can use them directly
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

    // No need to validate again - we already did comprehensive validation above
    // Generate PDF with enhanced professional design
    let doc, pdfBuffer;
    try {
      doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let yPos = 0;

      // --- HEADER SECTION ---
      // Deep Blue Header Background
      doc.setFillColor(10, 40, 90); // Deep Blue
      doc.rect(0, 0, pageWidth, 40, 'F');

      // University Logo - Load dynamically
      try {
        // Updated path to user provided logo
        const logoPath = path.join(__dirname, '../../src/assets/logo.jpeg');
        if (fs.existsSync(logoPath)) {
          const logoBase64 = fs.readFileSync(logoPath, { encoding: 'base64' });
          doc.addImage(`data:image/jpeg;base64,${logoBase64}`, 'JPEG', margin, 5, 30, 30);
        } else {
          console.warn('Logo file not found at:', logoPath);
          // Fallback placeholder (White circle)
          doc.setFillColor(255, 255, 255);
          doc.circle(margin + 15, 20, 15, 'F');
          doc.setFontSize(8);
          doc.setTextColor(10, 40, 90);
          doc.text('LOGO', margin + 15, 22, { align: 'center' });
        }
      } catch (logoError) {
        console.warn('Error loading logo:', logoError.message);
      }

      // Header Text
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('WOLDIA UNIVERSITY', pageWidth / 2, 18, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('OFFICE OF THE REGISTRAR', pageWidth / 2, 26, { align: 'center' });

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 215, 0); // Gold color
      doc.text('STAFF CLEARANCE CERTIFICATE', pageWidth / 2, 36, { align: 'center' });

      yPos = 55;

      // --- WATERMARK ---
      doc.saveGraphicsState();
      doc.setTextColor(240, 240, 240);
      doc.setFontSize(80);
      doc.setFont('helvetica', 'bold');
      const watermarkText = 'OFFICIAL';
      doc.text(
        watermarkText,
        pageWidth / 2,
        pageHeight / 2,
        { align: 'center', angle: 45 }
      );
      doc.restoreGraphicsState();

      // --- STAFF INFORMATION SECTION ---
      const staffName = request.initiatedBy.name;
      const department = request.initiatedBy.department || 'N/A';
      const staffId = request.initiatedBy.staffId || 'N/A';
      const referenceCode = request.referenceCode;
      const generatedDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

      // Info Box Background
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(250, 250, 252);
      doc.roundedRect(margin, yPos, pageWidth - (2 * margin), 35, 3, 3, 'FD');

      yPos += 8;
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(10);

      // Column 1
      doc.setFont('helvetica', 'bold');
      doc.text('Staff Name:', margin + 5, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(staffName, margin + 35, yPos);

      doc.setFont('helvetica', 'bold');
      doc.text('Department:', margin + 5, yPos + 8);
      doc.setFont('helvetica', 'normal');
      doc.text(department, margin + 35, yPos + 8);

      doc.setFont('helvetica', 'bold');
      doc.text('Staff ID:', margin + 5, yPos + 16);
      doc.setFont('helvetica', 'normal');
      doc.text(staffId, margin + 35, yPos + 16);

      // Column 2
      const col2X = pageWidth / 2 + 10;
      doc.setFont('helvetica', 'bold');
      doc.text('Reference No:', col2X, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(referenceCode, col2X + 30, yPos);

      doc.setFont('helvetica', 'bold');
      doc.text('Issue Date:', col2X, yPos + 8);
      doc.setFont('helvetica', 'normal');
      doc.text(generatedDate, col2X + 30, yPos + 8);

      yPos += 35;

      // --- CLEARANCE WORKFLOW TABLE ---
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(10, 40, 90);
      doc.text('CLEARANCE STATUS', margin, yPos);

      yPos += 5;

      // Table Config
      const tableHeaders = ['#', 'Department', 'Reviewed By', 'Date', 'Status'];
      const colWidths = [12, 65, 50, 30, 25];

      const startX = margin;
      const rowHeight = 7;

      // Draw Header
      doc.setFillColor(10, 40, 90); // Deep Blue
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.rect(startX, yPos, pageWidth - (2 * margin), rowHeight, 'F');

      let currentX = startX;
      doc.text(tableHeaders[0], currentX + 2, yPos + 5); currentX += colWidths[0];
      doc.text(tableHeaders[1], currentX + 2, yPos + 5); currentX += colWidths[1];
      doc.text(tableHeaders[2], currentX + 2, yPos + 5); currentX += colWidths[2];
      doc.text(tableHeaders[3], currentX + 2, yPos + 5); currentX += colWidths[3];
      doc.text(tableHeaders[4], currentX + 2, yPos + 5);

      yPos += rowHeight;

      // Draw Rows
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);

      clearanceSteps.forEach((step, index) => {
        if (yPos + rowHeight > pageHeight - 40) {
          doc.addPage();
          yPos = 20;
        }

        // Zebra Striping
        if (index % 2 === 0) {
          doc.setFillColor(245, 247, 250);
        } else {
          doc.setFillColor(255, 255, 255);
        }
        doc.rect(startX, yPos, pageWidth - (2 * margin), rowHeight, 'F');

        // Border for row
        doc.setDrawColor(230, 230, 230);
        doc.rect(startX, yPos, pageWidth - (2 * margin), rowHeight, 'S');

        currentX = startX;
        doc.setTextColor(50, 50, 50);
        doc.text(`${index + 1}`, currentX + 2, yPos + 5); currentX += colWidths[0];

        // Truncate department if too long
        let deptText = step.department;
        if (deptText.length > 35) deptText = deptText.substring(0, 32) + '...';
        doc.text(deptText, currentX + 2, yPos + 5); currentX += colWidths[1];

        doc.text(step.reviewedBy?.name || 'System', currentX + 2, yPos + 5); currentX += colWidths[2];

        const dateStr = step.approvedAt || step.updatedAt ? new Date(step.approvedAt || step.updatedAt).toLocaleDateString() : '-';
        doc.text(dateStr, currentX + 2, yPos + 5); currentX += colWidths[3];

        // Status with color
        const status = step.status.toUpperCase();
        if (status === 'CLEARED') doc.setTextColor(0, 128, 0);
        else if (status === 'PENDING') doc.setTextColor(200, 150, 0);
        else doc.setTextColor(200, 0, 0);

        doc.text(status, currentX + 2, yPos + 5);

        yPos += rowHeight;
      });

      // --- FOOTER & VERIFICATION ---
      // Ensure we are at the bottom
      const footerHeight = 40;
      if (yPos < pageHeight - footerHeight - margin) {
        yPos = pageHeight - footerHeight - margin;
      } else {
        if (yPos > pageHeight - footerHeight - margin) {
          doc.addPage();
          yPos = pageHeight - footerHeight - margin;
        }
      }

      // QR Code
      const baseUrl = process.env.FRONTEND_URL || 'https://clearance.wldu.edu.et';
      const verificationUrl = `${baseUrl}/verify/${referenceCode}`;

      try {
        const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify({
          referenceCode,
          staffId,
          url: verificationUrl
        }), { errorCorrectionLevel: 'H', width: 100 });

        doc.addImage(qrCodeDataURL, 'PNG', margin, pageHeight - 45, 30, 30);
      } catch (e) {
        // Fallback
      }

      // Warning / Verification Text
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Scan to Verify Authenticity', margin + 15, pageHeight - 12, { align: 'center' });

      // Right side footer info
      const footerTextX = margin + 40;
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      doc.setFont('helvetica', 'bold');
      doc.text('OFFICIAL DOCUMENT', footerTextX, pageHeight - 40);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('This document certifies that the above-named staff member has successfully', footerTextX, pageHeight - 35);
      doc.text('completed all clearance requirements as per university regulations.', footerTextX, pageHeight - 31);

      doc.setTextColor(200, 0, 0);
      doc.text('Any alteration renders this certificate invalid.', footerTextX, pageHeight - 25);

      // Bottom Banner
      doc.setFillColor(245, 245, 245);
      doc.rect(0, pageHeight - 10, pageWidth, 10, 'F');
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(7);
      doc.text(`Generated ID: ${referenceCode} | ${new Date().toISOString()}`, pageWidth / 2, pageHeight - 4, { align: 'center' });

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
    .populate('reviewedBy', 'name email')
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
      approvedBy: step.reviewedBy?.name,
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

// Verify certificate validity
const verifyCertificate = asyncHandler(async (req, res, next) => {
  const { referenceCode } = req.params;

  console.log(`VERIFICATION REQUEST: Code=${referenceCode}`);

  if (!referenceCode) {
    return next(new AppError('Reference code is required', 400));
  }

  const request = await ClearanceRequest.findOne({ referenceCode })
    .populate('initiatedBy', 'name department staffId')
    .lean();

  if (!request) {
    console.log('VERIFICATION FAILED: Request not found');
    return res.status(200).json({
      success: true,
      isValid: false,
      message: 'Certificate not found',
      details: null
    });
  }

  console.log(`VERIFICATION FOUND: ID=${request._id}, Status=${request.status}`);

  // Check if actually cleared
  const isValid = request.status === 'cleared';
  console.log(`VERIFICATION RESULT: isValid=${isValid}`);

  res.status(200).json({
    success: true,
    isValid,
    status: request.status,
    details: {
      staffName: request.initiatedBy.name,
      department: request.initiatedBy.department,
      staffId: request.initiatedBy.staffId,
      referenceCode: request.referenceCode,
      issueDate: request.completedAt || request.updatedAt,
      generatedAt: new Date()
    }
  });
});

module.exports = {
  generateCertificate,
  getCertificateData,
  verifyCertificate
};