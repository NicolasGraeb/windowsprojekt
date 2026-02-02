'use client';

import React, { useState, useRef, useEffect } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = 'Szukaj...' }: SearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleClick = () => {
    setIsExpanded(true);
  };

  const handleBlur = () => {
    if (!searchQuery) {
      setIsExpanded(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  const handleClose = () => {
    setSearchQuery('');
    setIsExpanded(false);
    onSearch('');
  };

  return (
    <div className="relative">
      {!isExpanded ? (
        <button
          onClick={handleClick}
          className="flex items-center gap-3 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-xl text-gray-600 hover:bg-white/80 transition-all duration-300 border-2 border-transparent hover:border-purple-300"
        >
          <span className="text-lg">🔍</span>
          <span className="font-medium">Szukaj</span>
        </button>
      ) : (
        <div
          className="flex items-center gap-2 bg-white/80 backdrop-blur-md rounded-xl border-2 border-purple-500 shadow-lg transition-all duration-300"
          style={{ 
            width: '300px',
            animation: 'expandSearch 0.3s ease-out'
          }}
        >
          <span className="text-lg text-purple-600 pl-4">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="flex-1 py-2 bg-transparent outline-none text-gray-800 placeholder-gray-400 font-medium"
          />
          {searchQuery && (
            <button
              onClick={handleClose}
              className="px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      )}
    </div>
  );
}

