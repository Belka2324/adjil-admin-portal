'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card } from '@/components/common/Cards';
import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <DashboardLayout>
      <Card className="max-w-md mx-auto text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900">404</h1>
        <p className="text-gray-600 mt-2">Page not found</p>
        <Link
          href="/dashboard"
          className="inline-block mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Back to Dashboard
        </Link>
      </Card>
    </DashboardLayout>
  );
}
