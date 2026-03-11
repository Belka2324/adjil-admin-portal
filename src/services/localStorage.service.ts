/**
 * Local Storage Service
 * Provides a simple in-memory database using browser localStorage
 * Perfect for testing before setting up Supabase
 */

import { AppUser, UserRole } from '@/types';

interface StorageUser extends AppUser {
  password?: string; // Store password hash only locally
}

interface StorageData {
  users: StorageUser[];
  sessions: { [userId: string]: string };
  lastSyncTime: string;
}

const STORAGE_KEY = 'adjil_admin_local_db';
const DEFAULT_DATA: StorageData = {
  users: [],
  sessions: {},
  lastSyncTime: new Date().toISOString(),
};

/**
 * Get all data from localStorage
 */
function getStorageData(): StorageData {
  try {
    if (typeof window === 'undefined') return DEFAULT_DATA;
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : DEFAULT_DATA;
  } catch (error) {
    console.error('Error reading localStorage:', error);
    return DEFAULT_DATA;
  }
}

/**
 * Save all data to localStorage
 */
function saveStorageData(data: StorageData): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
}

/**
 * Simple password hashing (for local testing only - NOT for production!)
 */
function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Verify password
 */
function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

/**
 * Create a new user
 */
export function createUser(
  firstName: string,
  lastName: string,
  email: string,
  phoneNumber: string,
  password: string,
  role: UserRole = UserRole.SUPPORT
): StorageUser | null {
  const data = getStorageData();

  // Check if user already exists
  if (data.users.some((u) => u.email === email)) {
    throw new Error('User with this email already exists');
  }

  const newUser: StorageUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`,
    phoneNumber,
    role,
    avatar: undefined,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    password: hashPassword(password), // Store hashed password
  };

  data.users.push(newUser);
  saveStorageData(data);

  // Remove password from returned object
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword as StorageUser;
}

/**
 * Find user by email
 */
export function findUserByEmail(email: string): StorageUser | undefined {
  const data = getStorageData();
  return data.users.find((u) => u.email === email);
}

/**
 * Find user by ID
 */
export function findUserById(id: string): StorageUser | undefined {
  const data = getStorageData();
  return data.users.find((u) => u.id === id);
}

/**
 * Get all users
 */
export function getAllUsers(): StorageUser[] {
  const data = getStorageData();
  return data.users.map(({ password, ...user }) => user as StorageUser);
}

/**
 * Verify user credentials
 */
export function verifyUserCredentials(
  email: string,
  password: string
): StorageUser | null {
  const user = findUserByEmail(email);

  if (!user || !user.password) {
    return null;
  }

  if (verifyPassword(password, user.password)) {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as StorageUser;
  }

  return null;
}

/**
 * Update user
 */
export function updateUser(
  id: string,
  updates: Partial<StorageUser>
): StorageUser | null {
  const data = getStorageData();
  const userIndex = data.users.findIndex((u) => u.id === id);

  if (userIndex === -1) {
    return null;
  }

  const updatedUser = {
    ...data.users[userIndex],
    ...updates,
    id: data.users[userIndex].id, // Don't allow ID changes
    updatedAt: new Date().toISOString(),
  };

  data.users[userIndex] = updatedUser;
  saveStorageData(data);

  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword as StorageUser;
}

/**
 * Delete user
 */
export function deleteUser(id: string): boolean {
  const data = getStorageData();
  const initialLength = data.users.length;

  data.users = data.users.filter((u) => u.id !== id);

  if (data.users.length < initialLength) {
    saveStorageData(data);
    return true;
  }

  return false;
}

/**
 * Create session
 */
export function createSession(userId: string): string {
  const data = getStorageData();
  const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  data.sessions[userId] = sessionToken;
  data.lastSyncTime = new Date().toISOString();
  saveStorageData(data);

  return sessionToken;
}

/**
 * Verify session
 */
export function verifySession(userId: string): boolean {
  const data = getStorageData();
  return !!data.sessions[userId];
}

/**
 * Delete session
 */
export function deleteSession(userId: string): void {
  const data = getStorageData();
  delete data.sessions[userId];
  saveStorageData(data);
}

/**
 * Clear all data (for testing)
 */
export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Export all data
 */
export function exportData(): StorageData {
  return getStorageData();
}

/**
 * Import data (for backup/restore)
 */
export function importData(data: StorageData): void {
  if (!data.users || !data.sessions) {
    throw new Error('Invalid data format');
  }
  saveStorageData(data);
}

/**
 * Get statistics
 */
export function getStatistics() {
  const data = getStorageData();
  return {
    totalUsers: data.users.length,
    activeUsers: data.users.filter((u) => u.isActive).length,
    activeSessions: Object.keys(data.sessions).length,
    adminUsers: data.users.filter((u) => u.role === 'admin').length,
    partnerUsers: data.users.filter((u) => u.role === 'partner').length,
    supportUsers: data.users.filter((u) => u.role === 'support').length,
    lastSyncTime: data.lastSyncTime,
  };
}

/**
 * Seed default test data (only creates users if they don't exist)
 */
export function seedTestData(): void {
  try {
    // Check if we already have users - if so, don't re-seed
    const existingData = getStorageData();
    if (existingData.users.length > 0) {
      console.log('⚠️ Data already exists, skipping seed');
      return;
    }

    // Create test users (only if no users exist)
    createUser(
      'أحمد',
      'محمود',
      'admin@test.local',
      '+966501234567',
      'Admin@123',
      UserRole.ADMIN
    );

    createUser(
      'فاطمة',
      'علي',
      'partner@test.local',
      '+966502345678',
      'Partner@123',
      UserRole.PARTNER
    );

    createUser(
      'محمد',
      'عبدالله',
      'support@test.local',
      '+966503456789',
      'Support@123',
      UserRole.SUPPORT
    );

    createUser(
      'سارة',
      'خالد',
      'user@test.local',
      '+966504567890',
      'User@123',
      UserRole.SUPPORT
    );

    console.log('✅ Test data seeded successfully');
  } catch (error) {
    console.error('Error seeding test data:', error);
  }
}
