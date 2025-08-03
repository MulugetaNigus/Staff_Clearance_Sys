import API from './api';

// Fetch admin dashboard statistics
export const getAdminDashboardStats = async () => {
  try {
    const response = await API.get('/admin/dashboard');
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// Add other admin-related API calls here

