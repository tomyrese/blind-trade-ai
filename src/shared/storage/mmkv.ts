// MMKV Storage Setup
import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({
  id: 'blindtradeai-storage',
  encryptionKey: 'your-encryption-key-here', // In production, use secure key
});

// Zustand persistence with MMKV
export const createMMKVStorage = () => ({
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  removeItem: (name: string) => {
    storage.delete(name);
  },
});
