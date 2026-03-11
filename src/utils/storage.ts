/**
 * Storage utilities for LocalStorage and IndexedDB management
 * Matches the data structure from the original ADJIL project
 */

// IndexedDB configuration
const DB_NAME = 'ADJIL_ADMIN_DB';
const DB_VERSION = 1;

const VALID_STORES = {
  user: 'user',
  customers: 'customers',
  merchants: 'merchants',
  transactions: 'transactions',
  subscriptions: 'subscriptions',
  disputes: 'disputes',
  auditLogs: 'auditLogs',
  settings: 'settings',
};

// Initialize IndexedDB
export const initIndexedDB = async (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;

      // Create object stores if they don't exist
      Object.values(VALID_STORES).forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      });
    };
  });
};

// LocalStorage utilities
export const localStorageUtils = {
  get: (key: string): any => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage: ${key}`, error);
      return null;
    }
  },

  set: (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage: ${key}`, error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage: ${key}`, error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage', error);
    }
  },
};

// IndexedDB utilities
export const indexedDBUtils = {
  get: async (storeName: string, key: string): Promise<any> => {
    try {
      const db = await initIndexedDB();
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      return new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Error reading from IndexedDB (${storeName}):`, error);
      return null;
    }
  },

  set: async (storeName: string, data: any): Promise<void> => {
    try {
      const db = await initIndexedDB();
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      return new Promise((resolve, reject) => {
        const request = store.put(data);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Error writing to IndexedDB (${storeName}):`, error);
    }
  },

  delete: async (storeName: string, key: string): Promise<void> => {
    try {
      const db = await initIndexedDB();
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      return new Promise((resolve, reject) => {
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Error deleting from IndexedDB (${storeName}):`, error);
    }
  },

  getAll: async (storeName: string): Promise<any[]> => {
    try {
      const db = await initIndexedDB();
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Error reading all from IndexedDB (${storeName}):`, error);
      return [];
    }
  },

  clear: async (storeName: string): Promise<void> => {
    try {
      const db = await initIndexedDB();
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      return new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Error clearing IndexedDB (${storeName}):`, error);
    }
  },
};

// Session storage for temporary data
export const sessionStorageUtils = {
  get: (key: string): any => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from sessionStorage: ${key}`, error);
      return null;
    }
  },

  set: (key: string, value: any): void => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to sessionStorage: ${key}`, error);
    }
  },

  remove: (key: string): void => {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from sessionStorage: ${key}`, error);
    }
  },
};
