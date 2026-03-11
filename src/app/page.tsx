'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/common/Cards';
import { ArrowRight, Zap, Lock, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const user = localStorage.getItem('adjil_user');
    if (user) {
      const parsedUser = JSON.parse(user);
      // Redirect to appropriate page based on role
      if (parsedUser.role === 'admin') {
        router.push('/admin/home');
      } else {
        router.push('/dashboard');
      }
    }
  }, [router]);

  const handleGetStarted = () => {
    setIsLoading(true);
    router.push('/demo');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-6 shadow-2xl">
              <span className="text-5xl font-bold bg-gradient-to-br from-blue-600 to-orange-500 bg-clip-text text-transparent">
                AD
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4">
              Adjil Admin Portal
            </h1>

            <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Comprehensive management system for handling users, transactions, and integrations with Adjil BNPL platform
            </p>

            <button
              onClick={handleGetStarted}
              disabled={isLoading}
              className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:shadow-2xl transition-all hover:scale-105 disabled:opacity-50"
            >
              <span>{isLoading ? 'Loading...' : 'Get Started'}</span>
              <ArrowRight size={20} />
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="backdrop-blur-xl bg-white/10 border-white/20 text-white">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Zap size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Lightning Fast</h3>
                  <p className="text-blue-100 text-sm">Instant local testing with localStorage</p>
                </div>
              </div>
            </Card>

            <Card className="backdrop-blur-xl bg-white/10 border-white/20 text-white">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Lock size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Secure</h3>
                  <p className="text-blue-100 text-sm">Role-based access control & authentication</p>
                </div>
              </div>
            </Card>

            <Card className="backdrop-blur-xl bg-white/10 border-white/20 text-white">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Globe size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Scalable</h3>
                  <p className="text-blue-100 text-sm">Ready for production with Supabase</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Capabilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="backdrop-blur-xl bg-white/10 border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">✨ Key Features</h3>
              <ul className="space-y-3 text-blue-100">
                <li className="flex items-center space-x-2">
                  <span className="text-white">✓</span>
                  <span>User Registration & Authentication</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-white">✓</span>
                  <span>Email Verification</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-white">✓</span>
                  <span>Role-Based Access Control</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-white">✓</span>
                  <span>Adjil BNPL User Synchronization</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-white">✓</span>
                  <span>Real-time Data Updates</span>
                </li>
              </ul>
            </Card>

            <Card className="backdrop-blur-xl bg-white/10 border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">🚀 Quick Start</h3>
              <ol className="space-y-3 text-blue-100 list-decimal list-inside">
                <li>
                  <span className="font-semibold text-white">Click "Get Started"</span>
                  <p className="text-xs text-blue-200 mt-1">Choose Local or Supabase mode</p>
                </li>
                <li>
                  <span className="font-semibold text-white">Login or Register</span>
                  <p className="text-xs text-blue-200 mt-1">Use test accounts or create new user</p>
                </li>
                <li>
                  <span className="font-semibold text-white">Access Dashboard</span>
                  <p className="text-xs text-blue-200 mt-1">Role-based features based on your role</p>
                </li>
              </ol>
            </Card>
          </div>

          {/* Login/Register Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:shadow-xl transition-all hover:scale-105 w-full sm:w-auto text-center"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all hover:scale-105 w-full sm:w-auto text-center"
            >
              Register
            </Link>
            <Link
              href="/admin/local-db"
              className="px-8 py-3 bg-blue-400 text-white font-semibold rounded-lg hover:shadow-xl transition-all hover:scale-105 w-full sm:w-auto text-center"
            >
              Local Database
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 border-t border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-white/70">
          <p className="text-sm">
            Adjil Admin Portal © 2024. Built with Next.js, TypeScript, and Supabase.
          </p>
        </div>
      </div>
    </main>
  );
}
