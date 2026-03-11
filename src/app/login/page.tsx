'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { Card } from '@/components/common/Cards';
import { loginSchema } from '@/utils/validation';
import { Eye, EyeOff, Database } from 'lucide-react';
import Link from 'next/link';
import { UserRole, ROLE_PORTAL, canAccessPortal } from '@/config/rbac.config';

export default function LoginPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { login, user, loading, error, isDemoMode } = useUnifiedAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [validationError, setValidationError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect based on user role after successful login
  useEffect(() => {
    if (!loading && user && !isLoggingIn) {
      // Get the allowed portal for this user's role
      const allowedPortal = ROLE_PORTAL[user.role as UserRole];
      
      if (!allowedPortal) {
        setValidationError('Invalid user role. Please contact administrator.');
        return;
      }
      
      // Redirect to the appropriate portal based on role
      router.push(allowedPortal);
    }
  }, [user, isLoggingIn, loading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError('');

    try {
      const validated = loginSchema.parse(formData);
      setIsLoggingIn(true);
      await login(validated.email, validated.password);
      // Redirect happens in useEffect when user is loaded
    } catch (err) {
      setIsLoggingIn(false);
      if (err instanceof Error) {
        setValidationError(err.message);
      } else {
        setValidationError('Login failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 flex items-center justify-center p-4">
      {/* Background blur effect */}
      <div className="absolute inset-0 backdrop-blur-3xl opacity-10" />

      {/* Login Card */}
      <Card className="w-full max-w-md relative z-10">
        {/* Demo Mode Badge */}
        {isDemoMode && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center space-x-2">
            <Database size={16} className="text-yellow-600" />
            <p className="text-yellow-700 text-xs font-semibold">📱 Demo Mode (localStorage)</p>
          </div>
        )}

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-orange-500 rounded-full mb-4">
            <span className="text-white text-2xl font-bold">AD</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">ADMIN PORTAL</h1>
          <p className="text-sm text-gray-600 mt-2">ADJIL</p>
        </div>

        {/* Error Messages */}
        {(error || validationError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-medium">{error || validationError}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="admin@adjil.com"
              className="w-full mt-1 px-4 py-2 rounded-lg border border-white/20 bg-white/20 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={loading || isLoggingIn}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full mt-1 px-4 py-2 pr-10 rounded-lg border border-white/20 bg-white/20 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                disabled={loading || isLoggingIn}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                disabled={loading || isLoggingIn}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || isLoggingIn}
            className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-orange-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? 'Redirecting to Dashboard...' : loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
            >
              Create Account
            </Link>
          </p>
        </div>

        {/* Demo Mode Hint */}
        {isDemoMode && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
            <p className="font-semibold mb-2">Test Credentials Available:</p>
            <ul className="space-y-1 text-blue-600">
              <li>• Admin: admin@test.local / Admin@123</li>
              <li>• Partner: partner@test.local / Partner@123</li>
              <li>• Support: support@test.local / Support@123</li>
            </ul>
            <Link
              href="/admin/local-db"
              className="block mt-3 text-blue-600 hover:text-blue-700 font-semibold"
            >
              Manage Test Data →
            </Link>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-6">
          © 2026 ADJIL. All rights reserved.
        </p>
      </Card>
    </div>
  );
}
