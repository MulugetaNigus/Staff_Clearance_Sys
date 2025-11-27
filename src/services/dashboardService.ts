
import API from './api';

export const dashboardService = {
  getDashboardData: async () => {
    try {
      const response = await API.get('/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },
  getRecentActivity: async () => {
    try {
      const response = await API.get('/dashboard/activity');
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  },
  getReportStats: async () => {
    try {
      const response = await API.get('/dashboard/reports');
      return response.data;
    } catch (error) {
      console.error('Error fetching report stats:', error);
      throw error;
    }
  },
};
