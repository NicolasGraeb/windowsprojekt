import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-gray-200 text-gray-800 border-gray-400',
    success: 'bg-green-100 text-green-900 border-green-400',
    warning: 'bg-yellow-100 text-yellow-900 border-yellow-400',
    danger: 'bg-red-100 text-red-900 border-red-400',
    info: 'bg-blue-100 text-blue-900 border-blue-400',
  };

  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 text-xs font-bold uppercase tracking-wide border-2
        ${variants[variant]} ${className}
      `}
    >
      {children}
    </span>
  );
}

