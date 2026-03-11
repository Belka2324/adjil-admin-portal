# Unified Authentication System - Implementation Guide

## Overview

This guide explains the unified authentication system that seamlessly switches between **localStorage (Demo Mode)** and **Supabase (Production Mode)**.

---

## 🎯 What is Unified Auth?

The unified auth system (`useUnifiedAuth`) automatically:
1. **Detects** if Supabase is configured via environment variables
2. **Switches** between local and Supabase authentication
3. **Provides** the same interface for both modes
4. **Fallbacks** to localStorage if Supabase is not configured

---

## 📁 Key Files

### Core Implementation

| File | Purpose |
|------|---------|
| `src/hooks/useUnifiedAuth.ts` | Main hook that switches between auth modes |
| `src/lib/auth-context.tsx` | Supabase authentication provider |
| `src/lib/local-auth-context.tsx` | localStorage authentication provider |
| `src/services/localStorage.service.ts` | localStorage database service |

### Updated Pages

| File | Changes |
|------|---------|
| `src/app/page.tsx` | Landing page with get started button |
| `src/app/demo/page.tsx` | Demo mode selector (local vs Supabase) |
| `src/app/login/page.tsx` | Now uses `useUnifiedAuth` |
| `src/app/register/page.tsx` | Now uses `useUnifiedAuth` |
| `src/app/dashboard/page.tsx` | Now uses `useUnifiedAuth` |
| `src/app/admin/home/page.tsx` | Admin home dashboard (new) |
| `src/app/admin/local-db/page.tsx` | Local database manager |

---

## 🚀 Quick Start

### For Development (Local Testing)

1. **Start the development server:**
   ```bash
   bun run dev
   ```

2. **Navigate to home page:**
   - Open `http://localhost:3000`
   - Click "Get Started" or go to `/demo`

3. **Choose Local Mode:**
   - Select "Local Mode" to test with localStorage
   - No configuration needed!

4. **Use Test Accounts:**
   ```
   Admin: admin@test.local / Admin@123
   Partner: partner@test.local / Partner@123
   Support: support@test.local / Support@123
   ```

5. **Manage Data:**
   - Go to `/admin/local-db` to seed, export, or clear data

### For Production (Supabase)

1. **Get Supabase Keys:**
   - Go to https://supabase.com/dashboard
   - Select your project → Settings → API

2. **Update `.env.local`:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

3. **Restart Server:**
   ```bash
   # Stop: Ctrl+C
   # Start: bun run dev
   ```

4. **Choose Supabase Mode:**
   - The system automatically detects Supabase configuration
   - Registration creates users in Supabase database

---

## 🔄 How It Works

### Detection Flow

```
useUnifiedAuth Hook
    ↓
Check Environment Variables
    ↓
    ├─ SUPABASE_URL + ANON_KEY Found?
    │  └─ Yes → Use Supabase (via useAuth)
    │
    └─ Not Found?
       ├─ Check localStorage 'force_local_auth' flag?
       │  ├─ 'true' → Use localStorage (via useLocalAuth)
       │  └─ 'false' → Use Supabase (if configured)
       │
       └─ Default → Use localStorage as fallback
```

### Mode Switching

**localStorage Mode Flag:**
```typescript
// Force local auth even if Supabase is configured
localStorage.setItem('force_local_auth', 'true');

// Use Supabase if configured, fallback to localStorage
localStorage.setItem('force_local_auth', 'false');
```

---

## 🎨 UI Indicators

### Demo Mode Badge

When in localStorage (demo) mode, users see:
```
📱 Demo Mode (localStorage)
```

This badge appears on:
- Login page
- Register page
- All authenticated pages

### Test Data Hints

On login page in demo mode, users see available test accounts:
```
Test Credentials Available:
• Admin: admin@test.local / Admin@123
• Partner: partner@test.local / Partner@123
• Support: support@test.local / Support@123
```

---

## 🔐 Authentication Flow

### Registration (Both Modes)

