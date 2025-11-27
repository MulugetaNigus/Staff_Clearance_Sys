import { useState, useCallback } from 'react';
import { getErrorMessage, logError } from '../utils/errorHandler';
import { showToast } from '../utils/toastUtils';

/**
 * Hook for handling async operations with loading and error states
 */
export const useAsync = <T = any>() => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<T | null>(null);

    /**
     * Execute an async function with automatic error handling
     */
    const execute = useCallback(async (
        asyncFn: () => Promise<T>,
        options?: {
            onSuccess?: (data: T) => void;
            onError?: (error: unknown) => void;
            showErrorToast?: boolean;
            errorContext?: string;
        }
    ): Promise<T | null> => {
        setLoading(true);
        setError(null);

        try {
            const result = await asyncFn();
            setData(result);

            if (options?.onSuccess) {
                options.onSuccess(result);
            }

            return result;
        } catch (err) {
            const errorMsg = getErrorMessage(err);
            setError(errorMsg);

            // Log error in development
            logError(err, options?.errorContext);

            // Show toast notification by default
            if (options?.showErrorToast !== false) {
                showToast.error(errorMsg);
            }

            // Call custom error handler if provided
            if (options?.onError) {
                options.onError(err);
            }

            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Reset state
     */
    const reset = useCallback(() => {
        setLoading(false);
        setError(null);
        setData(null);
    }, []);

    return {
        loading,
        error,
        data,
        execute,
        reset
    };
};

/**
 * Simpler hook for just loading state
 */
export const useLoading = (initialState = false) => {
    const [loading, setLoading] = useState(initialState);

    const withLoading = useCallback(async <T,>(
        asyncFn: () => Promise<T>
    ): Promise<T> => {
        setLoading(true);
        try {
            const result = await asyncFn();
            return result;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        setLoading,
        withLoading
    };
};
