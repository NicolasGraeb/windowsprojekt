'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeJwtToken(token: string): Record<string, any> | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Błąd dekodowania tokena:', error);
    return null;
  }
}

function isTokenValid(token: string): boolean {
  const decoded = decodeJwtToken(token);
  if (!decoded || !decoded.exp) return false;
  
  const expirationTime = decoded.exp * 1000; // exp jest w sekundach
  return Date.now() < expirationTime;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserFromToken = () => {
      try {
        const token = apiService.getToken();
        if (token && isTokenValid(token)) {
          const decoded = decodeJwtToken(token);
          if (decoded) {
            const userId = decoded.UserId || 
                          decoded.userId || 
                          decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
                          decoded['nameidentifier'];
            
            const email = decoded.email || 
                         decoded.Email ||
                         decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
                         decoded['emailaddress'];
            
            const name = decoded.name || 
                        decoded.Name ||
                        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
            
            if (userId) {
              const nameParts = name?.split(' ') || [];
              const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;
              
              if (!isNaN(userIdNum)) {
                setUser({
                  id: userIdNum,
                  email: email || '',
                  firstName: nameParts[0] || '',
                  lastName: nameParts.slice(1).join(' ') || '',
                });
              }
            }
          }
        } else if (token && !isTokenValid(token)) {
          apiService.logout();
        }
      } catch (error) {
        console.error('Błąd podczas wczytywania użytkownika:', error);
        apiService.logout();
      } finally {
        setLoading(false);
      }
    };

    loadUserFromToken();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiService.login(email, password);
    setUser(response.user);
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    const response = await apiService.register(email, password, firstName, lastName);
    setUser(response.user);
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
