import API from './api';

export const signatureService = {
  // Fetch all signatures for a specific clearance request
  getSignaturesForRequest: async (requestId: string) => {
    try {
      const response = await API.get(`/clearance/requests/${requestId}/signatures`);
      return response.data;
    } catch (error) {
      console.error('Error fetching signatures for request:', error);
      return { signatures: [], success: false };
    }
  },

  // Fetch all available signatures from completed clearance steps (for sample PDF)
  getAllAvailableSignatures: async () => {
    try {
      const response = await API.get('/clearance/signatures/available');
      return response.data;
    } catch (error) {
      console.error('Error fetching available signatures:', error);
      return { signatures: [], success: false };
    }
  },

  // Get signature by department role
  getSignatureByRole: async (reviewerRole: string) => {
    try {
      const response = await API.get(`/clearance/signatures/role/${reviewerRole}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching signature for role ${reviewerRole}:`, error);
      return { signature: null, success: false };
    }
  }
};
