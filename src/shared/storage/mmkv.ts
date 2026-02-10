// MMKV Storage Setup
import { MMKV } from 'react-native-mmkv';

// Lazy initialization to prevent crashes if JSI is unavailable (e.g. Chrome Debugger)
let storage: MMKV | null = null;
let memoryStorage: MemoryStorage | null = null;

class MemoryStorage {
  private _data: Map<string, string> = new Map();

  set(key: string, value: string) {
    this._data.set(key, value);
  }

  getString(key: string) {
    return this._data.get(key);
  }

  delete(key: string) {
    this._data.delete(key);
  }

  clearAll() {
    this._data.clear();
  }
}

const getStorage = () => {
  if (storage) return storage;
  if (memoryStorage) return memoryStorage; // Return existing memory fallback if already active
  
  try {
    storage = new MMKV({
      id: 'blindtrade-v3-clean',
    });
    return storage;
  } catch (error) {
    console.info('[BlindTradeAI] ℹ️ Remote Debugger Detected: using in-memory storage (persistence disabled).');
    memoryStorage = new MemoryStorage();
    return memoryStorage;
  }
};

/**
 * Super Safe MMKV Adapter for Zustand
 * This adapter explicitly logs serialization errors to help identify 
 * why the storage might be reported as "unavailable" by the middleware.
 */
export const createMMKVStorage = () => ({
  getItem: (name: string) => {
    try {
      const store = getStorage();
      const value = store.getString(name);
      return value ?? null;
    } catch (error) {
      console.warn('❌ Storage.getItem failed:', error);
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    try {
      // Ensure we are actually saving a string
      if (typeof value !== 'string') {
        console.error('❌ Storage.setItem: value is not a string!', typeof value);
        return;
      }
      
      const store = getStorage();
      store.set(name, value);
    } catch (error) {
      console.error('❌ Storage.setItem failed:', error);
    }
  },
  removeItem: (name: string) => {
    try {
      const store = getStorage();
      store.delete(name);
    } catch (error) {
      console.warn('❌ Storage.removeItem failed:', error);
    }
  },
});
