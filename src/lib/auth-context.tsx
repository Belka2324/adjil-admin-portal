'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppUser, UserRole } from '@/types';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, phoneNumber: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only run auth checks if Supabase is properly configured
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setError('Supabase is not configured. Please check your environment variables.');
      setLoading(false);
      console.error('NEXT_PUBLIC_SUPABASE_URL is not set');
      return;
    }

    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        if (!supabase?.auth) {
          console.warn('Supabase auth not available');
          setLoading(false);
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          // Fetch full user profile from database
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id);

          if (error) throw error;
          
          if (data && data.length > 1) {
            console.warn('Multiple users found for id:', session.user.id, 'Using the first user.');
          }

          setUser(data && data.length > 0 ? data[0] as AppUser : null);
        }
      } catch (err) {
                const errorMessage = (err as any)?.message || JSON.stringify(err);
        console.error('Auth check failed:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Subscribe to auth changes
    if (supabase?.auth) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
                if (session?.user) {
          const { data, error } = await supabase.from('users').select('*').eq('id', session.user.id);
          
          if (error) {
            console.error('Error fetching user on auth state change:', error);
            setUser(null);
            return;
          }

          if (data && data.length > 1) {
            console.warn('Multiple users found for id:', session.user.id, 'Using the first user.');
          }

          setUser(data && data.length > 0 ? data[0] as AppUser : null);
        } else {
          setUser(null);
        }
      });

      return () => subscription?.unsubscribe();
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!supabase?.auth) {
        throw new Error('Authentication service not configured. Please check your Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY).');
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (firstName: string, lastName: string, email: string, phoneNumber: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!supabase?.auth) {
        throw new Error('Authentication service not configured. Please check your Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY).');
      }

      // Create Supabase auth user
      const { data: { user: authUser }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      if (!authUser) {
        throw new Error('User creation failed');
      }

      // Create user profile in the users table
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authUser.id,
          email,
          first_name: firstName,
          last_name: lastName,
          name: `${firstName} ${lastName}`,
          phone_number: phoneNumber,
          role: 'support', // Default role for new registrations
          status: 'active',
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;
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
      if (supabase?.auth) {
        await supabase.auth.signOut();
      }
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
