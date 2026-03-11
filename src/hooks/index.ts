'use client';

import { useState, useCallback } from 'react';

interface UseLoadingState {
  isLoading: boolean;
  error: Error | null;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
}

export const useLoadingState = (): UseLoadingState => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  return { isLoading, error, setLoading, setError };
};

// Custom hook for API calls with loading state
interface UseFetchOptions {
  immediate?: boolean;
}

export const useFetch = <T,>(
  fn: () => Promise<T>,
  options?: UseFetchOptions
) => {
  const [data, setData] = useState<T | null>(null);
  const { isLoading, error, setLoading, setError } = useLoadingState();

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fn();
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fn, setLoading, setError]);

  return { data, isLoading, error, execute };
};

// Custom hook for permission checking
import { useAuth } from '@/lib/auth-context';
import { hasPermission } from '@/config/rbac.config';

export const usePermission = () => {
  const { user } = useAuth();

  const can = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      return hasPermission(user.role, permission);
    },
    [user]
  );

  const canAny = useCallback(
    (permissions: string[]): boolean => {
      if (!user) return false;
      return permissions.some((p) => hasPermission(user.role, p));
    },
    [user]
  );

  const canAll = useCallback(
    (permissions: string[]): boolean => {
      if (!user) return false;
      return permissions.every((p) => hasPermission(user.role, p));
    },
    [user]
  );

  return { can, canAny, canAll, user };
};

// Custom hook for route protection
import { useRouter } from 'next/navigation';

export const useProtectedRoute = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  const requireAuth = useCallback(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const requireRole = useCallback(
    (allowedRoles: string[]) => {
      if (!loading && (!user || !allowedRoles.includes(user.role))) {
        router.push('/unauthorized');
      }
    },
    [user, loading, router]
  );

  return { requireAuth, requireRole, isAuthenticated: !!user, isLoading: loading };
};
