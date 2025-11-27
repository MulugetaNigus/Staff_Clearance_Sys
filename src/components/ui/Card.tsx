import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface CardProps {
    children: React.ReactNode;
    variant?: 'default' | 'gradient' | 'glass' | 'elevated';
    className?: string;
    hover?: boolean;
    onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
    children,
    variant = 'default',
    className = '',
    hover = false,
    onClick
}) => {
    const baseStyles = 'rounded-2xl p-6 transition-all duration-300';

    const variantStyles = {
        default: 'bg-white shadow-md border border-gray-100',
        gradient: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg',
        glass: 'glass shadow-lg',
        elevated: 'bg-white shadow-xl'
    };

    const hoverStyles = hover ? 'hover:shadow-2xl hover:scale-[1.02] cursor-pointer' : '';
    const clickableStyles = onClick ? 'cursor-pointer' : '';

    return (
        <div
            className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${clickableStyles} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    variant?: 'blue' | 'purple' | 'teal' | 'amber' | 'emerald' | 'pink';
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon: Icon,
    variant = 'blue',
    trend
}) => {
    const gradients = {
        blue: 'from-blue-500 to-blue-600',
        purple: 'from-purple-500 to-purple-600',
        teal: 'from-teal-500 to-teal-600',
        amber: 'from-amber-500 to-amber-600',
        emerald: 'from-emerald-500 to-emerald-600',
        pink: 'from-pink-500 to-pink-600'
    };

    return (
        <div className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradients[variant]} p-4 md:p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300`}>
            {/* Background Icon */}
            <div className="absolute -right-4 -top-4 opacity-10">
                <Icon className="h-24 w-24 md:h-32 md:w-32" />
            </div>

            {/* Content */}
            <div className="relative">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                    <div className="p-2 md:p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                        <Icon className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-1 text-xs md:text-sm font-medium px-2 py-1 rounded-lg bg-white/20`}>
                            <span>{trend.isPositive ? '↑' : '↓'}</span>
                            <span>{Math.abs(trend.value)}%</span>
                        </div>
                    )}
                </div>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1 font-['Plus_Jakarta_Sans_Variable'] break-words">{value}</h3>
                <p className="text-white/80 text-xs md:text-sm font-medium leading-tight break-words">{title}</p>
            </div>
        </div>
    );
};

export default Card;
