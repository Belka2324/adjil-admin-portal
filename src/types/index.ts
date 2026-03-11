/**
 * Core Type Definitions for ADMIN PORTAL ADJIL
 */

// User and Authentication Types
export enum UserRole {
  CEO = 'ceo',
  ADMIN = 'admin',
  PARTNER = 'partner',
  SUPPORT = 'support'
}

export interface AppUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  name: string;
  phone_number?: string;
  phone?: string;
  role: 'customer' | 'merchant' | 'admin' | 'partner' | 'support' | 'ceo';
  status?: 'active' | 'inactive' | 'suspended' | 'deleted';
  balance?: number;
  outstanding?: number;
  credit_limit?: number;
  isActive?: boolean;
  created_at?: string;
  updated_at?: string;
  // Legacy camelCase fields (for backward compatibility)
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  is_active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Customer Types
export interface Customer {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  documentType: string;
  documentNumber: string;
  documentVerified: boolean;
  documentImageUrl?: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  status: 'active' | 'suspended' | 'blocked';
  createdAt: string;
  updatedAt: string;
}

// Merchant Types
export interface Merchant {
  id: string;
  userId: string;
  businessName: string;
  businessType: string;
  businessLicense?: string;
  bankName: string;
  bankAccountNumber: string;
  status: 'pending' | 'verified' | 'suspended' | 'blocked';
  monthlyRevenue?: number;
  createdAt: string;
  updatedAt: string;
}

// Transaction Types
export interface Transaction {
  id: string;
  customerId: string;
  merchantId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'card' | 'bank_transfer' | 'wallet' | 'BNPL';
  cardLastFour?: string;
  description: string;
  paid?: boolean;
  paidAt?: string;
  merchantName?: string;
  customerName?: string;
  createdAt: string;
  updatedAt: string;
}

// Subscription Types
export interface Subscription {
  id: string;
  customerId: string;
  merchantId: string;
  planName: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'yearly';
  status: 'active' | 'paused' | 'cancelled';
  nextBillingDate: string;
  createdAt: string;
  updatedAt: string;
}

// Dispute Types
export interface Dispute {
  id: string;
  transactionId: string;
  customerId: string;
  merchantId: string;
  reason: string;
  description: string;
  status: 'open' | 'under_review' | 'resolved' | 'closed';
  resolution?: string;
  amount: number;
  evidence?: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalCustomers: number;
  totalMerchants: number;
  totalTransactions: number;
  totalDisputesOpen: number;
  totalRevenue: number;
  activeMerchants: number;
  suspendedAccounts: number;
}

// Filter and Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: unknown;
}

// API Response Types
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
