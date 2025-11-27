import axios from 'axios';

/**
 * Custom API Error class
 */
export class ApiError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public errorCode?: string,
        public field?: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Check if error is an Axios error
 */
export const isAxiosError = (error: unknown): error is axios.AxiosError => {
    return axios.isAxiosError(error);
};

/**
 * Extract user-friendly error message from various error types
 */
export const getErrorMessage = (error: unknown): string => {
    // Handle Axios errors
    if (isAxiosError(error)) {
        const response = error.response;

        // No response (network error)
        if (!response) {
            if (error.code === 'ECONNABORTED') {
                return 'Request timeout. Please check your connection and try again.';
            }
            if (error.code === 'ERR_NETWORK') {
                return 'Network error. Please check your internet connection.';
            }
            return 'Unable to connect to server. Please check your connection.';
        }

        // Handle different HTTP status codes
        const status = response.status;
        const data = response.data;

        switch (status) {
            case 400:
                // Validation errors
                if (data.errors && Array.isArray(data.errors)) {
                    return data.errors.map((err: any) => err.msg || err.message).join(', ');
                }
                return data.message || 'Invalid request. Please check your input.';

            case 401:
                return data.message || 'Session expired. Please login again.';

            case 403:
                return data.message || 'You do not have permission to perform this action.';

            case 404:
                return data.message || 'The requested resource was not found.';

            case 409:
                return data.message || 'This action conflicts with existing data.';

            case 422:
                return data.message || 'Validation failed. Please check your input.';

            case 429:
                const retryAfter = data.retryAfter || '15 minutes';
                return `Too many requests. Please try again after ${retryAfter}.`;

            case 500:
                return data.message || 'Server error. Please try again later.';

            case 502:
            case 503:
            case 504:
                return 'Server is temporarily unavailable. Please try again later.';

            default:
                return data.message || 'An unexpected error occurred. Please try again.';
        }
    }

    // Handle standard Error objects
    if (error instanceof Error) {
        return error.message;
    }

    // Handle string errors
    if (typeof error === 'string') {
        return error;
    }

    // Unknown error type
    return 'An unexpected error occurred. Please try again.';
};

/**
 * Log error to console in development
 */
export const logError = (error: unknown, context?: string) => {
    if (import.meta.env.DEV) {
        console.error(`[Error${context ? ` - ${context}` : ''}]:`, error);
        if (isAxiosError(error)) {
            console.error('Response:', error.response?.data);
            console.error('Status:', error.response?.status);
            console.error('Config:', error.config);
        }
    }
};

/**
 * Get error object with structured data
 */
export const parseError = (error: unknown): {
    message: string;
    statusCode?: number;
    errorCode?: string;
    field?: string;
} => {
    const message = getErrorMessage(error);

    if (isAxiosError(error)) {
        return {
            message,
            statusCode: error.response?.status,
            errorCode: error.response?.data?.errorCode,
            field: error.response?.data?.field
        };
    }

    return { message };
};
