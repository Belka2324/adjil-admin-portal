'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card } from '@/components/common/Cards';
import { Transaction } from '@/types';
import { getTransactions, updateTransactionPaidStatus } from '@/services/transactions.service';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load transactions
    const data = getTransactions();
    setTransactions(data);
    setLoading(false);
  }, []);

  const refreshData = () => {
    const data = getTransactions();
    setTransactions(data);
  };

  const total = useMemo(
    () => transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0),
    [transactions]
  );

  // Format date for display
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-DZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleConfirmPayment = async (transactionId: string, currentPaid: boolean) => {
    const updated = updateTransactionPaidStatus(transactionId, !currentPaid);
    if (updated) {
      setSelectedTransaction(updated);
      refreshData();
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">المعاملات</h1>
          <p className="text-lg text-gray-600 mt-2">Monitor and manage all transactions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div>
              <p className="text-gray-600 text-sm">إجمالي المعاملات</p>
              <p className="text-3xl font-bold text-gray-900">{transactions.length}</p>
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-gray-600 text-sm">المبلغ الإجمالي</p>
              <p className="text-3xl font-bold text-blue-600">
                {total.toLocaleString('fr-DZ')} دج
              </p>
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-gray-600 text-sm">المكتملة</p>
              <p className="text-3xl font-bold text-green-600">
                {transactions.filter((t) => t.status === 'completed').length}
              </p>
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-gray-600 text-sm">المدفوعة للتاجر</p>
              <p className="text-3xl font-bold text-emerald-600">
                {transactions.filter((t) => t.paid).length}
              </p>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
          {/* Transactions Table */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              قائمة المعاملات / Transactions
            </h2>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="text-right py-3 px-4">المعرف</th>
                    <th className="text-right py-3 px-4">المبلغ</th>
                    <th className="text-right py-3 px-4">الطريقة</th>
                    <th className="text-right py-3 px-4">الحالة</th>
                    <th className="text-right py-3 px-4">الدفع</th>
                    <th className="text-right py-3 px-4">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    transactions.map((t) => (
                      <tr
                        key={t.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                          selectedTransaction?.id === t.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedTransaction(t)}
                      >
                        <td className="py-3 px-4 font-mono text-xs">{t.id?.slice(0, 12)}...</td>
                        <td className="py-3 px-4 font-semibold">
                          {Number(t.amount || 0).toLocaleString('fr-DZ')} دج
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              t.paymentMethod === 'BNPL'
                                ? 'bg-blue-100 text-blue-700'
                                : t.paymentMethod === 'card'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {t.paymentMethod || '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              t.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : t.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : t.status === 'failed'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {t.status === 'completed'
                              ? 'مكتمل'
                              : t.status === 'pending'
                              ? 'معلق'
                              : t.status === 'failed'
                              ? 'فشل'
                              : t.status || '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {t.paid ? (
                            <span className="text-green-600 font-semibold">✅ تم الدفع</span>
                          ) : (
                            <span className="text-yellow-600">⏳ Pending</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500">
                          {formatDate(t.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Transaction Details Panel */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              تفاصيل المعاملة
            </h2>
            {selectedTransaction ? (
              <div className="space-y-4 text-sm">
                {/* Invoice Header */}
                <div className="bg-slate-800 text-white p-4 rounded-xl -mx-2">
                  <div className="text-xs text-slate-300">رقم المعاملة</div>
                  <div className="font-mono font-bold">{selectedTransaction.id}</div>
                </div>

                {/* Amount */}
                <div className="text-center py-4 border-b border-gray-100">
                  <div className="text-xs text-gray-500">المبلغ</div>
                  <div className="text-3xl font-black text-gray-800">
                    {Number(selectedTransaction.amount || 0).toLocaleString('fr-DZ')} دج
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">طريقة الدفع:</span>
                    <span className="font-medium">{selectedTransaction.paymentMethod || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">الحالة:</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        selectedTransaction.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : selectedTransaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : selectedTransaction.status === 'failed'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {selectedTransaction.status === 'completed'
                        ? 'مكتمل'
                        : selectedTransaction.status === 'pending'
                        ? 'معلق'
                        : selectedTransaction.status === 'failed'
                        ? 'فشل'
                        : selectedTransaction.status || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">دفع التاجر:</span>
                    {selectedTransaction.paid ? (
                      <span className="text-green-600 font-semibold">✅ تم الدفع</span>
                    ) : (
                      <span className="text-yellow-600">⏳ Pending</span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">التاريخ:</span>
                    <span className="font-medium">{formatDate(selectedTransaction.createdAt)}</span>
                  </div>
                  {selectedTransaction.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">تاريخ الدفع:</span>
                      <span className="font-medium text-green-600">
                        {formatDate(selectedTransaction.paidAt)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Customer & Merchant Info */}
                <div className="pt-3 border-t border-gray-100 space-y-3">
                  <div className="font-semibold">معلومات المعاملة</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <div className="text-gray-500 mb-1 text-xs">الزبون</div>
                      <div className="font-medium">{selectedTransaction.customerName || '—'}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <div className="text-gray-500 mb-1 text-xs">التاجر</div>
                      <div className="font-medium">{selectedTransaction.merchantName || '—'}</div>
                    </div>
                  </div>
                  {selectedTransaction.cardLastFour && (
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <div className="text-gray-500 mb-1 text-xs">بطاقة الزبون</div>
                      <div className="font-mono font-medium">**** {selectedTransaction.cardLastFour}</div>
                    </div>
                  )}
                </div>

                {/* Description */}
                {selectedTransaction.description && (
                  <div className="pt-3 border-t border-gray-100">
                    <div className="text-gray-500 mb-1 text-xs">الوصف</div>
                    <div className="font-medium">{selectedTransaction.description}</div>
                  </div>
                )}

                {/* Confirm Payment Button */}
                {selectedTransaction.status === 'completed' && (
                  <button
                    onClick={() =>
                      handleConfirmPayment(
                        selectedTransaction.id,
                        selectedTransaction.paid || false
                      )
                    }
                    className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium mt-4 ${
                      selectedTransaction.paid
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {selectedTransaction.paid
                      ? '❌ إلغاء تأكيد الدفع'
                      : '✅ تأكيد الدفع للتاجر'}
                  </button>
                )}

                {/* Print Button */}
                <button
                  onClick={() => window.print()}
                  className="w-full bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-700 mt-2"
                >
                  طباعة الفاتورة
                </button>
              </div>
            ) : (
              <div className="text-gray-400 text-sm text-center py-8">
                اختر معاملة لعرض التفاصيل
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
