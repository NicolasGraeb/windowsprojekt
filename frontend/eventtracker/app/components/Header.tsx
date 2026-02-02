'use client';

import React from 'react';
import { SearchBar } from './SearchBar';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './Button';

interface HeaderProps {
  title: string;
  onSearch?: (query: string) => void;
  onProfileClick?: () => void;
}

export function Header({ title, onSearch, onProfileClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : 'U';

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b-2 border-gray-200 sticky top-0 z-30">
      <div className="px-8 py-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          {title}
          <span className="text-2xl">👋</span>
        </h1>
        <div className="flex items-center gap-4">
          {onSearch && <SearchBar onSearch={onSearch} />}
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm text-gray-600">
                {user.firstName} {user.lastName}
              </span>
            )}
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:scale-110 transition-transform">
              🔔
            </div>
            <button
              onClick={onProfileClick}
              className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:scale-110 transition-transform"
              title={user ? `${user.firstName} ${user.lastName}` : 'Profil'}
            >
              {initials}
            </button>
            <Button variant="ghost" size="sm" onClick={logout}>
              Wyloguj
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

