import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createMMKVStorage } from '../storage/mmkv';
import { UserProfile } from '../../domain/models/User';

export interface TransactionItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    image?: any;
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'deposit' | 'withdraw';
  amount: number;
  currency: string;
  date: string; // ISO string
  status: 'success' | 'failed' | 'pending';
  items?: TransactionItem[];
  description?: string;
}

// ... (Interface definitions unchanged)

interface TransactionHistoryState {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  clearHistory: () => void;
}

export const useTransactionHistoryStore = create<TransactionHistoryState>()(
  persist(
    (set) => ({
      transactions: [],
      addTransaction: (transaction) => set((state) => ({ 
        transactions: [transaction, ...state.transactions] 
      })),
      clearHistory: () => set({ transactions: [] }),
    }),
    {
      name: 'transaction-history-storage',
      storage: createJSONStorage(() => createMMKVStorage()),
    }
  )
);
