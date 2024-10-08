// src/contexts/AuthContext.tsx
'use client';

import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import React, { createContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    const token = Cookies.get('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = () => {
    // After successful login:
    Cookies.set('authToken', 'login_token', { expires: 1 }); // Expires in 1 day
    setIsAuthenticated(true);
    router.push('/dashboard');
  };

  const logout = () => {
    // Implement your logout logic here (e.g., API call)
    Cookies.remove('authToken');
    setIsAuthenticated(false);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
