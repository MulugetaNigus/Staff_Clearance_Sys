import React from 'react';

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    message?: string;
    overlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'medium',
    message,
    overlay = false
}) => {
    const sizeClasses = {
        small: 'h-6 w-6',
        medium: 'h-12 w-12',
        large: 'h-16 w-16'
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-3">
            <div className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}></div>
            {message && (
                <p className="text-gray-700 font-medium text-sm">{message}</p>
            )}
        </div>
    );

    if (overlay) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 shadow-xl">
                    {spinner}
                </div>
            </div>
        );
    }

    return spinner;
};

export default LoadingSpinner;
