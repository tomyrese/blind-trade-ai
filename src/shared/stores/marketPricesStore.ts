// Market Prices Cache Store
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createMMKVStorage } from '../storage/mmkv';

interface PriceData {
  price: number;
  change24h: number;
  timestamp: number;
}

interface MarketPricesState {
  prices: Record<string, PriceData>;
  lastUpdate: number;

  // Actions
  updatePrice: (symbol: string, data: Omit<PriceData, 'timestamp'>) => void;
  updatePrices: (updates: Record<string, Omit<PriceData, 'timestamp'>>) => void;
  getPrice: (symbol: string) => number | null;
  clearPrices: () => void;
}

export const useMarketPricesStore = create<MarketPricesState>()(
  persist(
    (set, get) => ({
      prices: {},
      lastUpdate: Date.now(),

      updatePrice: (symbol, data) =>
        set((state) => ({
          prices: {
            ...state.prices,
            [symbol]: { ...data, timestamp: Date.now() },
          },
          lastUpdate: Date.now(),
        })),

      updatePrices: (updates) =>
        set((state) => {
          const newPrices = { ...state.prices };
          Object.entries(updates).forEach(([symbol, data]) => {
            newPrices[symbol] = { ...data, timestamp: Date.now() };
          });
          return { prices: newPrices, lastUpdate: Date.now() };
        }),

      getPrice: (symbol) => {
        const priceData = get().prices[symbol];
        return priceData?.price ?? null;
      },

      clearPrices: () => set({ prices: {}, lastUpdate: Date.now() }),
    }),
    {
      name: 'market-prices-storage',
      storage: createJSONStorage(() => createMMKVStorage()),
    }
  )
);

// Selectors
export const usePriceBySymbol = (symbol: string) =>
  useMarketPricesStore((state) => state.prices[symbol]);
export const useAllPrices = () => useMarketPricesStore((state) => state.prices);
export const useLastPriceUpdate = () => useMarketPricesStore((state) => state.lastUpdate);
