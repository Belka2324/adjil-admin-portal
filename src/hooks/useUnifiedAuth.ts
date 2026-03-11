/**
 * Unified Auth Hook
 * Automatically switches between Local (localStorage) and Supabase auth
 * based on environment configuration
 */

import { useAuth } from '@/lib/auth-context';
import { useLocalAuth } from '@/lib/local-auth-context';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export type AuthMode = 'supabase' | 'local';

export function useUnifiedAuth() {
  const [mode, setMode] = useState<AuthMode>('local');
  
  // Get both auth implementations - useLocalAuth is required now since LocalAuthProvider wraps the app
  const supabaseAuth = useAuth();
  const localAuth = useLocalAuth();

  useEffect(() => {
    // Determine which auth mode to use
    if (typeof window !== 'undefined') {
      const forceLocal = localStorage.getItem('force_local_auth') === 'true';
      
      if (forceLocal || !isSupabaseConfigured()) {
        setMode('local');
      } else {
        setMode('supabase');
      }
    }
  }, []);

  // Return the appropriate auth context with unified interface
  const auth = mode === 'local' ? localAuth : supabaseAuth;

  // Create a unified register function that handles both modes
  const unifiedRegister = async (
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    password: string,
    role?: 'admin' | 'partner' | 'support'
  ) => {
    if (mode === 'local' && role) {
      // Local auth supports role parameter
      return (localAuth as any).register(firstName, lastName, email, phoneNumber, password, role);
    } else {
      // Supabase auth doesn't use role in register, use default register
      return auth.register(firstName, lastName, email, phoneNumber, password);
    }
  };

  return {
    ...auth,
    register: unifiedRegister,
    mode,
    isDemoMode: mode === 'local',
    switchMode: (newMode: AuthMode) => {
      localStorage.setItem('force_local_auth', newMode === 'local' ? 'true' : 'false');
      setMode(newMode);
      window.location.reload();
    },
  };
}
