'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { Menu, LogOut, Globe } from 'lucide-react';
import Link from 'next/link';
import { NotificationCenter } from '@/components/common/NotificationCenter';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/30 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="p-2 hover:bg-white/20 rounded-lg transition"
              aria-label="Toggle menu"
            >
              <Menu size={24} />
            </button>
            <Link href="/dashboard" className="text-xl font-bold text-blue-600">
              ADJIL Admin
            </Link>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <NotificationCenter />

            {/* Language Selector */}
            <button className="p-2 hover:bg-white/20 rounded-lg transition">
              <Globe size={20} />
            </button>

            {/* User Menu */}
            {user && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-600 capitalize">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition text-red-600"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
