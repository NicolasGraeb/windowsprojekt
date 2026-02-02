import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}: ButtonProps) {
  const baseStyles = 'font-semibold transition-all duration-150 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden rounded-xl';
  
  const variants = {
    primary: 'bg-transparent text-purple-700 hover:text-purple-800 active:scale-95 border-2 border-purple-500 hover:border-purple-600 hover:bg-purple-50/50',
    secondary: 'bg-transparent text-gray-900 hover:bg-purple-50/50 active:scale-95 border-2 border-purple-500 text-purple-700 hover:text-purple-800',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:scale-95 shadow-lg',
    ghost: 'bg-transparent text-purple-700 hover:bg-purple-50/50 active:scale-95 border-2 border-purple-500 hover:border-purple-600'
  };
  
  const sizes = {
    sm: 'px-4 py-1.5 text-xs uppercase tracking-wider',
    md: 'px-6 py-2.5 text-sm uppercase tracking-wider',
    lg: 'px-8 py-3.5 text-base uppercase tracking-wider'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
}

