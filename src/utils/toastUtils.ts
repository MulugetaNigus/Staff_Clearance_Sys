import toast from 'react-hot-toast';

// Custom toast utilities for consistent styling and messaging across the app

// Helper function to extract error message from various error structures
const extractErrorMessage = (error: any): string => {
  // Handle axios error response
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  // Handle axios error response with errors array
  if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    return error.response.data.errors.join(', ');
  }

  // Handle standard Error object
  if (error?.message) {
    return error.message;
  }

  // Handle string error
  if (typeof error === 'string') {
    return error;
  }

  // Default fallback
  return 'An unexpected error occurred.';
};

// Helper function to get HTTP status code
const getStatusCode = (error: any): number | null => {
  return error?.response?.status || null;
};

// Helper function to determine error type based on status code
const getErrorType = (error: any): 'network' | 'auth' | 'validation' | 'permission' | 'notfound' | 'server' | 'unknown' => {
  // Network error (no response at all - connection failed)
  // Only treat as network error if there's explicitly no response AND it's a network code
  if (error?.code === 'ERR_NETWORK' && !error?.response) {
    return 'network';
  }

  const statusCode = getStatusCode(error);

  // If we have a status code, it's an HTTP error, not a network error
  if (statusCode) {
    if (statusCode === 401 || statusCode === 403) return 'auth';
    if (statusCode === 400) return 'validation';
    if (statusCode === 404) return 'notfound';
    if (statusCode >= 500) return 'server';
  }

  return 'unknown';
};

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

  // Error toasts - enhanced with better error extraction
  error: (error: any, options?: any) => {
    const message = extractErrorMessage(error);
    const errorType = getErrorType(error);

    // Use specific icon based on error type
    let icon = '❌';
    if (errorType === 'network') icon = '🌐';
    else if (errorType === 'auth') icon = '🔒';
    else if (errorType === 'validation') icon = '⚠️';
    else if (errorType === 'server') icon = '🔧';

    return toast.error(message, {
      icon,
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

    loginError: (error: any) => {
      const errorType = getErrorType(error);
      const statusCode = getStatusCode(error);
      const rawMessage = extractErrorMessage(error);

      // Determine specific error message
      let message = rawMessage;
      let icon = '🔒';

      // Network error
      if (errorType === 'network') {
        message = 'Unable to connect to server. Please check your internet connection.';
        icon = '🌐';
      }
      // Account deactivated (specific backend message)
      else if (rawMessage.toLowerCase().includes('deactivated')) {
        message = 'Your account has been deactivated. Please contact support for assistance.';
        icon = '🚫';
      }
      // Invalid credentials
      else if (statusCode === 401) {
        // Keep backend message for security (don't reveal if email exists)
        message = rawMessage;
      }
      // Missing fields
      else if (statusCode === 400) {
        message = rawMessage || 'Please provide both email and password.';
        icon = '⚠️';
      }
      // Server error
      else if (statusCode && statusCode >= 500) {
        message = 'Server error. Please try again later.';
        icon = '🔧';
      }

      return toast.error(message, {
        icon,
        duration: 5000,
        style: {
          background: '#EF4444',
          color: '#fff',
          fontWeight: '500',
        },
      });
    },

    passwordChangeSuccess: () => {
      return toast.success('Password changed successfully!', {
        icon: '✅',
        duration: 3000,
        style: {
          background: '#10B981',
          color: '#fff',
          fontWeight: '500',
        },
      });
    },

    passwordChangeError: (error: any) => {
      const message = extractErrorMessage(error);
      return toast.error(message, {
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
    submitSuccess: (referenceCode?: string) => {
      const message = referenceCode
        ? `Clearance request ${referenceCode} submitted successfully!`
        : 'Clearance request submitted successfully!';
      return toast.success(message, {
        icon: '🎉',
        duration: 4000,
        style: {
          background: '#10B981',
          color: '#fff',
          fontWeight: '500',
        },
      });
    },

    submitError: (error: any) => {
      const message = extractErrorMessage(error);
      const errorType = getErrorType(error);

      let icon = '❌';
      if (errorType === 'network') icon = '🌐';
      else if (errorType === 'validation') icon = '⚠️';

      return toast.error(message, {
        icon,
        duration: 6000,
        style: {
          background: '#EF4444',
          color: '#fff',
          fontWeight: '500',
        },
      });
    },

    stepUpdateSuccess: (stepName?: string, status?: string) => {
      let message = 'Step updated successfully!';

      if (stepName && status) {
        const statusText = status === 'cleared' ? 'cleared' : status === 'issue' ? 'flagged' : 'updated';
        message = `${stepName} step ${statusText} successfully!`;
      } else if (status === 'cleared') {
        message = 'Step cleared successfully!';
      } else if (status === 'issue') {
        message = 'Issue flagged successfully!';
      }

      return toast.success(message, {
        icon: status === 'cleared' ? '✅' : status === 'issue' ? '⚠️' : '🎉',
        duration: 3000,
        style: {
          background: '#10B981',
          color: '#fff',
          fontWeight: '500',
        },
      });
    },

    stepUpdateError: (error: any) => {
      const message = extractErrorMessage(error);
      const errorType = getErrorType(error);

      // Provide more specific icons
      let icon = '❌';
      if (message.toLowerCase().includes('permission')) icon = '🔒';
      else if (message.toLowerCase().includes('dependencies') || message.toLowerCase().includes('cannot be processed')) icon = '⏳';
      else if (errorType === 'network') icon = '🌐';

      return toast.error(message, {
        icon,
        duration: 5000,
        style: {
          background: '#EF4444',
          color: '#fff',
          fontWeight: '500',
        },
      });
    },

    hideStepSuccess: () => {
      return toast.success('Step hidden from your view', {
        icon: '👁️',
        duration: 2000,
        style: {
          background: '#10B981',
          color: '#fff',
          fontWeight: '500',
        },
      });
    },

    hideStepError: (error: any) => {
      const message = extractErrorMessage(error);
      return toast.error(message, {
        icon: '❌',
        duration: 4000,
        style: {
          background: '#EF4444',
          color: '#fff',
          fontWeight: '500',
        },
      });
    },

    vpApprovalSuccess: (type: 'initial' | 'final') => {
      const message = type === 'initial'
        ? 'Initial VP approval completed successfully!'
        : 'Final VP approval completed successfully!';
      return toast.success(message, {
        icon: '✅',
        duration: 3000,
        style: {
          background: '#10B981',
          color: '#fff',
          fontWeight: '500',
        },
      });
    },

    vpRejectionSuccess: () => {
      return toast.success('Request rejected successfully', {
        icon: '❌',
        duration: 3000,
        style: {
          background: '#F59E0B',
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
