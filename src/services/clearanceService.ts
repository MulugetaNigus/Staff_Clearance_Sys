import API from './api';

export const clearanceService = {
  createClearanceRequest: async (data: FormData) => {
    const response = await API.post('/clearance/requests', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  approveInitialRequest: async (id: string, signature?: string) => {
    const response = await API.put(`/clearance/requests/${id}/approve-initial`, { signature });
    return response.data;
  },

  rejectInitialRequest: async (id: string, rejectionReason: string) => {
    const response = await API.put(`/clearance/requests/${id}/reject-initial`, { rejectionReason });
    return response.data;
  },

  updateClearanceStep: async (stepId: string, data: { status: 'cleared' | 'issue' | 'pending'; comment?: string; signature?: string }) => {
    const response = await API.put(`/clearance/steps/${stepId}`, data);
    return response.data;
  },

  getMyReviewSteps: async () => {
    const response = await API.get('/clearance/steps/my-reviews');
    return response.data;
  },

  getHRPendingRequests: async () => {
    const response = await API.get('/clearance/requests/hr-pending');
    return response.data;
  },

  approveFinalRequest: async (id: string, signature?: string) => {
    const response = await API.put(`/clearance/requests/${id}/approve-final`, { signature });
    return response.data;
  },

  rejectFinalRequest: async (id: string, rejectionReason: string) => {
    const response = await API.put(`/clearance/requests/${id}/reject-final`, { rejectionReason });
    return response.data;
  },

  getRequestsForVP: async () => {
    const response = await API.get('/clearance/requests/vp-review');
    return response.data;
  },

  getClearanceRequests: async () => {
    const response = await API.get('/clearance/requests');
    return response.data;
  },

  getClearanceRequestById: async (id: string) => {
    const response = await API.get(`/clearance/requests/${id}`);
    return response.data;
  },

  hrReviewRequest: async (id: string, action: 'approve' | 'reject', rejectionReason?: string, signature?: string) => {
    const response = await API.put(`/clearance/requests/${id}/hr-review`, { action, rejectionReason, signature });
    return response.data;
  },

  hideClearanceStep: async (stepId: string) => {
    const response = await API.put(`/clearance/steps/${stepId}/hide`);
    return response.data;
  },

  verifyClearanceRequest: async (referenceCode: string) => {
    const response = await API.get(`/certificate/verify/${referenceCode}`);
    return response.data;
  },

  getClearedAcademicStaffRequests: async () => {
    const response = await API.get('/clearance/requests/cleared-academic-staff');
    return response.data;
  },

  undoVPInitialDecision: async (id: string) => {
    const response = await API.put(`/clearance/requests/${id}/undo-initial`);
    return response.data;
  },

  undoVPFinalDecision: async (id: string) => {
    const response = await API.put(`/clearance/requests/${id}/undo-final`);
    return response.data;
  },
};