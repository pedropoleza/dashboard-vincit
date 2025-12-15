'use client';

import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
    size?: 'sm' | 'md';
    className?: string;
}

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
    const variantClasses = {
        default: 'bg-zinc-800 text-zinc-300 border-zinc-700',
        success: 'bg-emerald-900/30 text-emerald-400 border-emerald-800',
        warning: 'bg-amber-900/30 text-amber-400 border-amber-800',
        danger: 'bg-rose-900/30 text-rose-400 border-rose-800',
        info: 'bg-blue-900/30 text-blue-400 border-blue-800',
    };

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
    };

    return (
        <span
            className={clsx(
                'inline-flex items-center rounded-full border font-medium',
                variantClasses[variant],
                sizeClasses[size],
                className
            )}
        >
            {children}
        </span>
    );
}
