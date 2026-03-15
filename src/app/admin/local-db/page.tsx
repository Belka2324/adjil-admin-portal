'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/common/Cards';
import { useLocalAuth } from '@/lib/local-auth-context';
import { useRouter } from 'next/navigation';
import {
  getAllUsers,
  getStatistics,
  seedTestData,
  clearAllData,
  deleteUser,
  exportData,
} from '@/services/localStorage.service';
import { AppUser } from '@/types';
import { Trash2, Settings, Download, RefreshCw, Plus } from 'lucide-react';

interface Stats {
  totalUsers: number;
  adminUsers: number;
  partnerUsers: number;
  activeSessions: number;
}

export default function LocalDatabasePage() {
  const { user, loading: authLoading } = useLocalAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  // Protect route - only admins
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load data
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    const allUsers = getAllUsers();
    const statistics = getStatistics();
    setUsers(allUsers);
    setStats(statistics);
  };

  const handleSeedTest = async () => {
    setLoading(true);
    try {
      seedTestData();
      refreshData();
    } catch (err) {
      console.error('Error seeding data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to delete ALL data? This cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      clearAllData();
      refreshData();
      router.push('/login');
    } catch (err) {
      console.error('Error clearing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    deleteUser(userId);
    refreshData();
  };

  const handleExportData = () => {
    const data = exportData();
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `adjil_local_db_${new Date().toISOString()}.json`;
    link.click();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Local Database Manager</h1>
            <p className="text-gray-600 mt-2">Test the application locally using localStorage</p>
          </div>
        </div>

        {/* Demo Mode Badge */}
        <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
          <p className="text-blue-800 font-semibold">
            🧪 Demo Mode: Using Local Storage (not connected to Supabase)
          </p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <div>
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </Card>
            <Card>
              <div>
                <p className="text-gray-600 text-sm">Admin Users</p>
                <p className="text-3xl font-bold text-purple-600">{stats.adminUsers}</p>
              </div>
            </Card>
            <Card>
              <div>
                <p className="text-gray-600 text-sm">Partner Users</p>
                <p className="text-3xl font-bold text-blue-600">{stats.partnerUsers}</p>
              </div>
            </Card>
            <Card>
              <div>
                <p className="text-gray-600 text-sm">Active Sessions</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeSessions}</p>
              </div>
            </Card>
          </div>
        )}

        {/* Control Panel */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Settings className="mr-2" size={24} /> Database Controls
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={refreshData}
              disabled={loading}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw size={18} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleSeedTest}
              disabled={loading}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Plus size={18} />
              <span>Seed Test Data</span>
            </button>

            <button
              onClick={handleExportData}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              <Download size={18} />
              <span>Export</span>
            </button>

            <button
              onClick={handleClearData}
              disabled={loading}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 size={18} />
              <span>Clear All</span>
            </button>
          </div>
        </Card>

        {/* Test Credentials */}
        <Card className="bg-green-50 border border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-4">📝 Test Credentials</h3>
          <div className="space-y-3">
            <div>
              <p className="font-semibold text-green-800">Admin Account:</p>
              <p className="text-sm text-green-700">Email: admin@test.local</p>
              <p className="text-sm text-green-700">Password: Admin@123</p>
            </div>
            <div>
              <p className="font-semibold text-green-800">Partner Account:</p>
              <p className="text-sm text-green-700">Email: partner@test.local</p>
              <p className="text-sm text-green-700">Password: Partner@123</p>
            </div>
            <div>
              <p className="font-semibold text-green-800">Support Account:</p>
              <p className="text-sm text-green-700">Email: support@test.local</p>
              <p className="text-sm text-green-700">Password: Support@123</p>
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Users</h2>

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
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No users yet. Click &quot;Seed Test Data&quot; to create test users.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{u.name}</td>
                      <td className="px-6 py-4 text-gray-600">{u.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : u.role === 'partner'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {u.isActive ? (
                          <span className="text-green-600 font-semibold">Active</span>
                        ) : (
                          <span className="text-red-600 font-semibold">Inactive</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4">
                        {user?.id !== u.id && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-red-600 hover:text-red-700 font-semibold"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="bg-yellow-50 border border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-900 mb-4">⚠️ Important Notes</h3>
          <ul className="space-y-2 text-yellow-800 text-sm">
            <li>• Data is stored in browser localStorage only</li>
            <li>• Clearing browser data will delete all test data</li>
            <li>• Passwords are NOT securely hashed (demo only)</li>
            <li>• Export data before clearing for backup</li>
            <li>• Switch to Supabase by configuring environment variables</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
