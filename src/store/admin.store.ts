import { create } from 'zustand';
import { AppUser } from '@/types';
import { localStorageUtils } from '@/utils/storage';

interface AuthStore {
  user: AppUser | null;
  isAuthenticated: boolean;
  setUser: (user: AppUser) => void;
  clearUser: () => void;
  updateUser: (updates: Partial<AppUser>) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user: AppUser) => {
    set({ user, isAuthenticated: true });
    localStorageUtils.set('auth_user', user);
  },

  clearUser: () => {
    set({ user: null, isAuthenticated: false });
    localStorageUtils.remove('auth_user');
  },

  updateUser: (updates: Partial<AppUser>) => {
    set((state) => {
      if (!state.user) return state;
      const updated = { ...state.user, ...updates };
      localStorageUtils.set('auth_user', updated);
      return { user: updated };
    });
  },
}));

// Admin data store
interface AdminStore {
  selectedCustomerId: string | null;
  selectedMerchantId: string | null;
  selectedDisputeId: string | null;
  setSelectedCustomer: (customerId: string | null) => void;
  setSelectedMerchant: (merchantId: string | null) => void;
  setSelectedDispute: (disputeId: string | null) => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  selectedCustomerId: null,
  selectedMerchantId: null,
  selectedDisputeId: null,

  setSelectedCustomer: (customerId: string | null) => {
    set({ selectedCustomerId: customerId });
  },

  setSelectedMerchant: (merchantId: string | null) => {
    set({ selectedMerchantId: merchantId });
  },

  setSelectedDispute: (disputeId: string | null) => {
    set({ selectedDisputeId: disputeId });
  },
}));

// Notification store
interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],

  addNotification: (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }],
    }));

    if (notification.duration) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, notification.duration);
    }
  },

  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },
}));
