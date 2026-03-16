/**
 * RBAC (Role-Based Access Control) Configuration
 * Defines permissions for Admin, Partner, and Support roles
 */

import { UserRole } from '@/types';

// Re-export UserRole for convenience
export { UserRole };

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.CEO]: [
    // Full system access - all permissions
    'view_users',
    'create_user',
    'edit_user',
    'delete_user',
    'suspend_user',
    'activate_user',
    'verify_documents',
    // Merchant Management
    'view_merchants',
    'create_merchant',
    'approve_merchant',
    'suspend_merchant',
    'delete_merchant',
    'view_merchant_details',
    // Customer Management
    'view_customers',
    'create_customer',
    'block_customer',
    'unblock_customer',
    'delete_customer',
    'view_customer_documents',
    // Transaction Management
    'view_transactions',
    'create_transaction',
    'refund_transaction',
    'delete_transaction',
    'export_transactions',
    // Dispute Management
    'view_disputes',
    'create_dispute',
    'resolve_dispute',
    'escalate_dispute',
    'delete_dispute',
    // Audit & Reporting
    'view_audit_logs',
    'generate_reports',
    'view_analytics',
    // System Settings
    'manage_settings',
    'manage_roles',
    'view_system_logs',
    'manage_users',
    'full_admin_access',
  ],
  [UserRole.ADMIN]: [
    // User Management
    'view_users',
    'create_user',
    'edit_user',
    'delete_user',
    'suspend_user',
    'verify_documents',
    // Merchant Management
    'view_merchants',
    'approve_merchant',
    'suspend_merchant',
    'view_merchant_details',
    // Customer Management
    'view_customers',
    'block_customer',
    'unblock_customer',
    'view_customer_documents',
    // Transaction Management
    'view_transactions',
    'refund_transaction',
    'export_transactions',
    // Dispute Management
    'view_disputes',
    'resolve_dispute',
    'escalate_dispute',
    // Audit & Reporting
    'view_audit_logs',
    'generate_reports',
    'view_analytics',
    // System Settings
    'manage_settings',
    'manage_roles',
    'view_system_logs',
  ],
  [UserRole.PARTNER]: [
    'view_merchants',
    'view_merchant_details',
    'view_transactions',
    'view_own_transactions',
    'export_transactions',
    'view_disputes',
    'respond_to_dispute',
    'view_analytics',
  ],
  [UserRole.SUPPORT]: [
    'view_users',
    'view_customers',
    'view_merchants',
    'view_transactions',
    'view_disputes',
    'create_support_ticket',
    'view_audit_logs',
    'moderate_content',
  ],
  [UserRole.CUSTOMER]: [
    'view_own_transactions',
    'view_analytics',
  ],
  [UserRole.MERCHANT]: [
    'view_own_transactions',
    'view_analytics',
    'view_merchant_details',
  ],
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.CEO]: 'CEO with full system access and all administrative controls',
  [UserRole.ADMIN]: 'Full system access and administrative controls',
  [UserRole.PARTNER]: 'Bank partner access to merchant and transaction data',
  [UserRole.SUPPORT]: 'Customer support team with limited data access',
  [UserRole.CUSTOMER]: 'End user / customer of the BNPL service',
  [UserRole.MERCHANT]: 'Retailer / merchant providing products or services',
};

// Portal routing based on role
export const ROLE_PORTAL: Record<UserRole, string> = {
  [UserRole.CEO]: '/ceo/home',
  [UserRole.ADMIN]: '/admin/home',
  [UserRole.PARTNER]: '/partner/home',
  [UserRole.SUPPORT]: '/support/home',
  [UserRole.CUSTOMER]: '/customers/home',
  [UserRole.MERCHANT]: '/merchants/home',
};

// Check if role can access a specific portal
export const canAccessPortal = (userRole: UserRole, portalPath: string): boolean => {
  const allowedPortal = ROLE_PORTAL[userRole];
  if (!allowedPortal) return false;
  
  // CEO can access all portals
  if (userRole === UserRole.CEO) {
    return true;
  }
  
  return portalPath.startsWith(allowedPortal);
};

// Permission checking utility
export const hasPermission = (role: UserRole, permission: string): boolean => {
  // CEO has all permissions
  if (role === UserRole.CEO) {
    return true;
  }
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
};

export const getPermissions = (role: UserRole): string[] => {
  if (role === UserRole.CEO) {
    // Return all possible permissions for CEO
    return Object.values(ROLE_PERMISSIONS).flat();
  }
  return ROLE_PERMISSIONS[role] || [];
};
