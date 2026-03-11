'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, X, UserPlus, Store, CreditCard, AlertTriangle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'new_merchant' | 'new_customer' | 'new_transaction' | 'dispute';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: {
    type: 'merchant' | 'customer';
    id: string;
    name: string;
    email: string;
  };
}

interface NotificationCenterProps {
  notifications?: Notification[];
  onNotificationClick?: (notification: Notification) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  notifications: initialNotifications,
  onNotificationClick 
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications || [
    {
      id: '1',
      type: 'new_merchant',
      title: 'تاجر جديد',
      message: 'تم تسجيل تاجر جديد في انتظار المراجعة',
      timestamp: 'منذ 2 ساعة',
      read: false,
      data: { type: 'merchant', id: '1', name: 'متجر الإلكترونيات', email: 'shop@example.com' }
    },
    {
      id: '2',
      type: 'new_customer',
      title: 'زبون جديد',
      message: 'تم تسجيل زبون جديد في انتظار التحقق',
      timestamp: 'منذ 3 ساعات',
      read: false,
      data: { type: 'customer', id: '2', name: 'أحمد محمد', email: 'ahmed@example.com' }
    },
    {
      id: '3',
      type: 'new_transaction',
      title: 'معاملة جديدة',
      message: 'تم إتمام معاملة جديدة بقيمة 25,000 دج',
      timestamp: 'منذ 5 ساعات',
      read: true,
      data: undefined
    },
    {
      id: '4',
      type: 'dispute',
      title: 'نزاع جديد',
      message: 'تم فتح نزاع جديد يتطلب المراجعة',
      timestamp: 'منذ 1 يوم',
      read: true,
      data: undefined
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications(notifications.map(n => 
      n.id === notification.id ? { ...n, read: true } : n
    ));

    // Navigate based on type
    if (notification.data?.type === 'merchant') {
      router.push(`/admin/verify?type=merchant&id=${notification.data.id}`);
    } else if (notification.data?.type === 'customer') {
      router.push(`/admin/verify?type=customer&id=${notification.data.id}`);
    } else if (notification.type === 'dispute') {
      router.push('/disputes');
    } else if (notification.type === 'new_transaction') {
      router.push('/transactions');
    }

    setIsOpen(false);
    onNotificationClick?.(notification);
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'new_merchant':
        return <Store size={18} className="text-green-600" />;
      case 'new_customer':
        return <UserPlus size={18} className="text-blue-600" />;
      case 'new_transaction':
        return <CreditCard size={18} className="text-purple-600" />;
      case 'dispute':
        return <AlertTriangle size={18} className="text-red-600" />;
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">الإشعارات</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell size={32} className="mx-auto mb-2 text-gray-300" />
                  <p>لا توجد إشعارات</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full p-4 text-right border-b border-gray-50 hover:bg-gray-50 transition ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{notification.title}</p>
                        <p className="text-sm text-gray-600 truncate">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{notification.timestamp}</p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-100">
              <button 
                onClick={() => {
                  router.push('/notifications');
                  setIsOpen(false);
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                عرض جميع الإشعارات
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
