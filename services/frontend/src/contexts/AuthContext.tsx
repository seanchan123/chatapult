// src/contexts/AuthContext.tsx
'use client';

import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import React, { createContext, useState, useEffect } from 'react';

interface UserData {
  username: string;
  token: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  login: (token: string, username: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserData | null>(null);
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    const token = Cookies.get('authToken');
    const username = Cookies.get('username');
    if (token && username) {
      setIsAuthenticated(true);
      setUser({ token, username });
    }
  }, []);

  const login = (token: string, username: string) => {
    // Store JWT token and username in cookies
    Cookies.set('authToken', token, { expires: 1 });
    Cookies.set('username', username, { expires: 1 });
    setIsAuthenticated(true);
    setUser({ token, username });
    router.push('/dashboard');
  };

  const logout = () => {
    // Remove token and username from cookies
    Cookies.remove('authToken');
    Cookies.remove('username');
    setIsAuthenticated(false);
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
