export interface ClearanceStep {
  id: string;
  requestId: any;
  department: string;
  reviewerRole: string;
  status: 'pending' | 'available' | 'cleared' | 'issue' | 'blocked';
  comment?: string;
  lastUpdatedAt: string;
  reviewedBy?: { name: string };
  order: number;
  notes?: string;
  signature?: string;
  stage?: string;
  description?: string;
  isSequential?: boolean;
  dependsOn?: number[];
  isInterdependent?: boolean;
  interdependentWith?: string[];
  vpSignatureType?: 'initial' | 'final';
  canProcess?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UploadedFile {
  _id?: string;
  fileName: string;
  filePath: string;
  mimetype: string;
  size: number;
  visibility: 'hr' | 'vp' | 'all';
}

export interface ClearanceRequest {
  _id: string;
  referenceCode: string;
  staffId: string;
  initiatedBy: {
    _id: string;
    name: string;
  };
  purpose: string;
  status: 'initiated' | 'vp_initial_approval' | 'in_progress' | 'cleared' | 'rejected' | 'archived';
  supportingDocumentUrl?: string;
  initiatedAt: string;
  initialApprovedAt?: string;
  finalApprovedAt?: string;
  completedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  hrSignature?: string;
  vpInitialSignature?: string;
  vpFinalSignature?: string;
  vpInitialSignedAt?: string;
  vpFinalSignedAt?: string;
  archivedAt?: string;
  formData: {
    purpose: string;
    teacherId: string;
    department: string;
    fileMetadata?: Array<{ fileName: string; visibility: string }>;
  };
  reviewedBy?: {
    _id: string;
    name: string;
  };
  uploadedFiles: UploadedFile[];
  createdAt: string;
  updatedAt: string;
  steps: ClearanceStep[];
}