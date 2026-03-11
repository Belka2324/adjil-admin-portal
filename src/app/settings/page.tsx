'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card } from '@/components/common/Cards';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  Shield, 
  Trash2, 
  Edit, 
  Plus, 
  Search,
  MoreVertical,
  UserMinus,
  UserCheck
} from 'lucide-react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

export default function SettingsPage() {
  const { user } = useUnifiedAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [actionType, setActionType] = useState<'delete' | 'deactivate' | 'activate' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const isCEO = user?.role === 'ceo';
  const canCreateAdmin = isCEO;
  const canManageAdmins = isCEO;

  useEffect(() => {
    // Fetch admins from API
    const fetchAdmins = async () => {
      try {
        // Get session from supabase
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        const response = await fetch('/api/users', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await response.json();
        
        if (data.users) {
          // Filter to only show admins (not regular users)
          const adminUsers = data.users.filter((u: AdminUser) => 
            ['ceo', 'admin', 'support'].includes(u.role)
          );
          setAdmins(adminUsers);
        }
      } catch (error) {
        console.error('Error fetching admins:', error);
        // Fallback to mock data
        setAdmins([
          { id: '1', name: 'CEO Admin', email: 'ceo@adjil.dz', role: 'ceo', status: 'active', created_at: '2024-01-01' },
          { id: '2', name: 'Admin User 1', email: 'admin1@adjil.dz', role: 'admin', status: 'active', created_at: '2024-01-15' },
          { id: '3', name: 'Support User', email: 'support@adjil.dz', role: 'support', status: 'active', created_at: '2024-02-01' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  const filteredAdmins = admins.filter(admin => 
    admin.status !== 'deleted' &&
    (admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     admin.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAction = async (admin: AdminUser, action: 'delete' | 'deactivate' | 'activate') => {
    setSelectedAdmin(admin);
    setActionType(action);
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (!selectedAdmin || !actionType) return;

    setActionLoading(true);
    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (actionType === 'delete') {
        // Call DELETE API (soft delete via status)
        const response = await fetch(`/api/users?userId=${selectedAdmin.id}`, {
          method: 'DELETE',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (response.ok) {
          setAdmins(admins.map(a => a.id === selectedAdmin.id ? { ...a, status: 'deleted' } : a));
        } else {
          const data = await response.json();
          alert(data.error || 'Failed to delete user');
          return;
        }
      } else if (actionType === 'deactivate') {
        // Call PATCH API to suspend
        const response = await fetch('/api/users', {
          method: 'PATCH',
          headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: selectedAdmin.id, status: 'suspended' }),
        });
        if (response.ok) {
          setAdmins(admins.map(a => a.id === selectedAdmin.id ? { ...a, status: 'suspended' } : a));
        } else {
          const data = await response.json();
          alert(data.error || 'Failed to suspend user');
          return;
        }
      } else if (actionType === 'activate') {
        // Call PATCH API to activate
        const response = await fetch('/api/users', {
          method: 'PATCH',
          headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: selectedAdmin.id, status: 'active' }),
        });
        if (response.ok) {
          setAdmins(admins.map(a => a.id === selectedAdmin.id ? { ...a, status: 'active' } : a));
        } else {
          const data = await response.json();
          alert(data.error || 'Failed to activate user');
          return;
        }
      }
    } catch (error) {
      console.error('Error performing action:', error);
      alert('An error occurred while performing the action');
    } finally {
      setShowModal(false);
      setSelectedAdmin(null);
      setActionType(null);
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800',
      deleted: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[status as keyof typeof styles] || styles.inactive}`}>
        {status === 'active' ? 'نشط' : status === 'suspended' ? 'معلق' : status === 'deleted' ? 'محذوف' : 'غير نشط'}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      ceo: 'bg-purple-100 text-purple-800',
      admin: 'bg-blue-100 text-blue-800',
      partner: 'bg-green-100 text-green-800',
      support: 'bg-orange-100 text-orange-800',
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[role as keyof typeof styles] || styles.admin}`}>
        {role === 'ceo' ? 'CEO' : role === 'admin' ? 'أدمن' : role === 'partner' ? 'شريك' : 'دعم'}
      </span>
    );
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-gray-600">Please login to access settings.</p>
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
            <h1 className="text-4xl font-bold text-gray-900">الإعدادات</h1>
            <p className="text-lg text-gray-600 mt-2">إدارة فريق العمل والإعدادات</p>
          </div>
          {canCreateAdmin && (
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus size={20} />
              إضافة أدمن جديد
            </button>
          )}
        </div>

        {/* Only CEO can manage admins */}
        {canManageAdmins ? (
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Shield size={20} />
                فريق العمل
              </h2>
              <p className="text-sm text-gray-500">إدارة حسابات الأدمن</p>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="بحث عن أدمن..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Admin Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">الاسم</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">البريد الإلكتروني</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">الدور</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">الحالة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">تاريخ الإنشاء</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdmins.map((admin) => (
                    <tr key={admin.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users size={18} className="text-blue-600" />
                          </div>
                          <span className="font-medium">{admin.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{admin.email}</td>
                      <td className="py-3 px-4">{getRoleBadge(admin.role)}</td>
                      <td className="py-3 px-4">{getStatusBadge(admin.status)}</td>
                      <td className="py-3 px-4 text-gray-600 text-sm">{admin.created_at}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {admin.role !== 'ceo' && (
                            <>
                              {admin.status === 'active' ? (
                                <button
                                  onClick={() => handleAction(admin, 'deactivate')}
                                  className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"
                                  title="تعليق"
                                >
                                  <UserMinus size={18} />
                                </button>
                              ) : admin.status === 'suspended' ? (
                                <button
                                  onClick={() => handleAction(admin, 'activate')}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded"
                                  title="تفعيل"
                                >
                                  <UserCheck size={18} />
                                </button>
                              ) : null}
                              <button
                                onClick={() => handleAction(admin, 'delete')}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                title="حذف"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredAdmins.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  لا توجد حسابات أدمن
                </div>
              )}
            </div>
          </Card>
        ) : (
          <Card>
            <div className="text-center py-12 text-gray-500">
              <Shield size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">لا تملك صلاحية الوصول</p>
              <p className="text-sm mt-2">هذه الصفحة مخصصة للـ CEO فقط</p>
            </div>
          </Card>
        )}

        {/* System Info */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">معلومات النظام</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">إصدار النظام</p>
              <p className="font-semibold">v1.0.0</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">عدد الأدمن</p>
              <p className="font-semibold">{admins.filter(a => a.status !== 'deleted').length}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">حالة النظام</p>
              <p className="font-semibold text-green-600">يعمل</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">آخر تحديث</p>
              <p className="font-semibold">{new Date().toLocaleDateString('ar')}</p>
            </div>
          </div>
        </Card>

        {/* Confirmation Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold mb-4">تأكيد الإجراء</h3>
              <p className="text-gray-600 mb-6">
                {actionType === 'delete' && `هل أنت متأكد من حذف أدمن "${selectedAdmin?.name}"؟`}
                {actionType === 'deactivate' && `هل أنت متأكد من تعليق أدمن "${selectedAdmin?.name}"؟`}
                {actionType === 'activate' && `هل أنت متأكد من تفعيل أدمن "${selectedAdmin?.name}"؟`}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={confirmAction}
                  disabled={actionLoading}
                  className={`flex-1 px-4 py-2 text-white rounded-lg hover:bg-red-700 ${actionLoading ? 'bg-gray-400' : 'bg-red-600'}`}
                >
                  {actionLoading ? 'جاري...' : 'تأكيد'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
