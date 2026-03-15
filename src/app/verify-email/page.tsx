'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/common/Cards';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loading, error: authError } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email...');
  const [nextUrl, setNextUrl] = useState<string>('/dashboard');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        const next = searchParams.get('next') || '/dashboard';
        
        setNextUrl(next);

        if (!token || type !== 'signup') {
          setStatus('error');
          setMessage('Invalid verification link. Please try registering again.');
          return;
        }

        // The verification link from Supabase already confirms the email
        // Just need to check if user is authenticated
        setStatus('success');
        setMessage('Email verified successfully! Redirecting...');

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push(next);
        }, 2000);
      } catch (err) {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Verification failed');
      }
    };

    verifyEmail();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 flex items-center justify-center p-4">
      {/* Background blur effect */}
      <div className="absolute inset-0 backdrop-blur-3xl opacity-10" />

      {/* Verification Card */}
      <Card className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-orange-500 rounded-full mb-4">
            <span className="text-white text-2xl font-bold">AD</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Verify Email</h1>
          <p className="text-sm text-gray-600 mt-2">ADJIL ADMIN PORTAL</p>
        </div>

        {/* Verification Status */}
        <div className="space-y-4">
          {status === 'verifying' && (
            <div className="text-center">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              </div>
              <p className="text-gray-600 text-sm mt-4">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                  <span className="text-green-600">✓</span>
                </div>
                <div>
                  <p className="text-green-800 font-medium">Email Verified!</p>
                  <p className="text-green-600 text-sm">{message}</p>
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">{message}</p>
              <button
                onClick={() => router.push('/register')}
                className="mt-4 w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-orange-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                Back to Registration
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-8">
          © 2026 ADJIL. All rights reserved.
        </p>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
