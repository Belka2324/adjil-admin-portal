/**
 * TEST CREDENTIALS FOR ADMIN PORTAL ADJIL
 * 
 * Use these credentials to test the admin portal during development.
 * These are for LOCAL TESTING ONLY and should not be used in production.
 */

// Test Admin Users
export const TEST_ADMIN_USERS = [
  {
    role: 'admin',
    email: 'admin@adjil.com',
    password: 'AdminPass123!',
    name: 'System Administrator',
    description: 'Full system access - can manage all users, merchants, transactions, disputes',
  },
  {
    role: 'partner',
    email: 'partner@adjil.com',
    password: 'PartnerPass123!',
    name: 'Bank Partner',
    description: 'Bank partner access - can view merchant data and transactions',
  },
  {
    role: 'support',
    email: 'support@adjil.com',
    password: 'SupportPass123!',
    name: 'Support Team',
    description: 'Support team access - limited access for customer support',
  },
];

/**
 * SETUP INSTRUCTIONS
 * 
 * 1. Go to your Supabase Dashboard (https://app.supabase.com)
 * 2. Select your ADJIL project
 * 3. Navigate to Authentication > Users
 * 4. Click "Invite" and enter the test user emails above
 * 5. Users will receive invite links - you can also manually set passwords
 * 
 * Alternative: Create users via SQL in Supabase SQL Editor:
 * 
 * -- Create Admin User
 * INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
 * VALUES (
 *   'admin@adjil.com',
 *   crypt('AdminPass123!', gen_salt('bf')),
 *   NOW()
 * );
 * 
 * -- Then add user profile in users table:
 * INSERT INTO users (id, email, name, role, is_active)
 * SELECT id, email, 'System Administrator', 'admin', true
 * FROM auth.users
 * WHERE email = 'admin@adjil.com';
 */

// For development/testing, you can also bypass authentication:
export const USE_MOCK_AUTH = false; // Set to true for mock auth in development

export const MOCK_ADMIN_USER = {
  id: 'mock-admin-001',
  email: 'admin@adjil.com',
  name: 'System Administrator',
  role: 'admin' as const,
  avatar: undefined,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
