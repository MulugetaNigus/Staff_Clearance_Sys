export interface ClearanceStep {
  id: string;
  requestId: any;
  department: string;
  status: 'pending' | 'cleared' | 'issue';
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClearanceRequest {
  _id: string;
  referenceCode: string;
  initiatedBy: {
    _id: string;
    name: string;
  };
  purpose: string;
  status: 'pending_hr_review' | 'pending_vp_approval' | 'in_progress' | 'cleared' | 'rejected';
  createdAt: string;
  updatedAt: string;
  steps: ClearanceStep[];
}