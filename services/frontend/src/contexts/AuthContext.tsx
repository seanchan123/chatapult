// src/contexts/AuthContext.tsx
'use client';

import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import React, { createContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void; // Accept the JWT token on login
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
    const token = Cookies.get('authToken'); // Check if the token exists in cookies
    if (token) {
      setIsAuthenticated(true); // Set user as authenticated if token exists
    }
  }, []);

  const login = (token: string) => {
    // After successful login from backend, store the JWT token:
    Cookies.set('authToken', token, { expires: 1 }); // Store JWT token in cookies (1 day expiration)
    setIsAuthenticated(true);
    router.push('/dashboard');
  };

  const logout = () => {
    // Remove the JWT token from cookies on logout
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
