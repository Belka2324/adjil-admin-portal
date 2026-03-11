# Test Users & Credentials

## 🧪 Test Admin Users for Simulation

Use these credentials to test the ADMIN PORTAL ADJIL application:

### Admin (Full Access)
```
Email:    admin@adjil.com
Password: AdminPass123!
Role:     Admin (full system access)
```

### Partner (Bank Partner Access)
```
Email:    partner@adjil.com
Password: PartnerPass123!
Role:     Partner (merchant and transaction data)
```

### Support (Limited Support Access)
```
Email:    support@adjil.com
Password: SupportPass123!
Role:     Support (customer support access)
```

---

## ✅ Setup Instructions

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to: https://app.supabase.com
   - Select your "ADJIL" project

2. **Create Users via Auth Panel**
   - Go to: **Authentication** → **Users**
   - Click **"Invite"** button
   - Enter the email addresses above
   - Users will receive invitation links

3. **Set Passwords**
   - Users can set passwords via the invitation link
   - Or you can set them directly in the Supabase Auth panel

4. **Create User Profiles**
   - After creating auth users, add them to the `users` table
   - Go to: **SQL Editor** and run:

   ```sql
   -- Create Admin User Profile
   INSERT INTO users (id, email, name, role, is_active, created_at, updated_at)
   SELECT id, email, 'System Administrator', 'admin', true, NOW(), NOW()
   FROM auth.users
   WHERE email = 'admin@adjil.com';

   -- Create Partner User Profile
   INSERT INTO users (id, email, name, role, is_active, created_at, updated_at)
   SELECT id, email, 'Bank Partner', 'partner', true, NOW(), NOW()
   FROM auth.users
   WHERE email = 'partner@adjil.com';

   -- Create Support User Profile
   INSERT INTO users (id, email, name, role, is_active, created_at, updated_at)
   SELECT id, email, 'Support Team', 'support', true, NOW(), NOW()
   FROM auth.users
   WHERE email = 'support@adjil.com';
   ```

### Option 2: Using SQL Editor Directly

Run this SQL in your Supabase SQL Editor:

```sql
-- Create Auth Users (if using Supabase Auth)
-- Note: You may need to use the Auth UI or API to create these properly

-- Create User Profiles in your users table:
INSERT INTO users (id, email, name, role, is_active, created_at, updated_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'admin@adjil.com', 'System Administrator', 'admin', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'partner@adjil.com', 'Bank Partner', 'partner', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'support@adjil.com', 'Support Team', 'support', true, NOW(), NOW());
```

---

## 🔐 Security Notes

⚠️ **These are TEST credentials only!**

- ✅ Use for local development and testing
- ✅ Use for demonstration purposes
- ❌ Do NOT use in production
- ❌ Do NOT commit real credentials to version control
- ❌ Change all passwords before deploying to production

---

## 🧪 Testing Each Role

### Admin User Tests
```
Login: admin@adjil.com / AdminPass123!

Can access:
✅ Dashboard (view all statistics)
✅ Customers (view, verify, block)
✅ Merchants (approve, suspend)
✅ Transactions (view, refund, export)
✅ Disputes (resolve, escalate)
✅ Settings (RBAC, audit logs, system config)
```

### Partner User Tests
```
Login: partner@adjil.com / PartnerPass123!

Can access:
✅ Merchants (view own/associated merchants)
✅ Transactions (view, export)
✅ Disputes (respond, view)
✅ Analytics (limited)
❌ Settings (not accessible)
```

### Support User Tests
```
Login: support@adjil.com / SupportPass123!

Can access:
✅ Customers (view, moderate)
✅ Merchants (view only)
✅ Transactions (view)
✅ Disputes (create support tickets, view)
✅ Audit Logs (view for support purposes)
❌ Customer blocking/suspension
```

---

## 🔄 Resetting Test Users

If you need to reset test users:

1. **Delete from Supabase Dashboard**
   - Authentication → Users → Select user → Delete

2. **Or via SQL:**
   ```sql
   DELETE FROM users WHERE email IN ('admin@adjil.com', 'partner@adjil.com', 'support@adjil.com');
   ```

3. **Then recreate** using the instructions above

---

## 📝 Sample Test Data

After logging in, you can:
- Create test merchants
- Add test customers  
- Generate test transactions
- Create test disputes
- Monitor audit logs

All test data will be stored in your Supabase database.

---

**Version**: 1.0.0  
**Last Updated**: March 6, 2026
