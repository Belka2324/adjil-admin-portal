# دليل الربط الشامل - Adjil.BNPL + Admin Portal

## نظرة عامة

هذا الدليل يشرح كيفية ربط مشروع Adjil.BNPL ومشروع adjil-admin-portal عبر Supabase لتحقيق مزامنة حقيقية للبيانات والمستخدمين والعمليات.

---

## الهيكل المقترح

```
Adjil.BNPL Platform (مشروع منفصل)
├── مستقل في Netlify/Vercel
├── يستخدم Supabase كمصدر رئيسي للبيانات
└── يقرأ/يكتب في جداول قاعدة البيانات مباشرة

adjil-admin-portal (مشروع منفصل)
├── مستقل في Netlify/Vercel  
├── يتصل بنفس Supabase
└── يقرأ من نفس الجداول + جداول المزامنة
```

---

## الخطوة 1: إعداد Supabase المشترك

### 1.1 متطلبات Supabase

احتفظ بنفس مشروع Supabase الذي تستخدمه حالياً. ستحتاج:
- **Supabase Project URL**: مثل `https://xxxxx.supabase.co`
- **Anon Key**: للمتصفح (public)
- **Service Role Key**: للخادم (سري)

### 1.2 متغيرات البيئة في Adjil.BNPL

أضف في `.env.local` لمشروع Adjil.BNPL:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 1.3 متغيرات البيئة في adjil-admin-portal

أكد أن `.env.local` يحتوي على نفس القيم:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

---

## الخطوة 2: إعداد قاعدة البيانات

### 2.1 الجداول المطلوبة

نفذ ملف SQL التالي في Supabase Dashboard > SQL Editor:

```sql
-- ============================================
-- جداول المزامنة الأساسية
-- ============================================

-- جدول مزامنة المستخدمين (موجود بالفعل)
CREATE TABLE IF NOT EXISTS admin_user_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adjilUserId UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  name TEXT NOT NULL,
  phoneNumber TEXT,
  role TEXT NOT NULL DEFAULT 'support',
  isActive BOOLEAN DEFAULT true,
  adjilRole TEXT,
  adjilData JSONB,
  lastSyncedAt TIMESTAMP DEFAULT now(),
  createdAt TIMESTAMP DEFAULT now(),
  updatedAt TIMESTAMP DEFAULT now()
);

-- جدول سجل المزامنة
CREATE TABLE IF NOT EXISTS sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  syncType TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  totalUsers INT DEFAULT 0,
  syncedUsers INT DEFAULT 0,
  errorMessage TEXT,
  startedAt TIMESTAMP DEFAULT now(),
  completedAt TIMESTAMP,
  metadata JSONB
);

-- ============================================
-- جداول العمليات (للربط بين النظامين)
-- ============================================

-- جدول العمليات المشتركة
CREATE TABLE IF NOT EXISTS operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operationType TEXT NOT NULL, -- 'PAYMENT', 'REFUND', 'DISPUTE', 'KYC', etc.
  status TEXT NOT NULL DEFAULT 'PENDING',
  amount DECIMAL(15,2),
  currency TEXT DEFAULT 'DZD',
  userId UUID, -- مرجع لمستخدم Adjil.BNPL
  adminId UUID, -- من قام بالإجراء في Admin Portal
  description TEXT,
  metadata JSONB,
  createdAt TIMESTAMP DEFAULT now(),
  updatedAt TIMESTAMP DEFAULT now()
);

-- جدول الإشعارات المشتركة
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'INFO', 'WARNING', 'ERROR', 'SUCCESS'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  userId UUID, -- المستهدف
  readAt TIMESTAMP,
  metadata JSONB,
  createdAt TIMESTAMP DEFAULT now()
);

-- فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_operations_type ON operations(operationType);
CREATE INDEX IF NOT EXISTS idx_operations_status ON operations(status);
CREATE INDEX IF NOT EXISTS idx_operations_userId ON operations(userId);
CREATE INDEX IF NOT EXISTS idx_operations_createdAt ON operations(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_userId ON notifications(userId);
CREATE INDEX IF NOT EXISTS idx_notifications_readAt ON notifications(readAt);

-- ============================================
-- Row Level Security
-- ============================================

-- تفعيل RLS
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- سياسات العمليات
CREATE POLICY "Authenticated users can view operations" ON operations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage operations" ON operations
  FOR ALL USING (auth.role() = 'service_role');

-- سياسات الإشعارات
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.role() = 'authenticated' AND userId = auth.uid());

CREATE POLICY "Service role can manage notifications" ON notifications
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- دوال مساعدة
-- ============================================

-- تحديث timestamp تلقائي
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updatedAt = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- تفعيل التحديث التلقائي
DROP TRIGGER IF EXISTS operations_timestamp_trigger ON operations;
CREATE TRIGGER operations_timestamp_trigger
  BEFORE UPDATE ON operations
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS notifications_timestamp_trigger ON notifications;
CREATE TRIGGER notifications_timestamp_trigger
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();
```

