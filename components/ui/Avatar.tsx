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
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
    };

    const colors = [
        'bg-blue-600',
        'bg-purple-600',
        'bg-emerald-600',
        'bg-rose-600',
        'bg-amber-600',
        'bg-indigo-600',
    ];

    // Deterministic color based on name
    const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;
    const bgColor = colors[colorIndex];

    if (src) {
        return (
            <img
                src={src}
                alt={name || 'User'}
                className={clsx(
                    'rounded-full object-cover border-2 border-zinc-700',
                    sizeClasses[size],
                    className
                )}
            />
        );
    }

    return (
        <div
            className={clsx(
                'rounded-full flex items-center justify-center font-semibold text-white',
                sizeClasses[size],
                bgColor,
                className
            )}
        >
            {initials}
        </div>
    );
}
