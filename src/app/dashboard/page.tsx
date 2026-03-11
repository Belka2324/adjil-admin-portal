'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, StatCard } from '@/components/common/Cards';
import { Users, Store, CreditCard, AlertTriangle } from 'lucide-react';
import { DashboardStats } from '@/types';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, loading } = useUnifiedAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Simulate fetching dashboard stats
    const fetchStats = async () => {
      try {
        // TODO: Replace with actual Supabase query
        setStats({
          totalCustomers: 1234,
          totalMerchants: 456,
          totalTransactions: 5678,
          totalDisputesOpen: 23,
          totalRevenue: 234567.89,
          activeMerchants: 445,
          suspendedAccounts: 11,
        });
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gradient-to-r from-gray-200 to-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome back, {user.name}!
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Here's what's happening with your platform today
          </p>
        </div>

        {/* Statistics Grid */}
        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Customers"
                value={stats.totalCustomers}
                icon={<Users size={32} />}
                trend={{ value: 12, direction: 'up' }}
              />
              <StatCard
                title="Total Merchants"
                value={stats.totalMerchants}
                icon={<Store size={32} />}
                trend={{ value: 8, direction: 'up' }}
              />
              <StatCard
                title="Total Transactions"
                value={stats.totalTransactions}
                icon={<CreditCard size={32} />}
                trend={{ value: 23, direction: 'up' }}
              />
              <StatCard
                title="Open Disputes"
                value={stats.totalDisputesOpen}
                icon={<AlertTriangle size={32} />}
                trend={{ value: 5, direction: 'down' }}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <StatCard
                title="Total Revenue"
                value={`$${stats.totalRevenue.toLocaleString()}`}
                className="lg:col-span-2"
              />
              <Card>
                <h3 className="text-lg font-bold mb-4">Quick Stats</h3>
                <div className="space-y-2">
                  <p className="flex justify-between">
                    <span className="text-gray-600">Active Merchants:</span>
                    <span className="font-semibold">{stats.activeMerchants}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600">Suspended:</span>
                    <span className="font-semibold text-red-600">{stats.suspendedAccounts}</span>
                  </p>
                </div>
              </Card>
            </div>
          </>
        )}

        {/* Recent Activity */}
        <Card>
          <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
          <div className="text-center py-8 text-gray-500">
            <p>Activity feed will appear here</p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