```typescript
const { register, isDemoMode } = useAuth();

await register(
  'John',           // firstName
  'Doe',           // lastName
  'john@test.com', // email
  '+1234567890',   // phoneNumber
  'Password@123'   // password (min 8 chars, 1 uppercase, 1 number)
);

// Demo Mode: User saved to localStorage
// Supabase Mode: User created in Supabase auth + user table
```

### Login (Both Modes)

```typescript
const { login, user, isDemoMode } = useAuth();

await login('john@test.com', 'Password@123');

// Returns user object with role, name, email
// Role-based redirect:
// - 'admin' → /dashboard
// - 'partner' → /merchants
// - 'support' → /customers

// isDemoMode indicator tells you which system is active
if (isDemoMode) {
  console.log('Using localStorage');
} else {
  console.log('Using Supabase');
}
```

### Logout (Both Modes)

```typescript
const { logout } = useAuth();

await logout();
// Clears session from both localStorage and browser storage
```

---

## 📊 localStorage Service API

All functions available when using demo mode:

### User Management

```typescript
import { 
  createUser, 
  findUserByEmail, 
  getAllUsers, 
  deleteUser 
} from '@/services/localStorage.service';

// Create user
createUser(
  'John',
  'Doe',
  'john@test.com',
  '+1234567890',
  'Password@123',
  'admin' // role: 'admin' | 'partner' | 'support'
);

// Find user by email
const user = findUserByEmail('john@test.com');

// Get all users
const users = getAllUsers(); // Returns users without passwords

// Delete user
deleteUser('user_id');
```

### Session Management

```typescript
import { createSession, verifySession } from '@/services/localStorage.service';

// Create session
const token = createSession(userId);

// Verify session
const isValid = verifySession(sessionToken);
```

### Data Management

```typescript
import { 
  seedTestData, 
  exportData, 
  importData,
  getStatistics,
  clearAllData
} from '@/services/localStorage.service';

// Seed 4 test users
seedTestData();

// Export data as JSON
const data = exportData();
downloadJson(data, 'users-backup.json');

// Import data from JSON
importData(jsonData);

// Get stats
const stats = getStatistics();
console.log(stats.totalUsers, stats.totalAdmins, stats.activeSessions);

// Clear all data (with confirmation)
clearAllData();
```

---

## 🎛️ Admin Database Manager

Access at `/admin/local-db` (admin role only)

### Features

1. **Statistics Dashboard**
   - Total Users count
   - Admin Users count
   - Partner Users count
   - Active Sessions count

2. **Control Panel**
   - **Refresh** - Reload statistics
   - **Seed Test Data** - Create 4 test accounts
   - **Export** - Download JSON backup
   - **Clear All** - Delete all data

3. **Users Table**
   - View all users with details
   - Delete individual users
   - See user roles and status

4. **Test Credentials Display**
   - Quick reference for test accounts
   - Pre-seeded passwords

---

## 🧪 Testing Scenarios

### Scenario 1: Quick Local Testing

```bash
# 1. No configuration needed
bun run dev

# 2. Go to http://localhost:3000/login

# 3. Login with test account
test: admin@test.local
pass: Admin@123
```

### Scenario 2: Test Registration

```bash
# 1. Go to http://localhost:3000/register

# 2. Fill form and submit
# In demo mode: User saved to localStorage
# Can login immediately

# 3. Test validation
# - Try weak password (fails)
# - Try duplicate email (allowed in demo)
# - Required fields (enforced)
```

### Scenario 3: Switch from Local to Supabase

```bash
# 1. Start in local mode
# - Login to http://localhost:3000
# - Create test users

# 2. Setup Supabase
# - Get keys from dashboard
# - Update .env.local

# 3. Restart server
# - Ctrl+C
# - bun run dev

# 4. System automatically switches
# - localStorage data remains
# - New registrations go to Supabase
# - Can manually switch back with localStorage flag
```

---

## 🛠️ Troubleshooting

### Problem: Page shows "Demo Mode" but I configured Supabase

**Solution:** Environment variables aren't loaded

1. Restart server: Press Ctrl+C, then `bun run dev`
2. Check `.env.local` has correct keys
3. No quotes around values

### Problem: Can't login with test accounts

