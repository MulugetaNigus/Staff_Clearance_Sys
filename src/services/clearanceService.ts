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

  approveInitialRequest: async (id: string) => {
    const response = await API.put(`/clearance/requests/${id}/approve-initial`);
    return response.data;
  },

  rejectInitialRequest: async (id: string, rejectionReason: string) => {
    const response = await API.put(`/clearance/requests/${id}/reject-initial`, { rejectionReason });
    return response.data;
  },

  updateClearanceStep: async (stepId: string, data: { status: 'cleared' | 'issue' | 'pending'; comment?: string }) => {
    const response = await API.put(`/clearance/steps/${stepId}`, data);
    return response.data;
  },

  getMyReviewSteps: async () => {
    const response = await API.get('/clearance/steps/my-reviews');
    return response.data;
  },
// };

  approveFinalRequest: async (id: string) => {
    const response = await API.put(`/clearance/requests/${id}/approve-final`);
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
};