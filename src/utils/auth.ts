/**
 * Authentication and Authorization Helpers
 */

import { UserRole } from '@/types';

export const ROLE_ROUTES: Record<UserRole, string> = {
  [UserRole.ADMIN]: '/dashboard',
  [UserRole.PARTNER]: '/merchants',
  [UserRole.SUPPORT]: '/customers',
};

/**
 * Get the default dashboard route for a user based on their role
 */
export function getDefaultRoute(role: UserRole): string {
  return ROLE_ROUTES[role] || '/dashboard';
}

/**
 * Check if a user role has access to a route
 */
export function hasAccessToRoute(role: UserRole, route: string): boolean {
  const adminOnlyRoutes = ['/dashboard', '/users', '/settings'];
  const partnerOnlyRoutes = ['/merchants', '/transactions'];

  if (adminOnlyRoutes.includes(route)) {
    return role === UserRole.ADMIN;
  }

  if (partnerOnlyRoutes.includes(route)) {
    return role === UserRole.ADMIN || role === UserRole.PARTNER;
  }

  // Support users have read-only access to most routes
  return true;
}

/**
 * Verify that a user has the required role
 */
export function requireRole(userRole: UserRole | null, requiredRole: UserRole | UserRole[]): boolean {
  if (!userRole) return false;

  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }

  return userRole === requiredRole;
}