---

## الخطوة 3: ربط Adjil.BNPL

### 3.1 تحديث Supabase Client

أكد أن Adjil.BNPL يستخدم نفس إعدادات Supabase:

```typescript
// في Adjil.BNPL
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 3.2 قراءة/كتابة العمليات

```typescript
// مثال: تسجيل عملية دفع
async function createPaymentOperation(amount: number, userId: string, description: string) {
  const { data, error } = await supabase
    .from('operations')
    .insert({
      operationType: 'PAYMENT',
      status: 'COMPLETED',
      amount,
      userId,
      description,
      createdAt: new Date().toISOString()
    })
    .select()
    .single();
  
  return { data, error };
}
```

---

## الخطوة 4: ربط Admin Portal

### 4.1 مزامنة المستخدمين

Admin Portal يحتوي بالفعل على نظام مزامنة. لتفعيل المزامنة الحقيقية:

1. اذهب إلى `/admin/sync-adjil` في Admin Portal
2. اضغط "Sync Now" لمزامنة جميع المستخدمين
3. سيتم استيراد المستخدمين من جدول `users` في Adjil.BNPL

### 4.2 عرض العمليات

أضف صفحة لعرض العمليات في Admin Portal:

```typescript
// src/app/admin/operations/page.tsx
import { supabase } from '@/lib/supabase';

async function getOperations() {
  const { data } = await supabase
    .from('operations')
    .select('*')
    .order('createdAt', { ascending: false })
    .limit(50);
  
  return data || [];
}
```

---

## الخطوة 5: المزامنة الحقيقية

### 5.1 مزامنة المستخدم الواحد (Real-time)

عند تسجيل مستخدم جديد في Adjil.BNPL:

```typescript
// في Adjil.BNPL - بعد إنشاء المستخدم
async function createUserAndSync(userData: any) {
  // 1. إنشاء المستخدم في جدول users
  const { data: user } = await supabase
    .from('users')
    .insert(userData)
    .select()
    .single();
  
  // 2. إشعار Admin Portal via Realtime
  await supabase
    .channel('admin-notifications')
    .send({
      type: 'broadcast',
      event: 'new-user',
      payload: { user }
    });
  
  return user;
}
```

### 5.2 مزامنة العمليات

عند إجراء عملية في Adjil.BNPL:

```typescript
// تسجيل عملية وتظهر تلقائياً في Admin Portal
async function logOperation(type: string, data: any) {
  await supabase
    .from('operations')
    .insert({
      operationType: type,
      ...data,
      createdAt: new Date().toISOString()
    });
}
```

### 5.3 Real-time في Admin Portal

```typescript
// استماع للتغييرات
useEffect(() => {
  const channel = supabase
    .channel('operations-updates')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'operations' },
      (payload) => {
        // إضافة العملية الجديدة للواجهة
        setOperations(prev => [payload.new, ...prev]);
      }
    )
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

---

## الخطوة 6: النشر على Netlify

### 6.1 Adjil.BNPL Netlify

```
Site name: adjil-bnpl
Build command: bun run build
Publish directory: .next
Environment variables:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
```

### 6.2 Admin Portal Netlify

```
Site name: adjil-admin-portal
Build command: bun run build  
Publish directory: .next
Environment variables:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
```

---

## ملخص المزامنة

| العنصر | Adjil.BNPL | Admin Portal | الطريقة |
|--------|-----------|---------------|---------|
| المستخدمين | يكتب في `users` | يقرأ عبر `admin_user_sync` | مزامنة يدوية/دورية |
| العمليات | يكتب في `operations` | يقرأ/يكتب | Real-time |
| الإشعارات | يكتب | يقرأ | Real-time |
| الأدوار | `users.role` | `admin_user_sync.role` | مزامنة |

---

## نصائح مهمة

1. **استخدم Service Role Key بحذر** - فقط في العمليات الخلفية
2. **فعّل RLS** - لحماية البيانات الحساسة
3. **استخدم Realtime** - للتفاعل الفوري
4. **سجل العمليات** - لتتبع جميع الإجراءات
5. **استخدم Webhooks** - للتنبيهات الخارجية

---

**آخر تحديث:** March 2026
