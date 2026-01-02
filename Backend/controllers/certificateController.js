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

// Helper to format role to department name
const formatRoleToDepartment = (role) => {
  if (!role) return '';

  // Handle known acronyms first to avoid splitting them
  if (role.startsWith('ICT')) return 'ICT ' + role.substring(3).replace('Reviewer', '').replace(/([A-Z])/g, ' $1').trim();
  if (role.startsWith('HR')) return 'HR ' + role.substring(2).replace('Reviewer', '').replace(/([A-Z])/g, ' $1').trim();

  // Default formatting: CamelCaseReviewer -> Camel Case
  return role.replace('Reviewer', '')
    .replace(/([A-Z])/g, ' $1')
    .trim();
};

// Generate certificate with workflow sequence and authorized person names
const generateCertificate = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    // Removed auth check to allow public download
    // const userId = req.user._id;
    // const userRole = req.user.role;

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

    // IMPROVED LOGIC: Allow download if request status is in_progress, cleared, or archived
    // This is more robust than checking individual steps
    const validStatuses = ['in_progress', 'cleared', 'archived'];
    const isStatusValid = validStatuses.includes(request.status);

    // Also keep the step-based check as a fallback/extra validation
    const vpFinalStep = clearanceSteps.find(s =>
      s.reviewerRole === 'AcademicVicePresident' &&
      (s.vpSignatureType === 'final' || s.order > 1)
    );
    const isVpFinalCleared = vpFinalStep && vpFinalStep.status === 'cleared';

    if (!isStatusValid && !allStepsCleared && !isVpFinalCleared) {
      const pendingSteps = clearanceSteps
        .filter(step => step.status !== 'cleared')
        .map(step => `${step.department} (${step.status})`)
        .join(', ');

      return next(new AppError(
        `Certificate cannot be generated yet. Current status: ${request.status}. Pending steps: ${pendingSteps}.`,
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

    // Authorization check REMOVED to allow public download
    // Admins and specific reviewers can download any certificate
    // const authorizedRoles = ['SystemAdmin', 'RecordsArchivesOfficerReviewer', 'AcademicVicePresident', 'AcademicStaff'];

    // console.log('CERTIFICATE AUTH CHECK SKIPPED (Public Access)');

    // if (!isAuthorizedRole && !isOwnRequest) {
    //   return next(new AppError('You do not have permission to generate this certificate', 403));
    // }

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
      // Light Header Background (White/Very Light Gray)
      doc.setFillColor(252, 252, 252);
      doc.rect(0, 0, pageWidth, 45, 'F');

      // Decorative Top Line (University Blue)
      doc.setDrawColor(10, 40, 90);
      doc.setLineWidth(2);
      doc.line(0, 0, pageWidth, 0);

      // University Logo - Load dynamically
      try {
        // Path to the logo image (login page logo)
        const logoPath = path.join(__dirname, '../../public/assets/logo.jpeg');
        const srcLogoPath = path.join(__dirname, '../../src/assets/logo.jpeg');

        let finalLogoPath = null;
        if (fs.existsSync(logoPath)) {
          finalLogoPath = logoPath;
        } else if (fs.existsSync(srcLogoPath)) {
          finalLogoPath = srcLogoPath;
        }

        if (finalLogoPath) {
          const logoBase64 = fs.readFileSync(finalLogoPath, { encoding: 'base64' });
          // Add logo to top left (margin, 5)
          doc.addImage(`data:image/jpeg;base64,${logoBase64}`, 'JPEG', margin, 5, 35, 35);
        } else {
          console.warn('Logo file not found at:', logoPath, 'or', srcLogoPath);
          // Fallback placeholder
          doc.setDrawColor(200, 200, 200);
          doc.circle(margin + 17, 22, 17, 'S');
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text('LOGO', margin + 17, 24, { align: 'center' });
        }
      } catch (logoError) {
        console.warn('Error loading logo:', logoError.message);
      }

      // Header Text
      // University Name - Deep Blue, Bold, Spaced
      doc.setTextColor(10, 40, 90); // Deep Blue
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.text('WOLDIA UNIVERSITY', pageWidth / 2, 15, { align: 'center' });

      // Office Name - Dark Gray, Elegant
      doc.setTextColor(80, 80, 80);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text('OFFICE OF THE REGISTRAR', pageWidth / 2, 22, { align: 'center' });

      // Certificate Title - Attractive Design
      doc.setDrawColor(218, 165, 32); // Goldenrod
      doc.setLineWidth(0.5);
      doc.line(pageWidth / 2 - 40, 26, pageWidth / 2 + 40, 26); // Decorative line above

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(184, 134, 11); // Dark Goldenrod
      doc.text('STAFF CLEARANCE CERTIFICATE', pageWidth / 2, 34, { align: 'center' });

      doc.line(pageWidth / 2 - 40, 38, pageWidth / 2 + 40, 38); // Decorative line below

      // Header Bottom Border
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.5);
      doc.line(margin, 45, pageWidth - margin, 45);

      yPos = 60;

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
      const staffId = request.staffId || 'N/A';
      const referenceCode = request.referenceCode;
      const issueDate = request.completedAt || request.updatedAt || new Date();
      const generatedDate = new Date(issueDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

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
      doc.text(`${request.initiatedBy.staffId || 'N/A'}`, margin + 35, yPos + 16);

      // Add Reason
      doc.setFont('helvetica', 'bold');
      doc.text('Reason:', margin + 5, yPos + 24);
      doc.setFont('helvetica', 'normal');
      doc.text(request.purpose, margin + 35, yPos + 24);

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

      yPos += 35;

      // --- VP INITIAL APPROVAL SECTION (Above Table) ---
      const vpInitialStep = clearanceSteps.find(s =>
        s.reviewerRole === 'AcademicVicePresident' &&
        (s.vpSignatureType === 'initial' || s.order === 1)
      );

      if (vpInitialStep) {
        // Professional Box Layout
        const boxHeight = 40;
        const boxY = yPos;

        // Main Border
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(margin, boxY, pageWidth - (2 * margin), boxHeight, 2, 2, 'FD');

        // Header Bar
        doc.setFillColor(10, 40, 90); // University Blue
        doc.rect(margin, boxY, pageWidth - (2 * margin), 8, 'F');

        // Header Text
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255); // White
        doc.setFont('helvetica', 'bold');
        doc.text('ACADEMIC VICE PRESIDENT - INITIAL APPROVAL', margin + 5, boxY + 5.5);

        // Content Area
        const contentY = boxY + 14;

        // Left Side: Status & Date
        doc.setTextColor(60, 60, 60);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Status:', margin + 5, contentY);

        const vpStatus = vpInitialStep.status.toUpperCase();
        doc.setFont('helvetica', 'bold');
        if (vpStatus === 'CLEARED' || vpStatus === 'VP_INITIAL_APPROVAL') {
          doc.setTextColor(0, 128, 0); // Green
          doc.text('APPROVED', margin + 25, contentY);
        } else {
          doc.setTextColor(200, 0, 0); // Red
          doc.text(vpStatus, margin + 25, contentY);
        }

        // Approval Date
        if (vpInitialStep.updatedAt) {
          doc.setTextColor(60, 60, 60);
          doc.setFont('helvetica', 'normal');
          doc.text('Date:', margin + 5, contentY + 6);
          doc.text(new Date(vpInitialStep.updatedAt).toLocaleDateString(), margin + 25, contentY + 6);
        }

        // Comment (Full width below)
        if (vpInitialStep.comment) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(8);
          doc.setTextColor(80, 80, 80);
          doc.text(`"${vpInitialStep.comment}"`, margin + 5, contentY + 14, { maxWidth: 100 });
        }

        // Right Side: Signature
        const signatureKey = 'vpinitialsignature';
        const signatureToUse = signatures[signatureKey] || vpInitialStep.signature;

        doc.setDrawColor(220, 220, 220);
        doc.line(pageWidth - margin - 60, boxY + 8, pageWidth - margin - 60, boxY + boxHeight); // Vertical divider

        if (signatureToUse && signatureToUse.startsWith('data:image')) {
          try {
            const formatMatch = signatureToUse.match(/data:image\/(png|jpg|jpeg|gif|bmp|webp)/i);
            let imgFormat = 'PNG';
            if (formatMatch && formatMatch[1]) {
              imgFormat = formatMatch[1].toUpperCase() === 'JPG' ? 'JPEG' : formatMatch[1].toUpperCase();
            }
            // Centered signature in the right box
            doc.addImage(signatureToUse, imgFormat, pageWidth - margin - 55, boxY + 10, 50, 20);
          } catch (err) {
            console.warn('Error adding VP initial signature', err);
          }
        }

        // Signature Label
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.setFont('helvetica', 'normal');
        doc.text('Authorized Signature', pageWidth - margin - 30, boxY + 36, { align: 'center' });

        yPos += boxHeight + 10;
      }

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

      // Filter out VP Initial for table
      const tableSteps = clearanceSteps.filter(s => s !== vpInitialStep);

      tableSteps.forEach((step, index) => {
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

        // Fix for generic "Other Departmental Clearances"
        if (deptText === 'Other Departmental Clearances' && step.reviewerRole) {
          deptText = formatRoleToDepartment(step.reviewerRole);
        }

        if (deptText.length > 35) deptText = deptText.substring(0, 32) + '...';
        if (deptText.length > 35) deptText = deptText.substring(0, 32) + '...';
        doc.text(deptText, currentX + 2, yPos + 5); currentX += colWidths[1];

        doc.text(step.reviewedBy?.name || 'System', currentX + 2, yPos + 5); currentX += colWidths[2];

        const stepDate = step.lastUpdatedAt || step.updatedAt || step.approvedAt;
        const dateStr = stepDate ? new Date(stepDate).toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : '-';
        doc.text(dateStr, currentX + 2, yPos + 5); currentX += colWidths[3];

        // Check for VP Final step to map status
        let displayStatus = step.status.toUpperCase();
        let isCleared = step.status === 'cleared';

        // VP Final Handling: Map 'in_progress' to 'CLEARED'
        if ((step.department === 'Academic Vice President Final Oversight' || step.reviewerRole === 'AcademicVicePresident') && step.vpSignatureType === 'final') {
          if (step.status === 'in_progress' || step.status === 'cleared') {
            displayStatus = 'CLEARED';
            isCleared = true;
          }
        }

        // Try to find signature
        let signatureToDisplay = null;
        if (step.signature) signatureToDisplay = step.signature;

        // Lookup in signatures object (populated earlier)
        const key = step.department.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (signatures[key]) signatureToDisplay = signatures[key];

        // VP Final signature specific lookup
        if (step.vpSignatureType === 'final' && signatures['vpfinalsignature']) {
          signatureToDisplay = signatures['vpfinalsignature'];
        }

        if (signatureToDisplay && signatureToDisplay.startsWith('data:image')) {
          try {
            const formatMatch = signatureToDisplay.match(/data:image\/(png|jpg|jpeg|gif|bmp|webp)/i);
            let imgFormat = 'PNG';
            if (formatMatch && formatMatch[1]) {
              imgFormat = formatMatch[1].toUpperCase() === 'JPG' ? 'JPEG' : formatMatch[1].toUpperCase();
            }
            // Render signature image instead of text
            doc.addImage(signatureToDisplay, imgFormat, currentX + 2, yPos - 2, 30, 8);
          } catch (err) {
            // Fallback to text
            if (isCleared || displayStatus === 'CLEARED') doc.setTextColor(0, 128, 0);
            else if (displayStatus === 'PENDING') doc.setTextColor(200, 150, 0);
            else doc.setTextColor(200, 0, 0);
            doc.text(displayStatus, currentX + 2, yPos + 5);
          }
        } else {
          // Text Status Fallback
          if (isCleared || displayStatus === 'CLEARED') doc.setTextColor(0, 128, 0);
          else if (displayStatus === 'PENDING') doc.setTextColor(200, 150, 0);
          else doc.setTextColor(200, 0, 0);
          doc.text(displayStatus, currentX + 2, yPos + 5);
        }

        yPos += rowHeight;
      });

      // --- FOOTER & VERIFICATION SECTION ---
      // Ensure we are at the bottom
      const footerHeight = 50;
      if (yPos < pageHeight - footerHeight - margin) {
        yPos = pageHeight - footerHeight - margin;
      } else {
        if (yPos > pageHeight - footerHeight - margin) {
          doc.addPage();
          yPos = pageHeight - footerHeight - margin;
        }
      }

      // Verification Box Background
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(248, 250, 252); // Very light blue-gray
      doc.roundedRect(margin, yPos, pageWidth - (2 * margin), 45, 3, 3, 'FD');

      // QR Code Section (Left)
      const baseUrl = process.env.FRONTEND_URL || 'https://clearance.wldu.edu.et';
      const verificationUrl = `${baseUrl}/verify/${referenceCode}`;

      try {
        const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify({
          referenceCode,
          staffId,
          url: verificationUrl
        }), { errorCorrectionLevel: 'H', width: 100 });

        // White background for QR code
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(margin + 5, yPos + 5, 35, 35, 2, 2, 'F');
        doc.addImage(qrCodeDataURL, 'PNG', margin + 7.5, yPos + 7.5, 30, 30);
      } catch (e) {
        // Fallback
      }

      // Vertical Divider
      doc.setDrawColor(220, 220, 220);
      doc.line(margin + 45, yPos + 5, margin + 45, yPos + 40);

      // Verification Text (Right)
      const textStartX = margin + 50;

      // Title
      doc.setFontSize(11);
      doc.setTextColor(10, 40, 90); // Deep Blue
      doc.setFont('helvetica', 'bold');
      doc.text('OFFICIAL DIGITAL VERIFICATION', textStartX, yPos + 10);

      // Instructions
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.setFont('helvetica', 'normal');
      doc.text('Scan the QR code to verify the authenticity of this document.', textStartX, yPos + 16);
      doc.text('The digital record serves as the primary source of truth.', textStartX, yPos + 21);

      // Validity Warning
      doc.setFontSize(8);
      doc.setTextColor(200, 0, 0); // Red
      doc.setFont('helvetica', 'bold');
      doc.text('WARNING: Any alteration or modification renders this certificate invalid.', textStartX, yPos + 30);

      // Certification Statement
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'italic');
      doc.text('This document certifies that the staff member has completed all university clearance requirements.', textStartX, yPos + 38);

      // Bottom Banner (Full Width)
      doc.setFillColor(10, 40, 90); // Deep Blue
      doc.rect(0, pageHeight - 8, pageWidth, 8, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(`System Generated: ${referenceCode} | ${new Date().toISOString()}`, pageWidth / 2, pageHeight - 3, { align: 'center' });

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