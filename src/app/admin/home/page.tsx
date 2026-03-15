'use client';

import React, { useEffect, useState } from 'react';
import { AppUser } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/common/Cards';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import Image from 'next/image';
import { 
  Users, 
  Database, 
  Settings, 
  BarChart3, 
  WifiSync,
  LogOut,
  Home,
  Shield
} from 'lucide-react';

export default function AdminHomePage() {
  const router = useRouter();
  const { user, logout, isDemoMode } = useUnifiedAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    activeUsers: 0
  });
  const [usersList, setUsersList] = useState<AppUser[]>([]);

  async function fetchUsers() {
    try {
      const res = await fetch('/api/users');
      const json = await res.json();
      if (json.users) setUsersList(json.users);
      else setUsersList([]);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setUsersList([]);
    }
  }

  useEffect(() => {
    if (isDemoMode) {
      const users = JSON.parse(localStorage.getItem('adjil_users') || '[]');
      setStats({
        totalUsers: users.length,
        adminUsers: users.filter((u: AppUser) => u.role === 'admin').length,
        activeUsers: Object.keys(JSON.parse(localStorage.getItem('adjil_sessions') || '{}')).length
      });
      setUsersList(users);
    } else {
      fetchUsers();
    }
  }, [isDemoMode]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!user && typeof window !== 'undefined') {
    // إذا لم يكن هناك مستخدم بعد انتهاء التحميل، توجه إلى صفحة تسجيل الدخول
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center">
          <p className="text-red-600 font-semibold mb-4">Access Denied</p>
          <p className="text-gray-600 mb-6">Only admins can access this page</p>
          <Link href="/login" className="text-blue-600 hover:text-blue-700">
            Return to Login
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundImage: 'url(/background.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-orange-500 rounded-full flex items-center justify-center overflow-hidden">
                <Image src="/Logo%20AD.png" alt="Logo" width={40} height={40} className="object-cover" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
            </div>

            <div className="flex items-center space-x-4">
              {user && (
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">{user.first_name || user.firstName} {user.last_name || user.lastName}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              )}

              {isDemoMode && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                  📱 Demo Mode
                </span>
              )}

              <button
                onClick={handleLogout}
                className="inline-flex items-center space-x-2 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-bold transition"
              >
                <LogOut size={20} />
                <span className="sm:inline text-sm">تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        {user && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Welcome back, {user.firstName}! 👋</h2>
            <p className="text-gray-600 mt-2">Here&apos;s what&apos;s happening with your admin portal</p>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users size={24} className="text-blue-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Admins</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.adminUsers}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield size={24} className="text-purple-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Sessions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeUsers}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 size={24} className="text-green-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Mode</p>
                <p className="text-2xl font-bold text-gray-900 mt-2 truncate">
                  {isDemoMode ? 'Local' : 'Supabase'}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Database size={24} className="text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Users Table */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">قائمة المستخدمين</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b">الاسم</th>
                  <th className="px-4 py-2 border-b">البريد الإلكتروني</th>
                  <th className="px-4 py-2 border-b">الدور</th>
                  {/* <th className="px-4 py-2 border-b">الرصيد</th> */}
                  <th className="px-4 py-2 border-b">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b">{u.name || u.first_name || u.firstName || ''} {u.last_name || u.lastName || ''}</td>
                    <td className="px-4 py-2 border-b">{u.email}</td>
                    <td className="px-4 py-2 border-b">{u.role}</td>
                    {/* <td className="px-4 py-2 border-b">{u.balance ?? '-'} </td> */}
                    <td className="px-4 py-2 border-b">{(u.status === 'active') || (u.is_active ?? u.isActive) ? 'نشط' : 'غير نشط'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Local Database Manager */}
            <Card className="hover:shadow-lg transition-all cursor-pointer">
              <Link href="/admin/local-db" className="block">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Database size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Database Manager</h4>
                    <p className="text-sm text-gray-600 mt-1">Manage users & test data</p>
                    <div className="mt-3 inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-semibold">
                      Open →
                    </div>
                  </div>
                </div>
              </Link>
            </Card>

            {/* Sync System */}
            <Card className="hover:shadow-lg transition-all cursor-pointer">
              <Link href="/admin/sync-adjil" className="block">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <WifiSync size={24} className="text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Sync System</h4>
                    <p className="text-sm text-gray-600 mt-1">Sync Adjil BNPL users</p>
                    <div className="mt-3 inline-flex items-center text-purple-600 hover:text-purple-700 text-sm font-semibold">
                      Open →
                    </div>
                  </div>
                </div>
              </Link>
            </Card>

            {/* Settings */}
            <Card className="hover:shadow-lg transition-all cursor-pointer">
              <Link href="/settings" className="block">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Settings size={24} className="text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Settings</h4>
                    <p className="text-sm text-gray-600 mt-1">Configure admin panel</p>
                    <div className="mt-3 inline-flex items-center text-orange-600 hover:text-orange-700 text-sm font-semibold">
                      Open →
                    </div>
                  </div>
                </div>
              </Link>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Info Card */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4">📋 About This Portal</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <p>
                This is the Adjil Admin Portal - a comprehensive management system for handling users, transactions, and syncing with the Adjil BNPL platform.
              </p>
              <p>
                <strong>Current Mode:</strong> {isDemoMode ? 'Local Testing (localStorage)' : 'Production (Supabase)'}
              </p>
              <p>
                As an admin, you have access to all features including user management, data synchronization, and system settings.
              </p>
            </div>
          </Card>

          {/* Documentation */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4">📚 Documentation</h3>
            <div className="space-y-2">
              <a
                href="https://docs.supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                📖 Supabase Documentation →
              </a>
              <a
                href="https://nextjs.org/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                📖 Next.js Documentation →
              </a>
              <p className="text-gray-700 text-sm mt-4">
                For setup guides and troubleshooting, check the project's README.md
              </p>
            </div>
          </Card>
        </div>

        {/* Navigation */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/dashboard">
            <Card className="text-center hover:shadow-lg transition-all">
              <Home className="mx-auto mb-2" size={24} />
              <p className="font-semibold text-gray-900">Dashboard</p>
            </Card>
          </Link>

          <Link href="/customers">
            <Card className="text-center hover:shadow-lg transition-all">
              <Users className="mx-auto mb-2" size={24} />
              <p className="font-semibold text-gray-900">Customers</p>
            </Card>
          </Link>

          <Link href="/merchants">
            <Card className="text-center hover:shadow-lg transition-all">
              <Database className="mx-auto mb-2" size={24} />
              <p className="font-semibold text-gray-900">Merchants</p>
            </Card>
          </Link>

          <Link href="/transactions">
            <Card className="text-center hover:shadow-lg transition-all">
              <BarChart3 className="mx-auto mb-2" size={24} />
              <p className="font-semibold text-gray-900">Transactions</p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
