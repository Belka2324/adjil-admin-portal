import { z } from 'zod';

/**
 * Validation schemas for forms and data validation
 */

// Login validation schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Registration validation schema
export const registrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .refine(
      (password) => /[A-Z]/.test(password),
      'Password must contain at least one uppercase letter'
    )
    .refine(
      (password) => /[0-9]/.test(password),
      'Password must contain at least one number'
    ),
  confirmPassword: z.string().min(8, 'Confirm password is required'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  phoneNumber: z
    .string()
    .min(8, 'Phone number must be at least 8 digits')
    .regex(/^\d+$/, 'Phone number must contain only digits'),
  role: z.enum(['admin', 'partner', 'support', 'ceo']).default('support'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

// User creation schema
export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['admin', 'partner', 'support']),
  isActive: z.boolean(),
});

export type UserFormData = z.infer<typeof userSchema>;

// Customer schema
export const customerSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z
    .string()
    .min(8, 'Phone number must be at least 8 digits')
    .regex(/^\d+$/, 'Phone number must contain only digits'),
  documentType: z.string(),
  documentNumber: z.string(),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  zipCode: z.string(),
  country: z.string(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

// Dispute resolution schema
export const disputeResolutionSchema = z.object({
  resolution: z.string().min(10, 'Resolution must be at least 10 characters'),
  status: z.enum(['resolved', 'closed']),
  refundAmount: z.number().optional(),
});

export type DisputeResolutionData = z.infer<typeof disputeResolutionSchema>;

// Filter validation
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// Validate IndexedDB keys
export const validateIndexedDBKey = (key: string): boolean => {
  const validKeys = [
    'user',
    'customers',
    'merchants',
    'transactions',
    'subscriptions',
    'disputes',
    'auditLogs',
    'settings',
  ];
  return validKeys.includes(key);
};
