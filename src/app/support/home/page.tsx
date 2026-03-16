'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card } from '@/components/common/Cards';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { 
  Users, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle,
  HelpCircle,
  Clock,
  Search,
  Activity
} from 'lucide-react';
import Link from 'next/link';

interface SupportStats {
  openTickets: number;
  activeDisputes: number;
  resolvedToday: number;
  avgResponseTime: string;
}

export default function SupportHomePage() {
  const { user, loading: authLoading } = useUnifiedAuth();
  const [stats, setStats] = useState<SupportStats>({
    openTickets: 12,
    activeDisputes: 8,
    resolvedToday: 5,
    avgResponseTime: '24m',
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
            <h1 className="text-3xl font-bold text-gray-900">Support Dashboard</h1>
            <p className="text-gray-600 mt-1">Hello {user.name}, how can we help today?</p>
          </div>
          <div className="flex items-center gap-2">
            <HelpCircle className="text-blue-600" size={24} />
            <span className="text-sm font-medium text-blue-600">Support Portal</span>
          </div>
        </div>

        {/* Support Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open Tickets</p>
                <p className="text-2xl font-bold">{stats.openTickets}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="text-blue-600" size={20} />
              </div>
            </div>
          </Card>
          
          <Card className="border-l-4 border-l-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Disputes</p>
                <p className="text-2xl font-bold">{stats.activeDisputes}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="text-orange-600" size={20} />
              </div>
            </div>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved Today</p>
                <p className="text-2xl font-bold">{stats.resolvedToday}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="text-green-600" size={20} />
              </div>
            </div>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold">{stats.avgResponseTime}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="text-purple-600" size={20} />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions & Search */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Search size={20} />
              Quick Search
            </h2>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search customers, transactions or disputes..."
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm cursor-pointer hover:bg-gray-200">#dispute-123</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm cursor-pointer hover:bg-gray-200">#user-ahmed</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm cursor-pointer hover:bg-gray-200">#merchant-electronics</span>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4">Support Tools</h2>
            <div className="space-y-3">
              <Link href="/disputes" className="block p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition border border-gray-100">
                <p className="font-medium">Manage Disputes</p>
                <p className="text-xs text-gray-500">Handle customer-merchant conflicts</p>
              </Link>
              <Link href="/customers" className="block p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition border border-gray-100">
                <p className="font-medium">Customer Support</p>
                <p className="text-xs text-gray-500">View and update customer records</p>
              </Link>
              <button className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
                <MessageSquare size={18} />
                New Support Ticket
              </button>
            </div>
          </Card>
        </div>

        {/* Activity Feed */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Activity size={20} />
              Recent Support Activity
            </h2>
            <button className="text-sm text-blue-600 hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="p-2 bg-white rounded-full border border-gray-200">
                  <Clock size={16} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Updated dispute status for #DIS-7890</p>
                  <p className="text-xs text-gray-500">15 minutes ago by Support System</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
