import jsPDF from 'jspdf';


// Load logo dynamically from public assets
const loadWoldiaLogo = async (): Promise<string> => {
  try {
    const logoPath = '/assets/logo.jpeg';
    const response = await fetch(logoPath);
    if (!response.ok) {
      console.warn('Logo not found, using fallback');
      return '';
    }
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error loading Woldia logo:', error);
    return '';
  }
};



// Utility function to validate and fix base64 image data
const validateAndFixBase64Image = (base64String: string): string | null => {
  try {
    // Check if it's a valid data URL format
    if (!base64String.match(/^data:image\/(png|jpg|jpeg|gif|bmp|webp);base64,/i)) {
      console.warn('Invalid data URL format');
      return null;
    }

    // Extract the base64 part
    const base64Data = base64String.split(',')[1];
    if (!base64Data) {
      console.warn('No base64 data found');
      return null;
    }

    // Validate base64 format - should only contain valid base64 characters
    if (!base64Data.match(/^[A-Za-z0-9+/]*={0,2}$/)) {
      console.warn('Invalid base64 characters found');
      return null;
    }

    // Check if base64 length is reasonable (not too short)
    if (base64Data.length < 100) {
      console.warn('Base64 data too short, likely incomplete');
      return null;
    }

    // Try to decode base64 to validate it
    try {
      atob(base64Data);
    } catch (e) {
      console.warn('Invalid base64 encoding:', e);
      return null;
    }

    // If PNG, check for PNG signature (89 50 4E 47)
    if (base64String.includes('data:image/png')) {
      const decoded = atob(base64Data);
      const pngSignature = decoded.substring(0, 4);
      const expectedSignature = String.fromCharCode(0x89, 0x50, 0x4E, 0x47);

      if (pngSignature !== expectedSignature) {
        console.warn('PNG signature validation failed');
        return null;
      }
    }

    return base64String;
  } catch (error) {
    console.error('Error validating base64 image:', error);
    return null;
  }
};

// Utility function to render signature placeholder
const renderSignaturePlaceholder = (doc: any, x: number, y: number, text: string, isError: boolean = false): void => {
  doc.setFontSize(8);
  doc.setTextColor(isError ? 255 : 128, isError ? 0 : 128, isError ? 0 : 128);
  doc.text(text, x, y, { align: 'left' });
  doc.setTextColor(0, 0, 0); // Reset color
  doc.setFontSize(10); // Reset font size
};

