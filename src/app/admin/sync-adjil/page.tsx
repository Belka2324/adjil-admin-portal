'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { Card } from '@/components/common/Cards';
import { useSyncAdjilUsers } from '@/hooks/useSyncAdjilUsers';
import { RefreshCw, CheckCircle, AlertCircle, Clock, Users } from 'lucide-react';

export default function AdjilSyncManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { syncedUsers, loading, error, syncAll } = useSyncAdjilUsers();
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncedCount, setSyncedCount] = useState<number>(0);

  // Protect route - only admins
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleSync = async () => {
    // Prevent multiple concurrent syncs
    if (syncInProgress) return;
    
    const abortController = new AbortController();
    
    try {
      setSyncInProgress(true);
      setSyncStatus('syncing');
      setSyncedCount(0);
      
      const result = await syncAll(abortController.signal);
      setSyncedCount(result.syncedCount);
      setSyncStatus('success');
      setLastSyncTime(new Date().toLocaleString());
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (err) {
      // Ignore abort errors
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      setSyncStatus('error');
      console.error('Sync error:', err);
      setTimeout(() => setSyncStatus('idle'), 5000);
    } finally {
      setSyncInProgress(false);
    }
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Adjil.BNPL User Synchronization
            </h1>
            <p className="text-gray-600 mt-2">
              Manage and monitor user data sync from Adjil.BNPL platform
            </p>
          </div>
        </div>

        {/* Sync Control Card */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Sync Status</h2>
              <p className="text-gray-600 mt-1">
                {lastSyncTime ? `Last synced: ${lastSyncTime}` : 'Never synced'}
              </p>
            </div>
            <button
              onClick={handleSync}
              disabled={syncInProgress || loading}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                syncInProgress || loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <RefreshCw
                size={20}
                className={syncInProgress ? 'animate-spin' : ''}
              />
              <span>{syncInProgress ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          </div>

          {/* Status Messages */}
          <div className="mt-6 space-y-3">
            {syncStatus === 'success' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
                <CheckCircle className="text-green-600" size={20} />
                <p className="text-green-700 font-medium">
                  Sync completed successfully! {syncedCount > 0 && `${syncedCount} users synced.`}
                </p>
              </div>
            )}

            {syncStatus === 'error' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
                <AlertCircle className="text-red-600" size={20} />
                <p className="text-red-700 font-medium">
                  Sync failed. Please try again.
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {syncedUsers.length}
                </p>
              </div>
              <Users className="text-blue-600" size={32} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Admin Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {syncedUsers.filter((u) => u.role === 'admin').length}
                </p>
              </div>
              <CheckCircle className="text-green-600" size={32} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Last Sync</p>
                <p className="text-gray-900 mt-2 text-sm">
                  {lastSyncTime || 'Never'}
                </p>
              </div>
              <Clock className="text-orange-600" size={32} />
            </div>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Synced Users
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {syncedUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No users synced yet. Click "Sync Now" to import users from
                      Adjil.BNPL
                    </td>
                  </tr>
                ) : (
                  syncedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.phone_number || user.phoneNumber || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : user.role === 'partner'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {(user.is_active ?? user.isActive) ? (
                          <span className="inline-flex items-center space-x-1 text-green-700">
                            <CheckCircle size={16} />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-gray-500">
                            <AlertCircle size={16} />
                            <span>Inactive</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Information Card */}
        <Card className="bg-blue-50 border border-blue-200">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-900">
              About This Sync
            </h3>
            <ul className="space-y-2 text-blue-800 text-sm">
              <li className="flex items-start space-x-3">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  This system syncs user data from Adjil.BNPL without modifying
                  the original platform
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  All synced data is stored in a separate mapping table for
                  safety
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  Real-time updates are enabled - changes in Adjil.BNPL are
                  automatically reflected
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  Manual sync can be triggered anytime using the "Sync Now"
                  button
                </span>
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
