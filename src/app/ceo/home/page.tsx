'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card } from '@/components/common/Cards';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { UserRole, hasPermission } from '@/config/rbac.config';
import { 
  Users, 
  Store, 
  CreditCard, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Shield,
  UserPlus,
  FileText,
  Activity
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalUsers: number;
  totalMerchants: number;
  totalTransactions: number;
  activeDisputes: number;
  newMerchantsThisMonth: number;
  newCustomersThisMonth: number;
}

export default function CEOHomePage() {
  const { user, loading: authLoading } = useUnifiedAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalMerchants: 0,
    totalTransactions: 0,
    activeDisputes: 0,
    newMerchantsThisMonth: 0,
    newCustomersThisMonth: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [pendingRegistrations, setPendingRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard data
    const fetchData = async () => {
      try {
        // For demo, using mock data - in production, fetch from API
        setStats({
          totalUsers: 156,
          totalMerchants: 42,
          totalTransactions: 1250,
          activeDisputes: 8,
          newMerchantsThisMonth: 5,
          newCustomersThisMonth: 12,
        });
        
        setRecentActivity([
          { id: 1, action: 'New merchant registered', merchant: 'Electronics Store', time: '2 hours ago', type: 'merchant' },
          { id: 2, action: 'New customer registered', customer: 'Ahmed Benali', time: '3 hours ago', type: 'customer' },
          { id: 3, action: 'Transaction completed', amount: '25,000 DZD', time: '5 hours ago', type: 'transaction' },
          { id: 4, action: 'Dispute opened', merchant: 'Clothing Shop', time: '1 day ago', type: 'dispute' },
        ]);
        
        setPendingRegistrations([
          { id: 1, type: 'merchant', name: 'New Electronics Shop', email: 'shop@example.com', date: '2024-01-20' },
          { id: 2, type: 'customer', name: 'Mohamed Khaldi', email: 'mohamed@example.com', date: '2024-01-19' },
          { id: 3, type: 'merchant', name: 'Fresh Food Market', email: 'market@example.com', date: '2024-01-18' },
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-gray-600">Please login to access this page.</p>
        </div>
      </DashboardLayout>
    );
  }

  // Check if user is CEO
  if (user.role !== 'ceo') {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-red-600">Access denied. CEO only.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">CEO Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="text-blue-600" size={24} />
            <span className="text-sm font-medium text-blue-600">Admin CEO</span>
          </div>
        </div>

        {/* CEO Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/admin/users">
            <Card className="hover:shadow-lg transition cursor-pointer border-r-4 border-r-blue-500">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <UserPlus className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Create Admin</p>
                  <p className="font-semibold">New Admin Account</p>
                </div>
              </div>
            </Card>
          </Link>
          
          <Link href="/admin/merchants?status=pending">
            <Card className="hover:shadow-lg transition cursor-pointer border-r-4 border-r-green-500">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Store className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="font-semibold">{pendingRegistrations.filter(r => r.type === 'merchant').length} Merchants</p>
                </div>
              </div>
            </Card>
          </Link>
          
          <Link href="/admin/customers?status=pending">
            <Card className="hover:shadow-lg transition cursor-pointer border-r-4 border-r-orange-500">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Users className="text-orange-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="font-semibold">{pendingRegistrations.filter(r => r.type === 'customer').length} Customers</p>
                </div>
              </div>
            </Card>
          </Link>
          
          <Link href="/admin/reports">
            <Card className="hover:shadow-lg transition cursor-pointer border-r-4 border-r-purple-500">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FileText className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">View</p>
                  <p className="font-semibold">System Reports</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp size={14} className="ml-1" />
                  +{stats.newCustomersThisMonth} this month
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Merchants</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalMerchants}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp size={14} className="ml-1" />
                  +{stats.newMerchantsThisMonth} this month
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Store className="text-green-600" size={24} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalTransactions}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp size={14} className="ml-1" />
                  +12% this month
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <CreditCard className="text-purple-600" size={24} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Disputes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeDisputes}</p>
                <p className="text-sm text-red-600 flex items-center mt-1">
                  <TrendingDown size={14} className="ml-1" />
                  -3 this week
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
            </div>
          </Card>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity size={20} />
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {activity.type === 'merchant' && <Store size={18} className="text-green-600" />}
                    {activity.type === 'customer' && <Users size={18} className="text-blue-600" />}
                    {activity.type === 'transaction' && <CreditCard size={18} className="text-purple-600" />}
                    {activity.type === 'dispute' && <AlertTriangle size={18} className="text-red-600" />}
                    <div>
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-gray-500">
                        {activity.merchant || activity.customer || activity.amount || ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Pending Registrations */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <UserPlus size={20} />
              Pending Registrations
            </h2>
            <div className="space-y-4">
              {pendingRegistrations.map((reg) => (
                <div key={reg.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-3">
                    {reg.type === 'merchant' ? (
                      <Store size={18} className="text-green-600" />
                    ) : (
                      <Users size={18} className="text-blue-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{reg.name}</p>
                      <p className="text-xs text-gray-500">{reg.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/verify?type=${reg.type}&id=${reg.id}`}
                      className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))}
              {pendingRegistrations.length === 0 && (
                <p className="text-gray-500 text-center py-4">No pending registrations</p>
              )}
            </div>
          </Card>
        </div>

        {/* CEO Only - System Management */}
        <Card className="border-2 border-blue-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield size={20} className="text-blue-600" />
            CEO Management Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/users" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
              <p className="font-medium text-blue-900">Manage Admin Accounts</p>
              <p className="text-sm text-blue-700">Create, edit, or deactivate admin accounts</p>
            </Link>
            <Link href="/admin/roles" className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition">
              <p className="font-medium text-purple-900">Role Management</p>
              <p className="text-sm text-purple-700">Configure permissions and access levels</p>
            </Link>
            <Link href="/admin/audit" className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition">
              <p className="font-medium text-green-900">Audit Logs</p>
              <p className="text-sm text-green-700">View system activity and admin actions</p>
            </Link>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
