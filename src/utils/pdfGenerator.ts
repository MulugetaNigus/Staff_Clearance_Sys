import jsPDF from 'jspdf';

export const generateClearanceCertificate = (request: any) => {
  const doc = new jsPDF();

  doc.text('Clearance Certificate', 20, 20);
  doc.text(`This is to certify that ${request.initiatedBy.name} has been cleared.`, 20, 30);
  doc.text(`Reference Code: ${request.referenceCode}`, 20, 40);
  doc.text(`Purpose: ${request.purpose}`, 20, 50);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 60);

  return doc;
};
