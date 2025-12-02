import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://staffclearancesys.onrender.com/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const notificationService = {
    getMyNotifications: async () => {
        const response = await api.get('/notifications/my-notifications');
        return response.data;
    },

    markAsRead: async (notificationId: string) => {
        const response = await api.patch(`/notifications/${notificationId}/read`);
        return response.data;
    },

    markAllAsRead: async () => {
        const response = await api.patch('/notifications/mark-all-read');
        return response.data;
    },
};
