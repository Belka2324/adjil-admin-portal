import { useEffect, useState, useCallback } from 'react';
import {
  syncAllAdjilUsers,
  syncAdjilUsersByIds,
  getAllSyncedAdjilUsers,
  listenToSyncedUsers,
  mapAdjilUserToAdminUser,
  isAdjilAdminUser,
  isAdjilPartnerUser,
} from '@/services/sync.service';
import { AppUser } from '@/types';

interface UseSyncAdjilUsersOptions {
  autoSync?: boolean;
  syncInterval?: number; // in milliseconds
}

interface UseSyncAdjilUsersReturn {
  syncedUsers: AppUser[];
  loading: boolean;
  error: string | null;
  syncAll: (signal?: AbortSignal) => Promise<{ syncedCount: number }>;
  syncSpecific: (userIds: string[]) => Promise<void>;
  isAdmin: (user: AppUser) => boolean;
  isPartner: (user: AppUser) => boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook for managing Adjil.BNPL user synchronization
 */
export function useSyncAdjilUsers(
  options: UseSyncAdjilUsersOptions = {}
): UseSyncAdjilUsersReturn {
  const { autoSync = false, syncInterval = 5 * 60 * 1000 } = options; // 5 minutes default
  
  const [syncedUsers, setSyncedUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSyncedUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const users = await getAllSyncedAdjilUsers();
      const appUsers = users.map(mapAdjilUserToAdminUser);
      setSyncedUsers(appUsers);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch synced users';
      setError(message);
      console.error('Fetch synced users error:', message);
    } finally {
      setLoading(false);
    }
  }, []);

  const syncAll = useCallback(async (signal?: AbortSignal): Promise<{ syncedCount: number }> => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if aborted
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }
      
      const result = await syncAllAdjilUsers();
      
      if (!result.success) {
        throw new Error(result.error || 'Sync failed');
      }

      await fetchSyncedUsers();
      
      return { syncedCount: result.syncedCount };
    } catch (err) {
      // Don't set error for aborted requests
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw err;
      }
      
      const message = err instanceof Error ? err.message : 'Sync failed';
      setError(message);
      console.error('Sync all error:', message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSyncedUsers]);

  const syncSpecific = useCallback(async (userIds: string[]) => {
    try {
      setLoading(true);
      setError(null);
      const result = await syncAdjilUsersByIds(userIds);
      
      if (!result.success) {
        throw new Error(result.error || 'Sync failed');
      }

      await fetchSyncedUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sync failed';
      setError(message);
      console.error('Sync specific error:', message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSyncedUsers]);

  const isAdmin = useCallback(
    (user: AppUser) => user.role === 'admin',
    []
  );

  const isPartner = useCallback(
    (user: AppUser) => user.role === 'partner',
    []
  );

  // Setup real-time listener
  useEffect(() => {
    const unsubscribe = listenToSyncedUsers((payload) => {
      console.log('Real-time sync update received:', payload);
      fetchSyncedUsers();
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [fetchSyncedUsers]);

  // Setup auto-sync interval
  useEffect(() => {
    if (!autoSync) return;

    const interval = setInterval(() => {
      syncAll().catch(console.error);
    }, syncInterval);

    return () => clearInterval(interval);
  }, [autoSync, syncInterval, syncAll]);

  // Initial fetch
  useEffect(() => {
    fetchSyncedUsers();
  }, [fetchSyncedUsers]);

  return {
    syncedUsers,
    loading,
    error,
    syncAll,
    syncSpecific,
    isAdmin,
    isPartner,
    refetch: fetchSyncedUsers,
  };
}
