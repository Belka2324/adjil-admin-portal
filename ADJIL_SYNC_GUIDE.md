# دليل المزامنة - Adjil.BNPL User Sync

## نظرة عامة

هذا النظام يوفر مزامنة آمنة وفعالة لمستخدمي منصة Adjil.BNPL إلى Admin Portal دون التأثير على النظام الأصلي.

## المميزات الأساسية

✅ **مزامنة Real-time** - تحديثات فورية للبيانات
✅ **عزل البيانات** - جدول منفصل للتعامل مع البيانات المزامنة
✅ **حماية كاملة** - لا يتأثر نظام Adjil.BNPL الأصلي
✅ **تتبع كامل** - سجلات المزامنة والأخطاء
✅ **مزامنة يدوية** - واجهة إدارة بسيطة

## متطلبات الإعداد

### 1. إنشاء الجداول في Supabase

قم بتنفيذ ملف SQL الموجود في:
```
src/migrations/adjil-user-sync.sql
```

**خطوات:**
1. افتح [Supabase Dashboard](https://supabase.com/dashboard)
2. اذهب إلى SQL Editor
3. انسخ محتوى `adjil-user-sync.sql`
4. قم بتنفيذ الأوامر

**الجداول المُنشأة:**
- `admin_user_sync` - تخزين بيانات المستخدمين المزامنة
- `sync_log` - سجل أحداث المزامنة
- `active_synced_users` - عرض للمستخدمين النشطين

### 2. متطلبات Adjil.BNPL

تأكد من أن:
- جدول المستخدمين في Adjil.BNPL نفس Supabase project
- اسم الجدول: `users`
- الحقول الأساسية موجودة:
  - `id` (UUID)
  - `email` (TEXT)
  - `firstName` أو `first_name`
  - `lastName` أو `last_name`
  - `phoneNumber` أو `phone_number`

## طرق الاستخدام

### 1. عبر الويب UI

اذهب إلى `/admin/sync-adjil` (متاح للـ Admin فقط)

**الخصائص:**
- عرض عدد المستخدمين المزامنة
- زر "Sync Now" للمزامنة اليدوية
- جدول بكل المستخدمين المزامنة
- آخر وقت مزامنة

### 2. عبر Hook React

```typescript
import { useSyncAdjilUsers } from '@/hooks/useSyncAdjilUsers';

function MyComponent() {
  const { 
    syncedUsers,      // جميع المستخدمين المزامنة
    loading,          // حالة التحميل
    error,            // رسال الأخطاء
    syncAll,          // مزامنة جميع المستخدمين
    syncSpecific,     // مزامنة مستخدمين محددين
    refetch           // إعادة جلب البيانات
  } = useSyncAdjilUsers({
    autoSync: false,     // تفعيل المزامنة التلقائية
    syncInterval: 5 * 60 * 1000  // كل 5 دقائق
  });

  return (
    <div>
      <button onClick={syncAll}>مزامنة الآن</button>
      <p>عدد المستخدمين: {syncedUsers.length}</p>
    </div>
  );
}
```

### 3. عبر API

#### مزامنة جميع المستخدمين

```bash
curl -X GET http://localhost:3000/api/sync/adjil-users
```

**الاستجابة:**
```json
{
  "success": true,
  "message": "Successfully synced Adjil.BNPL users",
  "totalUsers": 150,
  "users": [...]
}
```

#### مزامنة مستخدمين محددين

```bash
curl -X POST http://localhost:3000/api/sync/adjil-users \
  -H "Content-Type: application/json" \
  -d '{"userIds": ["user-id-1", "user-id-2"]}'
```

### 4. عبر Service

```typescript
import { 
  syncAllAdjilUsers,
  syncAdjilUsersByIds,
  getAllSyncedAdjilUsers,
  getSyncedUserByEmail 
} from '@/services/sync.service';

// مزامنة جميع المستخدمين
const result = await syncAllAdjilUsers();

// مزامنة مستخدمين محددين
const result = await syncAdjilUsersByIds(['user-1', 'user-2']);

// الحصول على جميع المستخدمين
const users = await getAllSyncedAdjilUsers();

// البحث عن مستخدم بالبريد الإلكتروني
const user = await getSyncedUserByEmail('user@example.com');
```

## هيكل البيانات

### جدول `admin_user_sync`

```typescript
interface SyncedUserMapping {
  id: UUID;
  adjilUserId: UUID;        // معرّف المستخدم الأصلي
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  phoneNumber: string;
  role: 'admin' | 'partner' | 'support';
  isActive: boolean;
  adjilRole: string;        // الدور الأصلي من Adjil
  adjilData: JSONB;         // البيانات الكاملة للمستخدم
  lastSyncedAt: timestamp;
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### جدول `sync_log`

```typescript
interface SyncLog {
  id: UUID;
  syncType: 'FULL' | 'PARTIAL' | 'MANUAL';
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  totalUsers: int;
  syncedUsers: int;
  errorMessage: string;
  startedAt: timestamp;
  completedAt: timestamp;
  metadata: JSONB;
}
```

## السلامة والحماية

### Row Level Security (RLS)

- ✅ المستخدمون المصادقون يمكنهم عرض البيانات المزامنة
- ✅ فقط Service Role يمكنه تعديل البيانات
- ✅ حماية كاملة ضد الوصول غير المصرح

### عزل البيانات

- البيانات المزامنة في جدول منفصل
- البيانات الأصلية في Adjil.BNPL محمية ولم يتم لمسها
- إمكانية الرجوع بسهولة إذا لزم الأمر

### تتبع المزامنة

- جميع عمليات المزامنة مسجلة في `sync_log`
- تتبع كامل للأخطاء والنجاحات
- معلومات metadata للتدقيق

## استكشاف الأخطاء

### المزامنة لا تعمل

**التحقق من:**
1. توفر Supabase service role key
2. وجود الجداول في قاعدة البيانات
3. تفعيل RLS والسياسات الصحيحة

```sql
-- التحقق من وجود الجدول
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'admin_user_sync';

-- التحقق من RLS
SELECT schemaname, tablename, rowsecurity FROM pg_tables 
WHERE tablename = 'admin_user_sync';
```

### بطء المزامنة

**الحلول:**
1. تقليل `syncInterval` في Hook options
2. تفعيل الفهارس (Indexes)
3. استخدام المزامنة الجزئية للمستخدمين المحددين

```typescript
// مزامنة جزئية أسرع
await syncAdjilUsersByIds(['user-1', 'user-2', 'user-3']);
```

### خطأ في الوصول

**التحقق من:**
1. إذن الوصول في Supabase
2. صحة متغيرات البيئة
3. حالة الجلسة

## أفضل الممارسات

✅ استخدم `useSyncAdjilUsers` مع `autoSync: true` للتطبيقات الحرجة
✅ تفقد `sync_log` بانتظام للتحقق من أي أخطاء
✅ احم معرّفات المستخدمين بـ RLS السياسات
✅ اختبر المزامنة في بيئة التطوير أولاً
✅ عطّل (disable) البيانات القديمة بدلاً من حذفها

## الدعم والمساعدة

للمزيد من المعلومات:
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [React Hooks](https://react.dev/reference/react)

---

**آخر تحديث:** March 8, 2026
