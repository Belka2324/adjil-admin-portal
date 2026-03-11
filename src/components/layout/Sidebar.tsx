'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Store,
  CreditCard,
  AlertTriangle,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { usePermission } from '@/hooks';

const menuItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, permission: null },
  { label: 'Customers', href: '/customers', icon: Users, permission: 'view_customers' },
  { label: 'Merchants', href: '/merchants', icon: Store, permission: 'view_merchants' },
  { label: 'Transactions', href: '/transactions', icon: CreditCard, permission: 'view_transactions' },
  { label: 'Disputes', href: '/disputes', icon: AlertTriangle, permission: 'view_disputes' },
  { label: 'Settings', href: '/settings', icon: Settings, permission: 'manage_settings' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { can } = usePermission();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const visibleItems = menuItems.filter((item) => !item.permission || can(item.permission));

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-64px)] w-64 backdrop-blur-md bg-white/30 border-r border-white/20 transition-all duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 z-40`}
    >
      <nav className="flex flex-col h-full p-4">
        {/* Navigation Links */}
        <div className="flex-1 space-y-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-800 hover:bg-white/40'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* User Info and Logout */}
        {user && (
          <div className="border-t border-white/20 pt-4">
            <div className="px-4 py-3 bg-white/20 rounded-lg mb-4">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-gray-600 capitalize">{user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-600 hover:bg-red-500/20 transition"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        )}
      </nav>
    </aside>
  );
};
