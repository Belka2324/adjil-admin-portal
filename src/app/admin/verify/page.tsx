'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { Card } from '@/components/common/Cards';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { 
  Store, 
  User, 
  Check, 
  X, 
  FileText, 
  Upload, 
  Eye,
  Phone,
  Mail,
  MapPin,
  Building,
  CreditCard,
  AlertCircle
} from 'lucide-react';

interface VerificationData {
  id: string;
  type: 'merchant' | 'customer';
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  documents: {
    idFront?: string;
    idBack?: string;
    commercialRegister?: string;
    rib?: string;
    payslip?: string;
  };
  businessInfo?: {
    businessName: string;
    businessType: string;
    licenseNumber: string;
    bankName: string;
    accountNumber: string;
  };
}

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUnifiedAuth();
  const [data, setData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectDocuments, setRejectDocuments] = useState<File[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  const type = searchParams.get('type') as 'merchant' | 'customer';
  const id = searchParams.get('id');

  useEffect(() => {
    // Fetch verification data
    const fetchData = async () => {
      try {
        // Mock data for demo
        setData({
          id: id || '1',
          type: type || 'merchant',
          name: type === 'merchant' ? 'متجر الإلكترونيات' : 'أحمد محمد',
          email: type === 'merchant' ? 'shop@example.com' : 'ahmed@example.com',
          phone: '0555123456',
          address: 'الجزائر، العاصمة',
          status: 'pending',
          documents: {
            idFront: '/placeholder/id-front.jpg',
            idBack: '/placeholder/id-back.jpg',
            commercialRegister: '/placeholder/commercial.jpg',
            rib: '/placeholder/rib.jpg',
            payslip: type === 'customer' ? '/placeholder/payslip.jpg' : undefined,
          },
          businessInfo: type === 'merchant' ? {
            businessName: 'متجر الإلكترونيات',
            businessType: 'تجارة التجزئة',
            licenseNumber: '123456789',
            bankName: 'البنك الوطني الجزائري',
            accountNumber: '12345678901234',
          } : undefined,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, id]);

  const handleConfirm = async () => {
    setActionLoading(true);
    try {
      // API call to confirm registration
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('تم تأكيد التسجيل بنجاح');
      router.push('/admin/home');
    } catch (error) {
      console.error('Error confirming:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('الرجاء إدخال سبب الرفض');
      return;
    }

    setActionLoading(true);
    try {
      // API call to reject registration
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('تم رفض التسجيل');
      router.push('/admin/home');
    } catch (error) {
      console.error('Error rejecting:', error);
    } finally {
      setActionLoading(false);
      setShowRejectModal(false);
    }
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-gray-600">الرجاء تسجيل الدخول</p>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-gray-600">لم يتم العثور على البيانات</p>
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
            <h1 className="text-3xl font-bold text-gray-900">
              مراجعة طلب التسجيل
            </h1>
            <p className="text-gray-600 mt-1">
              {data.type === 'merchant' ? 'تاجر جديد' : 'زبون جديد'} - {data.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
              في الانتظار
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Information Card */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              {data.type === 'merchant' ? <Store size={20} /> : <User size={20} />}
              المعلومات الشخصية
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User size={18} className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">الاسم</p>
                  <p className="font-medium">{data.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail size={18} className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                  <p className="font-medium">{data.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone size={18} className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">رقم الهاتف</p>
                  <p className="font-medium">{data.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin size={18} className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">العنوان</p>
                  <p className="font-medium">{data.address}</p>
                </div>
              </div>

              {data.businessInfo && (
                <>
                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Building size={18} />
                      معلومات التاجر
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Building size={18} className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">اسم المؤسسة</p>
                      <p className="font-medium">{data.businessInfo.businessName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FileText size={18} className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">نوع النشاط</p>
                      <p className="font-medium">{data.businessInfo.businessType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <CreditCard size={18} className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">رقم الرخصة</p>
                      <p className="font-medium">{data.businessInfo.licenseNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Building size={18} className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">البنك</p>
                      <p className="font-medium">{data.businessInfo.bankName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <CreditCard size={18} className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">رقم الحساب</p>
                      <p className="font-medium">{data.businessInfo.accountNumber}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Documents Card */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FileText size={20} />
              المستندات المطلوبة
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {/* ID Front */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">بطاقة الهوية (وجه)</p>
                <div 
                  className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition relative overflow-hidden"
                  onClick={() => setSelectedDocument(data.documents.idFront || null)}
                >
                  {data.documents.idFront ? (
                    <>
                      <img 
                        src={data.documents.idFront} 
                        alt="ID Front" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition flex items-center justify-center">
                        <Eye className="text-white" size={24} />
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-gray-400">
                      <Upload size={24} className="mx-auto mb-2" />
                      <p className="text-xs">غير متوفر</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ID Back */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">بطاقة الهوية (ظهر)</p>
                <div 
                  className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition relative overflow-hidden"
                  onClick={() => setSelectedDocument(data.documents.idBack || null)}
                >
                  {data.documents.idBack ? (
                    <>
                      <img 
                        src={data.documents.idBack} 
                        alt="ID Back" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition flex items-center justify-center">
                        <Eye className="text-white" size={24} />
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-gray-400">
                      <Upload size={24} className="mx-auto mb-2" />
                      <p className="text-xs">غير متوفر</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Commercial Register */}
              {data.type === 'merchant' && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">السجل التجاري</p>
                  <div 
                    className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition relative overflow-hidden"
                    onClick={() => setSelectedDocument(data.documents.commercialRegister || null)}
                  >
                    {data.documents.commercialRegister ? (
                      <>
                        <img 
                          src={data.documents.commercialRegister} 
                          alt="Commercial Register" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition flex items-center justify-center">
                          <Eye className="text-white" size={24} />
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-gray-400">
                        <Upload size={24} className="mx-auto mb-2" />
                        <p className="text-xs">غير متوفر</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* RIB */}
              {data.type === 'merchant' && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">RIB</p>
                  <div 
                    className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition relative overflow-hidden"
                    onClick={() => setSelectedDocument(data.documents.rib || null)}
                  >
                    {data.documents.rib ? (
                      <>
                        <img 
                          src={data.documents.rib} 
                          alt="RIB" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition flex items-center justify-center">
                          <Eye className="text-white" size={24} />
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-gray-400">
                        <Upload size={24} className="mx-auto mb-2" />
                        <p className="text-xs">غير متوفر</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payslip */}
              {data.type === 'customer' && data.documents.payslip && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">ورقة الراتب</p>
                  <div 
                    className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition relative overflow-hidden"
                    onClick={() => setSelectedDocument(data.documents.payslip || null)}
                  >
                    <img 
                      src={data.documents.payslip} 
                      alt="Payslip" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition flex items-center justify-center">
                      <Eye className="text-white" size={24} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={actionLoading}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            <X size={20} />
            رفض الطلب
          </button>
          <button
            onClick={handleConfirm}
            disabled={actionLoading}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Check size={20} />
            {actionLoading ? 'جاري...' : 'تأكيد التسجيل'}
          </button>
        </div>

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="text-red-600" size={24} />
                سبب الرفض
              </h3>
              
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="أدخل سبب الرفض..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رفع مستندات إضافية (اختياري)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-red-400 transition">
                  <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                  <p className="text-sm text-gray-500">انقر لرفع ملفات</p>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? 'جاري...' : 'تأكيد الرفض'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Document Viewer Modal */}
        {selectedDocument && (
          <div 
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
            onClick={() => setSelectedDocument(null)}
          >
            <button 
              className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-lg"
              onClick={() => setSelectedDocument(null)}
            >
              <X size={24} />
            </button>
            <img 
              src={selectedDocument} 
              alt="Document" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
