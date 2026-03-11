import { supabase } from '@/lib/supabase';
import { AppUser, UserRole } from '@/types';

/**
 * Sync service for integrating Adjil.BNPL users with Admin Portal
 */

interface AdjilUser {
  id: string;
  email: string;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  name?: string;
  phoneNumber?: string;
  phone_number?: string;
  role?: string;
  adjilRole?: string;
  adjil_role?: string;
  isActive?: boolean;
  is_active?: boolean;
  createdAt?: string;
  created_at?: string;
  [key: string]: any;
}

interface SyncedUserMapping {
  adjilUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  phoneNumber: string;
  role: UserRole;
  isActive: boolean;
  adjilRole: string;
  adjilData: AdjilUser;
  lastSyncedAt: string;
}

/**
 * Fetch and sync all active Adjil.BNPL users to Admin Portal
 */
export async function syncAllAdjilUsers(): Promise<{
  success: boolean;
  syncedCount: number;
  error?: string;
}> {
  try {
    const response = await fetch('/api/sync/adjil-users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        syncedCount: 0,
        error: errorData.error || 'Failed to sync users',
      };
    }

    const data = await response.json();
    return {
      success: true,
      syncedCount: data.totalUsers || 0,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sync failed';
    console.error('Sync all users error:', message);
    return {
      success: false,
      syncedCount: 0,
      error: message,
    };
  }
}

/**
 * Sync specific users by ID
 */
export async function syncAdjilUsersByIds(userIds: string[]): Promise<{
  success: boolean;
  syncedCount: number;
  error?: string;
}> {
  try {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return {
        success: false,
        syncedCount: 0,
        error: 'userIds must be a non-empty array',
      };
    }

    const response = await fetch('/api/sync/adjil-users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userIds }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        syncedCount: 0,
        error: errorData.error || 'Failed to sync users',
      };
    }

    const data = await response.json();
    return {
      success: true,
      syncedCount: data.syncedCount || 0,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sync failed';
    console.error('Sync users by ID error:', message);
    return {
      success: false,
      syncedCount: 0,
      error: message,
    };
  }
}

/**
 * Get synced user mapping by email
 */
export async function getSyncedUserByEmail(email: string): Promise<SyncedUserMapping | null> {
  try {
    const { data, error } = await supabase
      .from('admin_user_sync')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Get synced user error:', error);
      return null;
    }

    return data as SyncedUserMapping;
  } catch (error) {
    console.error('Get synced user error:', error);
    return null;
  }
}

/**
 * Get all synced users
 */
export async function getAllSyncedAdjilUsers(): Promise<SyncedUserMapping[]> {
  try {
    const { data, error } = await supabase
      .from('admin_user_sync')
      .select('*')
      .order('lastSyncedAt', { ascending: false });

    if (error) {
      console.error('Get synced users error:', error);
      return [];
    }

    return (data || []) as SyncedUserMapping[];
  } catch (error) {
    console.error('Get synced users error:', error);
    return [];
  }
}

/**
 * Listen to real-time synced user changes
 */
export function listenToSyncedUsers(
  callback: (payload: any) => void
): (() => void) | null {
  try {
    const subscription = supabase
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_user_sync',
        },
        callback
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  } catch (error) {
    console.error('Listen to synced users error:', error);
    return null;
  }
}

/**
 * Map Adjil user to Admin portal user format
 */
export function mapAdjilUserToAdminUser(syncedUser: SyncedUserMapping): AppUser {
  return {
    id: syncedUser.adjilUserId,
    email: syncedUser.email,
    firstName: syncedUser.firstName,
    lastName: syncedUser.lastName,
    name: syncedUser.name,
    phoneNumber: syncedUser.phoneNumber,
    role: syncedUser.role as UserRole,
    isActive: syncedUser.isActive,
    createdAt: syncedUser.lastSyncedAt,
    updatedAt: syncedUser.lastSyncedAt,
  };
}

/**
 * Check if user from Adjil.BNPL has admin role
 */
export function isAdjilAdminUser(syncedUser: SyncedUserMapping): boolean {
  return (
    syncedUser.adjilRole === 'admin' ||
    syncedUser.adjilRole === 'super_admin' ||
    syncedUser.role === UserRole.ADMIN
  );
}

/**
 * Check if user from Adjil.BNPL has partner role
 */
export function isAdjilPartnerUser(syncedUser: SyncedUserMapping): boolean {
  return (
    syncedUser.adjilRole === 'partner' ||
    syncedUser.adjilRole === 'bank_partner' ||
    syncedUser.role === UserRole.PARTNER
  );
}
