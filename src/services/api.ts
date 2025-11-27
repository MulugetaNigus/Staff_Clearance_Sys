import axios from 'axios';

// Create axios instance with base configuration
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url: string | undefined = error.config?.url;

    if (status === 401) {
      // Allow the auth bootstrap to handle 401 from /auth/me without a hard redirect
      if (url && url.includes('/auth/me')) {
        return Promise.reject(error);
      }

      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return; // stop further processing
    }
    return Promise.reject(error);
  }
);

export default API;
