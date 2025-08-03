import toast from 'react-hot-toast';

// Custom toast utilities for consistent styling and messaging across the app

export const toastUtils = {
  // Success toasts
  success: (message: string, options?: any) => {
    return toast.success(message, {
      icon: '🎉',
      duration: 3000,
      style: {
        background: '#10B981', // green-500
        color: '#fff',
        fontWeight: '500',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#10B981',
      },
      ...options,
    });
  },

  // Error toasts
  error: (message: string, options?: any) => {
    return toast.error(message, {
      icon: '❌',
      duration: 5000,
      style: {
        background: '#EF4444', // red-500
        color: '#fff',
        fontWeight: '500',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#EF4444',
      },
      ...options,
    });
  },

  // Loading toasts
  loading: (message: string, options?: any) => {
    return toast.loading(message, {
      style: {
        background: '#3B82F6', // blue-500
        color: '#fff',
        fontWeight: '500',
      },
      ...options,
    });
  },

  // Info toasts
  info: (message: string, options?: any) => {
    return toast(message, {
      icon: 'ℹ️',
      duration: 4000,
      style: {
        background: '#6366F1', // indigo-500
        color: '#fff',
        fontWeight: '500',
      },
      ...options,
    });
  },

  // Warning toasts
  warning: (message: string, options?: any) => {
    return toast(message, {
      icon: '⚠️',
      duration: 4000,
      style: {
        background: '#F59E0B', // amber-500
        color: '#fff',
        fontWeight: '500',
      },
      ...options,
    });
  },

  // Authentication related toasts
  auth: {
    loginSuccess: (userName?: string) => {
      const message = userName ? `Welcome back, ${userName}!` : 'Welcome back! Login successful';
      return toast.success(message, {
        icon: '👋',
        duration: 3000,
        style: {
          background: '#10B981',
          color: '#fff',
          fontWeight: '500',
        },
      });
    },

    loginError: () => {
      return toast.error('Invalid username or password. Please try again.', {
        icon: '🔒',
        duration: 4000,
        style: {
          background: '#EF4444',
          color: '#fff',
          fontWeight: '500',
        },
      });
    },

    logoutSuccess: () => {
      return toast.success('Successfully logged out', {
        icon: '👋',
        duration: 2000,
        style: {
          background: '#10B981',
          color: '#fff',
          fontWeight: '500',
        },
      });
    },
  },

  // Clearance related toasts
  clearance: {
    submitSuccess: (message?: string) => {
      return toast.success(message || 'Clearance request submitted successfully!', {
        icon: '🎉',
        duration: 4000,
        style: {
          background: '#10B981',
          color: '#fff',
          fontWeight: '500',
        },
      });
    },

    submitError: (message?: string) => {
      return toast.error(message || 'Failed to submit clearance request. Please try again.', {
        icon: '❌',
        duration: 6000,
        style: {
          background: '#EF4444',
          color: '#fff',
          fontWeight: '500',
        },
      });
    },

    approvalSuccess: () => {
      return toast.success('Clearance step approved successfully!', {
        icon: '✅',
        duration: 3000,
        style: {
          background: '#10B981',
          color: '#fff',
          fontWeight: '500',
        },
      });
    },

    rejectionSuccess: () => {
      return toast.success('Clearance step rejected successfully!', {
        icon: '❌',
        duration: 3000,
        style: {
          background: '#F59E0B', // amber-500 for rejection (warning style)
          color: '#fff',
          fontWeight: '500',
        },
      });
    },

    updateError: (message?: string) => {
      return toast.error(message || 'Failed to update clearance step.', {
        icon: '❌',
        duration: 5000,
        style: {
          background: '#EF4444',
          color: '#fff',
          fontWeight: '500',
        },
      });
    },
  },

  // Form related toasts
  form: {
    validationError: (message: string) => {
      return toast.error(message, {
        icon: '⚠️',
        duration: 4000,
        style: {
          background: '#F59E0B',
          color: '#fff',
          fontWeight: '500',
        },
      });
    },

    saveSuccess: (itemName?: string) => {
      const message = itemName ? `${itemName} saved successfully!` : 'Changes saved successfully!';
      return toast.success(message, {
        icon: '💾',
        duration: 3000,
        style: {
          background: '#10B981',
          color: '#fff',
          fontWeight: '500',
        },
      });
    },

    deleteSuccess: (itemName?: string) => {
      const message = itemName ? `${itemName} deleted successfully!` : 'Item deleted successfully!';
      return toast.success(message, {
        icon: '🗑️',
        duration: 3000,
        style: {
          background: '#EF4444',
          color: '#fff',
          fontWeight: '500',
        },
      });
    },
  },

  // API related toasts
  api: {
    networkError: () => {
      return toast.error('Network error. Please check your connection and try again.', {
        icon: '🌐',
        duration: 6000,
        style: {
          background: '#EF4444',
          color: '#fff',
          fontWeight: '500',
        },
      });
    },

    serverError: () => {
      return toast.error('Server error. Please try again later.', {
        icon: '🔧',
        duration: 5000,
        style: {
          background: '#EF4444',
          color: '#fff',
          fontWeight: '500',
        },
      });
    },

    unauthorized: () => {
      return toast.error('Your session has expired. Please log in again.', {
        icon: '🔐',
        duration: 5000,
        style: {
          background: '#EF4444',
          color: '#fff',
          fontWeight: '500',
        },
      });
    },
  },

  // Utility functions
  dismiss: (toastId?: string) => {
    return toast.dismiss(toastId);
  },

  dismissAll: () => {
    return toast.dismiss();
  },

  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: any
  ) => {
    return toast.promise(promise, messages, {
      style: {
        background: '#363636',
        color: '#fff',
        fontWeight: '500',
      },
      ...options,
    });
  },
};

export default toastUtils;
