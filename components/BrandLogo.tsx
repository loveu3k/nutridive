'use client';

import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function BrandLogo({ size = 'md', className = '' }: BrandLogoProps) {
  const sizeClasses = {
    sm: 'w-7 h-7 rounded-lg text-sm',
    md: 'w-9 h-9 rounded-xl text-base',
    lg: 'w-11 h-11 rounded-2xl text-xl',
  };

  return (
    <div
      className={`relative flex items-center justify-center font-bold tracking-tight select-none bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 text-white shadow-md shadow-teal-600/20 group-hover:shadow-teal-600/30 group-hover:scale-105 transition-all duration-200 border border-teal-400/30 ${sizeClasses[size]} ${className}`}
      aria-hidden="true"
    >
      {/* Precision single-letter glyph 'N' */}
      <span className="font-extrabold font-sans leading-none transform translate-y-[-0.5px]">
        N
      </span>

      {/* Subtle health verification indicator dot */}
      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-teal-200 dark:bg-teal-300 ring-1 ring-teal-700/60 shadow-2xs" />
    </div>
  );
}
