'use client';

import React from 'react';
import { clsx } from 'clsx';

interface AvatarProps {
    src?: string | null;
    name?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
    const initials = name
        ? name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : '?';

    const sizeClasses = {
        sm: 'w-9 h-9 text-xs',
        md: 'w-11 h-11 text-sm',
        lg: 'w-14 h-14 text-base',
    };

    const colors = [
        'from-blue-500 to-blue-600',
        'from-purple-500 to-purple-600',
        'from-emerald-500 to-emerald-600',
        'from-rose-500 to-rose-600',
        'from-amber-500 to-amber-600',
        'from-indigo-500 to-indigo-600',
    ];

    const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;
    const gradientColor = colors[colorIndex];

    if (src) {
        return (
            <img
                src={src}
                alt={name || 'User'}
                className={clsx(
                    'rounded-full object-cover border-2 border-white shadow-md',
                    sizeClasses[size],
                    className
                )}
            />
        );
    }

    return (
        <div
            className={clsx(
                'rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-br shadow-md border-2 border-white',
                sizeClasses[size],
                `bg-gradient-to-br ${gradientColor}`,
                className
            )}
        >
            {initials}
        </div>
    );
}
