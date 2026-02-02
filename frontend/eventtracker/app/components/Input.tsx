import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-3 bg-white border-2 transition-all
          text-gray-900 font-medium
          border-gray-400
          focus:outline-none focus:border-black focus:bg-gray-50
          ${error ? 'border-red-500 focus:border-red-600' : ''}
          ${className}
        `}
        style={{
          clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
        }}
        {...props}
      />
      {error && (
        <p className="mt-2 text-xs font-bold text-red-600 uppercase tracking-wide">{error}</p>
      )}
    </div>
  );
}

