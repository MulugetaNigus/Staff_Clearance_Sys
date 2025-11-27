import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: LucideIcon;
    iconPosition?: 'left' | 'right';
    helperText?: string;
}

const Input: React.FC<InputProps> = ({
    label,
    error,
    icon: Icon,
    iconPosition = 'left',
    helperText,
    className = '',
    ...props
}) => {
    const hasIcon = Boolean(Icon);
    const paddingLeft = hasIcon && iconPosition === 'left' ? 'pl-11' : 'pl-4';
    const paddingRight = hasIcon && iconPosition === 'right' ? 'pr-11' : 'pr-4';

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                </label>
            )}

            <div className="relative">
                {Icon && iconPosition === 'left' && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Icon className="h-5 w-5 text-gray-400" />
                    </div>
                )}

                <input
                    className={`
            w-full ${paddingLeft} ${paddingRight} py-3
            bg-gray-50 border border-gray-200 rounded-xl
            text-gray-900 placeholder-gray-400
           focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
            outline-none transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}
            ${className}
          `}
                    {...props}
                />

                {Icon && iconPosition === 'right' && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Icon className="h-5 w-5 text-gray-400" />
                    </div>
                )}
            </div>

            {error && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                    <span>⚠️</span>
                    {error}
                </p>
            )}

            {helperText && !error && (
                <p className="mt-1.5 text-sm text-gray-500">
                    {helperText}
                </p>
            )}
        </div>
    );
};

export default Input;
