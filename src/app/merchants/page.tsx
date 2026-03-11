'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card } from '@/components/common/Cards';

export default function MerchantsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Merchants</h1>
          <p className="text-lg text-gray-600 mt-2">Manage and approve merchant accounts</p>
        </div>

        <Card>
          <div className="text-center py-12 text-gray-500">
            <p>Merchant management interface will be implemented here</p>
            <p className="text-sm mt-2">Approve, reject, and monitor merchant accounts</p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
