'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card } from '@/components/common/Cards';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { 
  Building2, 
  Store, 
  CreditCard, 
  BarChart3, 
  TrendingUp, 
  PieChart,
  Users,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';

interface PartnerStats {
  totalMerchants: number;
  totalVolume: string;
  activeUsers: number;
  commissionEarned: string;
}

export default function PartnerHomePage() {
  const { user, loading: authLoading } = useUnifiedAuth();
  const [stats, setStats] = useState<PartnerStats>({
    totalMerchants: 15,
    totalVolume: '4,250,000 DZD',
    activeUsers: 840,
    commissionEarned: '125,000 DZD',
  });
  const [loading, setLoading] = useState(false);

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Partner Portal</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user.name} | Partner Dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="text-indigo-600" size={24} />
            <span className="text-sm font-medium text-indigo-600">Bank Partner</span>
          </div>
        </div>

        {/* Partner stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-none">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">Associated Merchants</p>
                <p className="text-3xl font-bold">{stats.totalMerchants}</p>
              </div>
              <Store className="text-indigo-100 opacity-50" size={32} />
            </div>
            <div className="mt-4 flex items-center text-xs text-indigo-100">
              <TrendingUp size={14} className="mr-1" />
              <span>+2 this month</span>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Volume</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalVolume}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <CreditCard className="text-blue-600" size={24} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Users className="text-green-600" size={24} />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Commission (YTD)</p>
                <p className="text-2xl font-bold text-gray-900">{stats.commissionEarned}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <BarChart3 className="text-orange-600" size={24} />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <BarChart3 size={20} className="text-gray-400" />
                  Performance Overview
                </h3>
                <select className="text-sm border rounded px-2 py-1 outline-none">
                  <option>Last 30 Days</option>
                  <option>Last 3 Months</option>
                  <option>Year to Date</option>
                </select>
              </div>
              <div className="h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <PieChart size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Transaction distribution chart placeholder</p>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold mb-4">Your Portfolio Merchants</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b">
                      <th className="pb-3 px-2">Merchant Name</th>
                      <th className="pb-3 px-2">Status</th>
                      <th className="pb-3 px-2 text-right">Transactions</th>
                      <th className="pb-3 px-2 text-right">Volume</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[1, 2, 3].map((i) => (
                      <tr key={i} className="text-sm hover:bg-gray-50">
                        <td className="py-3 px-2 font-medium">Merchant Account {i}</td>
                        <td className="py-3 px-2">
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Active</span>
                        </td>
                        <td className="py-3 px-2 text-right">{120 * i}</td>
                        <td className="py-3 px-2 text-right">{(250000 * i).toLocaleString()} DZD</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Sidebar / Quick Actions */}
          <div className="space-y-6">
            <Card className="border-t-4 border-t-indigo-500">
              <h3 className="text-lg font-semibold mb-4">Partner Actions</h3>
              <div className="grid grid-cols-1 gap-3">
                <button className="flex items-center gap-3 p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-100">
                  <div className="p-2 bg-indigo-100 rounded">
                    <Briefcase size={18} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Add New Merchant</p>
                    <p className="text-xs text-gray-500">Initiate merchant onboarding</p>
                  </div>
                </button>
                <Link href="/transactions" className="flex items-center gap-3 p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-100">
                  <div className="p-2 bg-blue-100 rounded">
                    <BarChart3 size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Detailed Reports</p>
                    <p className="text-xs text-gray-500">Export transaction data</p>
                  </div>
                </Link>
                <Link href="/merchants" className="flex items-center gap-3 p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-100">
                  <div className="p-2 bg-purple-100 rounded">
                    <Store size={18} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Portfolio Management</p>
                    <p className="text-xs text-gray-500">Review merchant settings</p>
                  </div>
                </Link>
              </div>
            </Card>

            <Card className="bg-gray-900 text-white">
              <h4 className="font-semibold text-gray-300 text-sm mb-2">Partner Tip</h4>
              <p className="text-sm text-gray-400">
                You can now export merchant performance summaries directly to PDF from the reporting section.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
