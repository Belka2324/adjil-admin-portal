'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppUser, UserRole } from '@/types';
import {
  createUser,
  findUserById,
  verifyUserCredentials,
  verifySession,
  createSession,
  deleteSession,
} from '@/services/localStorage.service';

interface LocalAuthContextType {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, phoneNumber: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isDemoMode: boolean;
}

const LocalAuthContext = createContext<LocalAuthContextType | undefined>(undefined);

export const LocalAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    // Check for existing session in localStorage
    const sessionUserId = localStorage.getItem('adjil_session_user_id');
    const sessionToken = localStorage.getItem('adjil_session_token');

    if (sessionUserId && sessionToken) {
      // Verify session is valid
      if (verifySession(sessionUserId)) {
        const profile = findUserById(sessionUserId);
        if (profile) {
          setUser(profile);
        }
      }
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const user = verifyUserCredentials(email, password);

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Create session
      const sessionToken = createSession(user.id);

      // Store session in localStorage
      localStorage.setItem('adjil_session_user_id', user.id);
      localStorage.setItem('adjil_session_token', sessionToken);

      setUser(user);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    password: string,
    role: 'admin' | 'partner' | 'support' = 'support'
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Create new user with specified role
      const newUser = createUser(
        firstName, 
        lastName, 
        email, 
        phoneNumber, 
        password, 
        role as any  // Cast to any to handle UserRole enum vs string type
      );

      if (!newUser) {
        throw new Error('User creation failed');
      }

      // Auto-login after registration
      const sessionToken = createSession(newUser.id);
      localStorage.setItem('adjil_session_user_id', newUser.id);
      localStorage.setItem('adjil_session_token', sessionToken);

      setUser(newUser);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);

      if (user) {
        deleteSession(user.id);
      }

      localStorage.removeItem('adjil_session_user_id');
      localStorage.removeItem('adjil_session_token');
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalAuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isDemoMode,
      }}
    >
      {children}
    </LocalAuthContext.Provider>
  );
};

export const useLocalAuth = () => {
  const context = useContext(LocalAuthContext);
  if (context === undefined) {
    throw new Error('useLocalAuth must be used within a LocalAuthProvider');
  }
  return context;
};
