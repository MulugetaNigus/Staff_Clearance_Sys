
import API from './api';

// ... (existing interfaces)
export interface CreateUserData {
  name: string;
  email: string;
  role: string;
  department: string;
  contactInfo: string;
}

// Define the shape of the user data returned from the API
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  contactInfo: string;
  username: string;
  isActive: boolean;
  profilePicture?: string;
}

// Define the shape of the credentials returned upon user creation
export interface UserCredentials {
  username: string;
  password: string;
}

// Define the shape of the successful user creation response
export interface CreateUserSuccessResponse {
  success: true;
  message: string;
  data: {
    user: User;
    credentials: UserCredentials;
  };
}

// Define the shape of a failed API response
export interface ErrorResponse {
  success: false;
  message: string;
  error?: any;
}

// Type guard to check for a successful user creation
type CreateUserResponse = CreateUserSuccessResponse | ErrorResponse;


export const userService = {
  createUser: async (userData: CreateUserData): Promise<CreateUserResponse> => {
    try {
      const response = await API.post('/users/create', userData);
      return response.data;
    } catch (error: any) {
      return error.response?.data || { success: false, message: 'An unknown error occurred' };
    }
  },

  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await API.get('/users/all');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return [];
    }
  },

  updateUser: async (userId: string, updates: Partial<User>, profileImage?: File | null): Promise<User> => {
    try {
      const formData = new FormData();
      Object.entries(updates).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (profileImage) {
        formData.append('profilePicture', profileImage);
      }

      const response = await API.put(`/users/profile`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data) {
        return response.data;
      } else {
        throw new Error('Failed to retrieve updated user data.');
      }
    } catch (error: any) {
      console.error(`Failed to update user ${userId}:`, error);
      throw error; // Re-throw the error to be caught by the component
    }
  },

  changePassword: async (userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await API.post(`/users/change-password`, { userId, currentPassword, newPassword });
      return response.data;
    } catch (error: any) {
      return error.response?.data || { success: false, message: 'An error occurred' };
    }
  },

  deleteUser: async (userId: string): Promise<boolean> => {
    try {
      await API.delete(`/users/${userId}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete user ${userId}:`, error);
      return false;
    }
  },

  resetUserPassword: async (userId: string): Promise<{ success: boolean; newPassword?: string }> => {
    try {
        const response = await API.post(`/users/${userId}/reset-password`);
        return { ...response.data, success: true };
    } catch (error) {
        console.error(`Failed to reset password for user ${userId}:`, error);
        return { success: false };
    }
  },

  toggleUserStatus: async (userId: string): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await API.patch(`/users/${userId}/toggle-status`);
        return { ...response.data, success: true };
    } catch (error) {
        console.error(`Failed to toggle status for user ${userId}:`, error);
        return { success: false };
    }
  },

  forgotPassword: async (email: string): Promise<{ success: boolean; message?: string; resetUrl?: string; }> => {
    try {
      const response = await API.post('/auth/forgot-password', { email });
      return { ...response.data, success: true };
    } catch (error: any) {
      console.error('Forgot password request failed:', error);
      return { success: false, message: error.response?.data?.message || 'An error occurred' };
    }
  },

  resetPassword: async (token: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await API.put(`/auth/reset-password/${token}`, { password });
      return { ...response.data, success: true };
    } catch (error: any) {
      console.error('Reset password request failed:', error);
      return { success: false, message: error.response?.data?.message || 'An error occurred' };
    }
  },
};