**Solution:** Test data not seeded

1. Go to `/admin/local-db`
2. Click "Seed Test Data" button
3. Go back to login

### Problem: Data disappeared after refresh

**Solution:** localStorage was cleared

1. Go to `/admin/local-db`
2. Click "Seed Test Data"
3. Export backup before testing: Click "Export"

### Problem: Getting "Supabase not configured" after setting env vars

**Solution:** Server not restarted

1. Stop server: Ctrl+C
2. Restart: `bun run dev`
3. Wait for build to complete
4. Try again

---

## 📝 Code Examples

### Using Unified Auth in a Component

```typescript
'use client';

import { useAuth } from '@/hooks/useUnifiedAuth';
import { useRouter } from 'next/navigation';

export default function MyComponent() {
  const router = useRouter();
  const { user, login, logout, isDemoMode, loading } = useAuth();

  // Show demo indicator
  if (isDemoMode) {
    return <div>📱 Demo Mode Active</div>;
  }

  // Protect route
  if (!loading && !user) {
    router.push('/login');
    return null;
  }

  return (
    <div>
      <p>Welcome {user?.name}</p>
      <p>Role: {user?.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Checking Auth Mode in API Routes

```typescript
// api/example/route.ts
import { useAuth } from '@/hooks/useUnifiedAuth';

export async function GET(request: Request) {
  const { user, isDemoMode } = useAuth();

  if (isDemoMode) {
    // Handle demo mode
    return Response.json({ mode: 'demo', user });
  } else {
    // Handle Supabase mode
    return Response.json({ mode: 'production', user });
  }
}
```

---

## 🔄 Migration Guide: Local to Supabase

### Step 1: Export Local Data

1. Go to `/admin/local-db`
2. Click "Export" button
3. Save the JSON file

### Step 2: Setup Supabase

1. Follow [Supabase Setup Guide](./SUPABASE_SETUP_GUIDE_AR.md)
2. Update `.env.local` with your keys
3. Restart development server

### Step 3: Import Data (Optional)

1. Go to `/admin/local-db`
2. Click "Import" button (if you want to migrate data)
3. Select saved JSON file
4. Users are created in Supabase

### Step 4: Verify

1. Try registering new user
2. Check Supabase dashboard
3. User should appear in `users` table

---

## 🚀 Production Deployment

### before Deploying to Production

1. **Remove demo routes** (optional)
   - `/demo`
   - `/admin/local-db`
   - Hide localStorage-only UI

2. **Set Environment Variables**
   ```
   In your hosting platform (Vercel, etc.):
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY (backend only)
   ```

3. **Disable localStorage Override**
   - Remove any `localStorage.setItem('force_local_auth', ...)` calls
   - System will use Supabase automatically

4. **Test Production Build**
   ```bash
   bun run build
   bun run start
   ```

---

## 📚 Related Documentation

- [Supabase Setup Guide](./SUPABASE_SETUP_GUIDE_AR.md)
- [Adjil Sync Guide](./ADJIL_SYNC_GUIDE.md)
- [Validation Schema](./src/utils/validation.ts)
- [Auth Context Types](./src/types/index.ts)

---

## ❓ FAQ

**Q: Can I use localStorage in production?**
A: Not recommended. localStorage is per-device; users can't share data across devices.

**Q: What if Supabase goes down?**
A: System has fallback to localStorage for basic auth, but additional features won't work.

**Q: How do I force demo mode?**
A: `localStorage.setItem('force_local_auth', 'true')` in console.

**Q: Can I delete test data?**
A: Yes, go to `/admin/local-db` → "Clear All" (with confirmation).

**Q: Is localStorage data encrypted?**
A: No, it's plain text. Demo mode only; not for production data.

**Q: Can I use both at the same time?**
A: No, the hook picks one mode. You can switch by restarting the server.

---

## 📞 Support

For issues:
1. Check console for error messages
2. Visit `/admin/local-db` to inspect data
3. Check `.env.local` file exists and has correct keys
4. Review this guide's troubleshooting section

---

**Last Updated:** 2024
**Version:** 1.0.0
