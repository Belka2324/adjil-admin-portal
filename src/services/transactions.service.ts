/**
 * Transactions Service
 * Handles fetching and managing transactions with payment status
 */

import { Transaction } from '@/types';

const STORAGE_KEY = 'adjil_transactions';

// Sample data for demo/development
const sampleTransactions: Transaction[] = [
  {
    id: 'txn_001',
    customerId: 'cust_001',
    merchantId: 'merch_001',
    amount: 25000,
    currency: 'DZD',
    status: 'completed',
    paymentMethod: 'card',
    cardLastFour: '4521',
    description: 'Purchase at Electronics Store',
    merchantName: 'متجر الإلكترونيات',
    customerName: 'أحمد محمد',
    paid: true,
    paidAt: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 'txn_002',
    customerId: 'cust_002',
    merchantId: 'merch_002',
    amount: 15000,
    currency: 'DZD',
    status: 'completed',
    paymentMethod: 'BNPL',
    description: 'BNPL Purchase - Furniture',
    merchantName: 'متجر الأثاث',
    customerName: 'فاطمة علي',
    paid: false,
    createdAt: '2024-01-16T14:00:00Z',
    updatedAt: '2024-01-16T14:00:00Z',
  },
  {
    id: 'txn_003',
    customerId: 'cust_003',
    merchantId: 'merch_003',
    amount: 8000,
    currency: 'DZD',
    status: 'pending',
    paymentMethod: 'wallet',
    description: 'Wallet Transfer',
    merchantName: 'متجر المواد الغذائية',
    customerName: 'محمد عبدالله',
    paid: false,
    createdAt: '2024-01-17T09:00:00Z',
    updatedAt: '2024-01-17T09:00:00Z',
  },
  {
    id: 'txn_004',
    customerId: 'cust_001',
    merchantId: 'merch_001',
    amount: 35000,
    currency: 'DZD',
    status: 'completed',
    paymentMethod: 'card',
    cardLastFour: '4521',
    description: 'Electronics - Laptop',
    merchantName: 'متجر الإلكترونيات',
    customerName: 'أحمد محمد',
    paid: true,
    paidAt: '2024-01-18T16:45:00Z',
    createdAt: '2024-01-18T16:00:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
  },
  {
    id: 'txn_005',
    customerId: 'cust_004',
    merchantId: 'merch_004',
    amount: 12000,
    currency: 'DZD',
    status: 'failed',
    paymentMethod: 'card',
    cardLastFour: '1234',
    description: 'Failed Transaction',
    merchantName: 'متجر الملابس',
    customerName: 'سارة خالد',
    paid: false,
    createdAt: '2024-01-19T11:00:00Z',
    updatedAt: '2024-01-19T11:00:00Z',
  },
];

/**
 * Get transactions from localStorage or return sample data
 */
export function getTransactions(): Transaction[] {
  if (typeof window === 'undefined') return sampleTransactions;
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading transactions:', error);
  }
  
  // Initialize with sample data
  saveTransactions(sampleTransactions);
  return sampleTransactions;
}

/**
 * Save transactions to localStorage
 */
function saveTransactions(transactions: Transaction[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving transactions:', error);
  }
}

/**
 * Update transaction payment status
 */
export function updateTransactionPaidStatus(
  transactionId: string, 
  paid: boolean
): Transaction | null {
  const transactions = getTransactions();
  const index = transactions.findIndex(t => t.id === transactionId);
  
  if (index === -1) {
    return null;
  }
  
  const updatedTransaction: Transaction = {
    ...transactions[index],
    paid,
    paidAt: paid ? new Date().toISOString() : undefined,
    updatedAt: new Date().toISOString(),
  };
  
  transactions[index] = updatedTransaction;
  saveTransactions(transactions);
  
  return updatedTransaction;
}

/**
 * Get transaction by ID
 */
export function getTransactionById(id: string): Transaction | undefined {
  const transactions = getTransactions();
  return transactions.find(t => t.id === id);
}

/**
 * Calculate total amount
 */
export function getTotalAmount(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
}
