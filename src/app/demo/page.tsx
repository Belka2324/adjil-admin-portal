'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/common/Cards';
import { seedTestData } from '@/services/localStorage.service';
import { Database, Cloud, Settings } from 'lucide-react';

export default function DemoModePage() {
  const router = useRouter();
  const [showSetup, setShowSetup] = useState(false);
  const [setupStep, setSetupStep] = useState(0);

  useEffect(() => {
    // Auto-seed test data on first visit
    const hasSeeded = localStorage.getItem('local_db_seeded');
    if (!hasSeeded) {
      seedTestData();
      localStorage.setItem('local_db_seeded', 'true');
    }
  }, []);

  const handleLocalMode = () => {
    localStorage.setItem('force_local_auth', 'true');
    router.push('/login');
  };

  const handleSupabaseMode = () => {
    localStorage.setItem('force_local_auth', 'false');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-3xl opacity-10" />

      <div className="max-w-4xl w-full relative z-10 space-y-6">
        {/* Welcome Card */}
        <Card className="text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-orange-500 rounded-full mb-4">
              <span className="text-white text-4xl font-bold">AD</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900">ADMIN PORTAL</h1>
            <p className="text-gray-600 mt-2">Choose Your Development Mode</p>
          </div>

          <div className="text-sm text-gray-600 mb-8 p-4 bg-blue-50 rounded-lg">
            <p>
              Welcome! Choose how you want to test the application. You can use localStorage for quick local testing or Supabase for production-like testing.
            </p>
          </div>
        </Card>

        {/* Mode Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Local Mode Card */}
          <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={handleLocalMode}>
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                <Database size={32} className="text-blue-600" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">Local Mode</h2>
                <p className="text-gray-600 text-sm mt-1">Testing with localStorage</p>
              </div>

              <div className="space-y-2 text-left text-sm text-gray-700">
                <p>✅ <strong>No Setup Required</strong> - Ready to use immediately</p>
                <p>✅ <strong>Fast Testing</strong> - No network latency</p>
                <p>✅ <strong>Test Data Included</strong> - 4 pre-built accounts</p>
                <p>✅ <strong>Full Features</strong> - All auth features work</p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-gray-900 font-semibold mb-2">Test Accounts:</p>
                <div className="space-y-1 text-xs text-gray-600">
                  <p>👤 Admin: admin@test.local / Admin@123</p>
                  <p>👥 Partner: partner@test.local / Partner@123</p>
                  <p>📞 Support: support@test.local / Support@123</p>
                </div>
              </div>

              <button
                onClick={handleLocalMode}
                className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                Enter Local Mode
              </button>

              <p className="text-yellow-600 text-xs font-semibold">
                ⚠️ Data saved in browser localStorage only
              </p>
            </div>
          </Card>

          {/* Supabase Mode Card */}
          <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => setShowSetup(true)}>
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <Cloud size={32} className="text-green-600" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">Supabase Mode</h2>
                <p className="text-gray-600 text-sm mt-1">Production-like testing</p>
              </div>

              <div className="space-y-2 text-left text-sm text-gray-700">
                <p>✅ <strong>Production Environment</strong> - Real database</p>
                <p>✅ <strong>Scalable</strong> - Built for growth</p>
                <p>✅ <strong>Secure</strong> - JWT authentication</p>
                <p>✅ <strong>Real-time</strong> - Live updates</p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-gray-900 font-semibold mb-2">Requirements:</p>
                <div className="space-y-1 text-xs text-gray-600">
                  <p>🔑 Supabase Project URL</p>
                  <p>🔑 Supabase Anon Key</p>
                  <p>🔑 Service Role Key</p>
                </div>
              </div>

              <button
                onClick={() => setShowSetup(true)}
                className="w-full mt-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                Setup Supabase
              </button>

              <p className="text-yellow-600 text-xs font-semibold">
                💡 Need to configure environment first
              </p>
            </div>
          </Card>
        </div>

        {/* Features Card */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">✨ Available Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="font-semibold text-blue-600 mb-2">🔐 Authentication</p>
              <p className="text-sm text-gray-700">Login, Register, Logout with secure passwords</p>
            </div>
            <div>
              <p className="font-semibold text-purple-600 mb-2">👤 User Management</p>
              <p className="text-sm text-gray-700">Admin, Partner, and Support roles</p>
            </div>
            <div>
              <p className="font-semibold text-orange-600 mb-2">📊 Dashboard</p>
              <p className="text-sm text-gray-700">Role-based dashboard with statistics</p>
            </div>
          </div>
        </Card>

        {/* Database Manager Link */}
        <Card className="text-center bg-gradient-to-r from-purple-50 to-blue-50">
          <p className="text-gray-700 mb-3">
            Want to manage local test data? Access the database manager:
          </p>
          <button
            onClick={() => router.push('/admin/local-db')}
            className="inline-flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Settings size={18} />
            <span>Local Database Manager</span>
          </button>
        </Card>

        {/* Setup Instructions Modal */}
        {showSetup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Setup Supabase</h2>
                <button
                  onClick={() => setShowSetup(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div className="step">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Step 1: Get Your Keys</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm">
                    <li>Go to https://supabase.com/dashboard</li>
                    <li>Select your project</li>
                    <li>Click Settings → API</li>
                    <li>Copy Project URL and Keys</li>
                  </ol>
                </div>

                <div className="step">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Step 2: Update .env.local</h3>
                  <div className="bg-gray-100 p-3 rounded text-xs font-mono text-gray-700 overflow-x-auto">
                    <pre>{`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here`}</pre>
                  </div>
                </div>

                <div className="step">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Step 3: Restart Server</h3>
                  <p className="text-gray-700 text-sm">
                    After updating .env.local, restart the development server (Ctrl+C then `bun run dev`)
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowSetup(false);
                      handleSupabaseMode();
                    }}
                    className="w-full py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
                  >
                    Continue to Supabase
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