export const generateClearanceCertificate = async (request: any, signatures: { [key: string]: string }) => {
  // Validation: Only generate certificates for cleared requests
  if (!request || request.status !== 'cleared') {
    throw new Error('Certificate can only be generated for cleared requests');
  }

  // Validation: Ensure request has required fields
  if (!request.initiatedBy || !request.referenceCode || !request.steps) {
    throw new Error('Invalid request data: missing required fields');
  }
  const doc = new jsPDF();
  let yPos = 20;
  const margin = 20; // 1 inch margin (approx 25.4mm, using 20 for simplicity)
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Set font
  doc.setFont('helvetica');

  // Function to add watermark
  const addWatermark = (doc: jsPDF, pageWidth: number, pageHeight: number) => {
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(50);
    doc.text('Woldia University', pageWidth / 2, pageHeight / 2, { align: 'center', angle: 45 });
    doc.setTextColor(0, 0, 0); // Reset text color
  };

  // Add watermark to the first page
  addWatermark(doc, pageWidth, pageHeight);

  // Certificate Border
  doc.setDrawColor(150, 150, 150); // Light gray
  doc.setLineWidth(0.5);
  doc.rect(margin / 2, margin / 2, pageWidth - margin, pageHeight - margin);

  // HEADER SECTION - Load logo dynamically
  try {
    const logoBase64 = await loadWoldiaLogo();
    if (logoBase64 && logoBase64.length > 100) {
      doc.addImage(logoBase64, 'JPEG', margin, yPos, 30, 30);
    } else {
      // Fallback: Draw a placeholder rectangle
      doc.setDrawColor(150, 150, 150);
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPos, 30, 30, 'FD');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('WOLDIA', margin + 15, yPos + 15, { align: 'center' });
      doc.text('UNIVERSITY', margin + 15, yPos + 20, { align: 'center' });
      doc.setTextColor(0, 0, 0); // Reset color
    }
  } catch (error) {
    console.error('Error adding logo to PDF:', error);
    // Draw placeholder on error
    doc.setDrawColor(150, 150, 150);
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos, 30, 30, 'FD');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('WOLDIA', margin + 15, yPos + 15, { align: 'center' });
    doc.text('UNIVERSITY', margin + 15, yPos + 20, { align: 'center' });
    doc.setTextColor(0, 0, 0); // Reset color
  }
  yPos += 35; // Adjust yPos after adding logo

  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Final Clearance Certificate', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Woldia University – Academic Staff Clearance', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Reference Code and Date Issued
  doc.setFontSize(10);
  doc.text(`Reference Code: ${request.referenceCode}`, pageWidth - margin, margin, { align: 'right' });
  doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, pageWidth - margin, margin + 5, { align: 'right' });
  yPos = Math.max(yPos, margin + 20); // Ensure yPos is below header elements

  // Teacher Info Box
  doc.setDrawColor(0);
  doc.setFillColor(240, 240, 240); // Light gray background
  doc.rect(margin, yPos, pageWidth - 2 * margin, 40, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Teacher Information:', margin + 5, yPos + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name           : ${request.initiatedBy.name}`, margin + 5, yPos + 17);
  doc.text(`Department     : ${request.initiatedBy.department || 'N/A'}`, margin + 5, yPos + 24);
  doc.text(`Staff ID       : ${request.initiatedBy.staffId || 'N/A'}`, margin + 5, yPos + 31);
  doc.text(`Staff ID       : ${request.initiatedBy.staffId || 'N/A'}`, margin + 5, yPos + 31);
  doc.text(`Reason         : ${request.purpose}`, pageWidth / 2 + 10, yPos + 17);
  doc.text(`Submitted On   : ${new Date(request.createdAt).toLocaleDateString()}`, pageWidth / 2 + 10, yPos + 24);
  doc.text(`Finalized On   : ${new Date(request.updatedAt).toLocaleDateString()}`, pageWidth / 2 + 10, yPos + 31);
  yPos += 50;

  // Pre-process steps to identify VP approvals
  const vpInitialStep = request.steps.find((s: any) =>
    s.department === 'Vice President for Academic, Research & Community Engagement' ||
    s.vpSignatureType === 'initial' ||
    s.reviewerRole === 'vice_president' // Fallback check
  );

  const stepsForTable = request.steps.filter((s: any) => s !== vpInitialStep);

  // VP INITIAL APPROVAL SECTION (Above Table)
  if (vpInitialStep) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('VP Initial Approval:', margin, yPos);
    yPos += 8;

    doc.setDrawColor(0);
    doc.setFillColor(250, 250, 250);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 35, 'F');

    doc.setFontSize(10);
    doc.text(`Status: ${vpInitialStep.status === 'cleared' ? 'Approved' : vpInitialStep.status}`, margin + 5, yPos + 8);

    if (vpInitialStep.comment) {
      doc.text(`Comment: ${vpInitialStep.comment}`, margin + 5, yPos + 16, { maxWidth: pageWidth - 2 * margin - 60 });
    }

    // Render VP Initial Signature
    const signatureKey = 'vpinitialsignature'; // Key for VP initial
    const signatureToUse = signatures[signatureKey] || vpInitialStep.signature;

    if (signatureToUse) {
      // Validate and Render Signature logic similar to table
      // Simplified for brevity, reuse logic if possible or duplicate safely
      const validatedSignature = validateAndFixBase64Image(signatureToUse);
      if (validatedSignature) {
        const formatMatch = validatedSignature.match(/data:image\/(png|jpg|jpeg|gif|bmp|webp)/i);
        let imgFormat = 'PNG';
        if (formatMatch && formatMatch[1]) {
          imgFormat = formatMatch[1].toUpperCase() === 'JPG' ? 'JPEG' : formatMatch[1].toUpperCase();
        }
        doc.addImage(validatedSignature, imgFormat, pageWidth - margin - 50, yPos + 2, 40, 12);
      } else {
        renderSignaturePlaceholder(doc, pageWidth - margin - 50, yPos + 10, '[Invalid Signature]');
      }
    } else {
      renderSignaturePlaceholder(doc, pageWidth - margin - 50, yPos + 10, '[Pending Signature]');
    }

    yPos += 45;
  }


  // DEPARTMENT CLEARANCE STATUS TABLE
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Department Clearance Status:', margin, yPos);
  yPos += 10;

  // Table Headers
  // Table Headers
  // Removed Signature Column, Merged Signature into Status
  const colWidths = [10, 80, 50, 30]; // Adjusted widths: #, Department, Status (Signature), Signed Date
  const colPositions = [
    margin,
    margin + colWidths[0],
    margin + colWidths[0] + colWidths[1],
    margin + colWidths[0] + colWidths[1] + colWidths[2]
  ];
  const rowHeight = 15; // Increased row height for signatures

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(220, 220, 220); // Header background
  doc.rect(margin, yPos, pageWidth - 2 * margin, rowHeight, 'F');
  doc.text('#', colPositions[0] + 2, yPos + rowHeight / 2 + 1, { align: 'left' });
  doc.text('Department', colPositions[1] + 2, yPos + rowHeight / 2 + 1, { align: 'left' });
  doc.text('Status / Signature', colPositions[2] + 2, yPos + rowHeight / 2 + 1, { align: 'left' });
  doc.text('Signed Date', colPositions[3] + 2, yPos + rowHeight / 2 + 1, { align: 'left' });
  yPos += rowHeight;

  doc.setFont('helvetica', 'normal');

  // REPLACING LOOP LOGIC
  stepsForTable.forEach((step: any, index: number) => {
    if (yPos + rowHeight > pageHeight - margin) {
      doc.addPage();
      addWatermark(doc, pageWidth, pageHeight); // Add watermark to new page
      yPos = margin;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(220, 220, 220);
      doc.rect(margin, yPos, pageWidth - 2 * margin, rowHeight, 'F');
      doc.text('#', colPositions[0] + 2, yPos + rowHeight / 2 + 1, { align: 'left' });
      doc.text('Department', colPositions[1] + 2, yPos + rowHeight / 2 + 1, { align: 'left' });
      doc.text('Status / Signature', colPositions[2] + 2, yPos + rowHeight / 2 + 1, { align: 'left' });
      doc.text('Signed Date', colPositions[3] + 2, yPos + rowHeight / 2 + 1, { align: 'left' });
      yPos += rowHeight;
      doc.setFont('helvetica', 'normal');
    }

    // Check for VP Final step to map status
    let displayStatus = step.status === 'cleared' ? 'Cleared' : 'Issue';
    let isCleared = step.status === 'cleared';

    // VP Final Handling: Map 'in_progress' to 'Cleared'
    if ((step.department === 'Academic Vice President Final Oversight' || step.reviewerRole === 'academic_vice_president') && step.status === 'in_progress') {
      displayStatus = 'Cleared';
      isCleared = true;
    }

    const rowColor = index % 2 === 0 ? 255 : 245; // Alternating row colors
    doc.setFillColor(rowColor, rowColor, rowColor);
    if (isCleared) {
      doc.setFillColor(230, 255, 230); // Light green for cleared
    } else {
      doc.setFillColor(255, 230, 230); // Light red for issues
    }
    doc.rect(margin, yPos, pageWidth - 2 * margin, rowHeight, 'F');

    doc.setTextColor(0, 0, 0);
    doc.text(`${index + 1}`, colPositions[0] + 2, yPos + rowHeight / 2 + 1, { align: 'left' });
    doc.text(step.department, colPositions[1] + 2, yPos + rowHeight / 2 + 1, { align: 'left', maxWidth: colWidths[1] - 4 });
    doc.text(new Date(step.updatedAt).toLocaleDateString(), colPositions[3] + 2, yPos + rowHeight / 2 + 1, { align: 'left' });

    // Enhanced signature handling with validation
    const signatureKey = step.department.toLowerCase().replace(/[^a-z0-9]/g, '');
    const roleKey = step.reviewerRole?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';

    // Map actual signature keys from your testing data to department names and roles
    const signatureKeyMapping: { [key: string]: string } = {
      'vicepresidentforacademicresearchcommunityengagement': 'vpinitialsignature',
      'academicdepartmenthead': 'departmentheadapproval',
      'collegehead': 'collegeheadapproval',
      'academicvicepresidentfinaloversight': 'academicvpinitialvalidation'
    };

    // Try multiple signature lookup strategies
    const mappedKey = signatureKeyMapping[signatureKey] || signatureKey;

    console.log(`🔍 Searching for signature - Department: "${step.department}" → DeptKey: "${signatureKey}" → RoleKey: "${roleKey}" → Mapped: "${mappedKey}"`);
    console.log(`📋 Available signature keys:`, Object.keys(signatures));

    try {
      let signatureToUse = null;

      // Priority: step.signature first, then role-based, then mapped, then department-based
      if (step.signature && typeof step.signature === 'string' && step.signature.length > 50) {
        signatureToUse = step.signature;
        console.log(`✅ Using step signature for ${step.department}, length: ${step.signature.length}`);
      } else if (roleKey && signatures[roleKey] && signatures[roleKey].length > 50) {
        signatureToUse = signatures[roleKey];
        console.log(`✅ Using role-based signature for ${step.department}, roleKey: ${roleKey}`);
      } else if (signatures[mappedKey] && signatures[mappedKey].length > 50) {
        signatureToUse = signatures[mappedKey];
        console.log(`✅ Using mapped signature for ${step.department}, key: ${mappedKey}`);
      } else if (signatures[signatureKey] && signatures[signatureKey].length > 50) {
        signatureToUse = signatures[signatureKey];
        console.log(`✅ Using department signature for ${step.department}, key: ${signatureKey}`);
      }

      // RENDER SIGNATURE IN STATUS COLUMN (colPositions[2])
      if (signatureToUse && signatureToUse.startsWith('data:image')) {
        // Validate and process base64 image
        const validatedSignature = validateAndFixBase64Image(signatureToUse);

        if (validatedSignature) {
          // Extract image format more reliably
          const formatMatch = validatedSignature.match(/data:image\/(png|jpg|jpeg|gif|bmp|webp)/i);
          let imgFormat = 'PNG'; // Default fallback

          if (formatMatch) {
            imgFormat = formatMatch[1].toUpperCase();
            if (imgFormat === 'JPG') imgFormat = 'JPEG'; // jsPDF uses JPEG not JPG
          }

          console.log(`Adding validated ${imgFormat} signature for ${step.department}`);

          // Add image with proper error handling
          doc.addImage(validatedSignature, imgFormat, colPositions[2] + 2, yPos + 1, 35, 12);
        } else {
          console.warn(`Invalid base64 signature for ${step.department}, using placeholder`);
          // Fallback to text status if signature invalid
          doc.text(displayStatus, colPositions[2] + 2, yPos + rowHeight / 2 + 1, { align: 'left' });
        }
      } else if (signatureToUse && !signatureToUse.startsWith('data:image')) {
        // Handle file path (relative to backend)
        console.log(`Adding file path signature for ${step.department}: ${signatureToUse}`);
        const signaturePath = signatureToUse.startsWith('/') ? signatureToUse : `/${signatureToUse}`;
        doc.addImage(signaturePath, 'PNG', colPositions[2] + 2, yPos + 1, 35, 12);
      } else {
        // No valid signature found - Fallback to Text Status
        console.log(`No valid signature found for ${step.department}, using text status`);
        doc.text(displayStatus, colPositions[2] + 2, yPos + rowHeight / 2 + 1, { align: 'left' });
      }
    } catch (signatureError) {
      console.error(`Error adding signature for ${step.department}:`, signatureError, 'Signature data:', step.signature ? step.signature.substring(0, 100) + '...' : 'none');
      // Fallback on error
      doc.text(displayStatus, colPositions[2] + 2, yPos + rowHeight / 2 + 1, { align: 'left' });
    }
    yPos += rowHeight;
  });


  yPos += 23;



  // SECURITY/FOOTER SECTION
  if (yPos + 40 > pageHeight - margin) {
    doc.addPage();
    yPos = margin;
  }
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100); // Gray text

  // QR Code removed as per request
  // Verification instruction
  const baseUrl = (window as any).env?.REACT_APP_FRONTEND_URL || window.location.origin;
  doc.setFontSize(8);
  doc.text(`Verify authenticity at: ${baseUrl}/verify/${request.referenceCode}`, margin, pageHeight - margin - 40);

  doc.text('Generated by Woldia University Teacher Clearance System', pageWidth / 2, pageHeight - margin - 10, { align: 'center' });
  doc.text('For IT Support: support@wldu.edu.et | Woldia University, Woldia, Ethiopia | +251-XXX-XXXX', pageWidth / 2, pageHeight - margin, { align: 'center' });

  return doc;
};

// Helper function to load image (conceptual, would need actual implementation for browser/node)
// async function loadImage(src: string): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     img.onload = () => resolve(img.src);
//     img.onerror = reject;
//     img.src = src;
//   });
// }
