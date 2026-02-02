import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
}

export function Card({ children, className = '', hover = false, glass = false, ...props }: CardProps) {
  if (glass) {
    return (
      <div
        {...props}
        className={`
          bg-white/60 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg
          ${hover ? 'transition-all duration-200 hover:shadow-xl hover:scale-[1.02]' : ''}
          ${className}
        `}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      {...props}
      className={`
        bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl
        ${hover ? 'transition-all duration-200 hover:shadow-xl hover:border-gray-300' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

