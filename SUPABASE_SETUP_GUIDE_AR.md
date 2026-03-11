# دليل تصحيح مشاكل Supabase Configuration

## المشكلة الحالية
❌ **رسالة الخطأ:** "Authentication service not configured. Please configure Supabase."

**السبب:** متغيرات البيئة لم تُعيّن بقيم Supabase الحقيقية

---

## الحل: خطوات الإعداد

### الخطوة 1: احصل على مفاتيح Supabase

#### 1.1 اذهب إلى Supabase Dashboard
- الرابط: https://supabase.com/dashboard

#### 1.2 اختر Project الخاص بك
- انقر على Project من القائمة

#### 1.3 اذهب إلى الإعدادات
- اضغط على **Settings** (الترس)
- اختر **API** من الجانب الأيسر

#### 1.4 انسخ المفاتيح
ستجد:
```
Project URL: https://your-project-id.supabase.co
Public Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### الخطوة 2: حدّث ملف .env.local

**مسار الملف:**
```
c:\Users\admin\Desktop\ALL Versions\Admin\adjil-admin-portal\.env.local
```

**ملء القيم:**

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste_your_public_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=paste_your_service_role_key_here

# App Configuration
NEXT_PUBLIC_APP_NAME=ADMIN PORTAL ADJIL
NEXT_PUBLIC_APP_VERSION=1.0.0
```

**⚠️ ملاحظات:**
- لا تضع علامات اقتباس حول القيم
- لا تشارك هذا الملف مع أحد
- أضفه إلى `.gitignore` (تم بالفعل)

---

### الخطوة 3: تحقق من قاعدة البيانات

#### 3.1 التحقق من جدول `users`

اذهب إلى Supabase Dashboard → SQL Editor وقم بتنفيذ:

```sql
-- تحقق من وجود الجدول
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'users';

-- تحقق من الأعمدة
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'users';
```

**الأعمدة المطلوبة:**
- ✅ id (UUID)
- ✅ email (TEXT)
- ✅ firstName (TEXT)
- ✅ lastName (TEXT)
- ✅ name (TEXT)
- ✅ phoneNumber (TEXT)
- ✅ role (TEXT)
- ✅ isActive (BOOLEAN)
- ✅ createdAt (TIMESTAMP)
- ✅ updatedAt (TIMESTAMP)

#### 3.2 إنشاء جدول users إذا لم يكن موجوداً

```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  name TEXT NOT NULL,
  phoneNumber TEXT,
  role TEXT NOT NULL DEFAULT 'support',
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT now(),
  updatedAt TIMESTAMP DEFAULT now()
);

-- إنشاء indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- تفعيل RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- السماح بالقراءة للمستخدمين المصادقين
CREATE POLICY "Users can read their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- السماح بـ write من service_role (للتسجيل الجديد)
CREATE POLICY "Service role can manage users" ON users
  FOR ALL USING (auth.role() = 'service_role');
```

---

### الخطوة 4: أعد تشغيل الخادم

```bash
# أوقف الخادم (اضغط Ctrl+C)
# ثم شغّله مرة أخرى
bun run dev
```

**يجب أن ترى:**
```
✓ Ready in XXXms
```

---

### الخطوة 5: اختبر التسجيل

1. اذهب إلى: `http://localhost:3000/register`
2. ملأ النموذج بـ:
   - First Name: `أحمد`
   - Last Name: `محمد`
   - Email: `ahmed@example.com`
   - Phone: `12345678`
   - Password: `TestPassword123`
3. اضغط **Create Account**

**النتيجة المتوقعة:**
✅ رسالة نجاح: "Registration Successful!"
✅ رسالة: "A verification email has been sent"

---

## استكشاف الأخطاء

### الخطأ: `NEXT_PUBLIC_SUPABASE_URL is not set`

**الحل:**
```bash
# تحقق من .env.local
cat .env.local

# يجب أن تجد:
# NEXT_PUBLIC_SUPABASE_URL=https://...
```

### الخطأ: `Invalid API Key`

**الحل:**
- تأكد من أن مفتاح API صحيح
- جربه من Supabase Dashboard مباشرة

### الخطأ في Browser Console: `[Supabase] Auth session missing`

**الحل:**
- Supabase مهيأ بشكل صحيح
- هذا تحذير عادي عند بدء التطبيق

### الخطأ: `Users table does not exist`

**الحل:**
```sql
-- قم بإنشاء الجدول من الخطوة 3.2 أعلاه
```

---

## التحقق من الإعداد

### في Browser Console (F12)

يجب أن ترى:
```
✓ Supabase configured properly
✓ Auth initialized
✓ API endpoints available
```

### في التطبيق

- **صفحة Login:** ✅ تعمل بدون أخطاء
- **صفحة Register:** ✅ تقبل البيانات
- **زر Create Account:** ✅ لا يعطي رسالة خطأ

---

## قائمة التحقق النهائية

- [ ] تم نسخ `NEXT_PUBLIC_SUPABASE_URL` من Supabase
- [ ] تم نسخ `NEXT_PUBLIC_SUPABASE_ANON_KEY` من Supabase
- [ ] تم نسخ `SUPABASE_SERVICE_ROLE_KEY` من Supabase
- [ ] تم تحديث `.env.local` بالقيم الحقيقية
- [ ] تم إعادة تشغيل الخادم (بعد تحديث .env.local)
- [ ] جدول `users` موجود في Supabase
- [ ] RLS معطل أو السياسات صحيحة
- [ ] اختبرت التسجيل - يعمل بدون أخطاء ✅

---

## الدعم الإضافي

**إذا استمرت المشكلة:**

1. تحقق من رسالة الخطأ الدقيقة في:
   - Browser Console (F12)
   - Terminal (حيث يعمل `bun run dev`)

2. اطبع رسالة الخطأ الكاملة

3. تحقق من:
   - أن مفاتيح API صحيحة
   - أن قاعدة البيانات متاحة
   - أن جدول `users` موجود

---

**آخر تحديث:** March 8, 2026
**الحالة:** جاهز للاستخدام بعد تطبيق الخطوات أعلاه
