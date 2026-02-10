// Portfolio Store
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createMMKVStorage } from '../storage/mmkv';

export interface Asset {
  id: string;
  name: string;
  symbol: string; // e.g., "PKM-025"
  rarity: string;
  amount: number;
  value: number; // Current value in VND
}

interface PortfolioState {
  assets: Asset[];
  totalValue: number;
  
  // Actions
  addAsset: (asset: Asset) => void;
  removeAsset: (id: string) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  updatePrices: (prices: Record<string, number>) => void;
  clearPortfolio: () => void;
  seedPortfolio: () => void;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      assets: [],
      totalValue: 0,

      addAsset: (asset) =>
        set((state) => {
          const exists = state.assets.find((a) => a.id === asset.id);
          if (exists) {
            return {
              assets: state.assets.map((a) =>
                a.id === asset.id ? { ...a, amount: a.amount + asset.amount } : a
              ),
            };
          }
          const newAssets = [asset, ...state.assets];
          const totalValue = newAssets.reduce((sum, a) => sum + (a.value * a.amount), 0);
          return { assets: newAssets, totalValue };
        }),

      removeAsset: (id) =>
        set((state) => {
          const newAssets = state.assets.filter((a) => a.id !== id);
          const totalValue = newAssets.reduce((sum, a) => sum + (a.value * a.amount), 0);
          return { assets: newAssets, totalValue };
        }),

      updateAsset: (id, updates) =>
        set((state) => {
          const newAssets = state.assets.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          );
          const totalValue = newAssets.reduce((sum, a) => sum + (a.value * a.amount), 0);
          return { assets: newAssets, totalValue };
        }),

      updatePrices: (prices) =>
        set((state) => {
          const updatedAssets = state.assets.map((asset) => ({
            ...asset,
            value: prices[asset.symbol] ?? asset.value,
          }));

          const totalValue = updatedAssets.reduce(
            (sum, asset) => sum + asset.amount * asset.value,
            0
          );

          return { assets: updatedAssets, totalValue };
        }),

      clearPortfolio: () => set({ assets: [], totalValue: 0 }),
      
      seedPortfolio: () => {
        const { mockCards } = require('../utils/cardData');
        const demoAssets = mockCards.map((card: any) => ({
          id: `demo-${card.id}`,
          name: card.name,
          symbol: card.symbol || `PKM-${card.id.padStart(3, '0')}`,
          rarity: card.rarity,
          amount: Math.floor(Math.random() * 3) + 1,
          value: card.value
        }));
        
        const totalValue = demoAssets.reduce((sum: number, a: any) => sum + (a.value * a.amount), 0);
        set({ assets: demoAssets, totalValue });
      },
    }),
    {
      name: 'portfolio-storage',
      storage: createJSONStorage(() => createMMKVStorage()),
    }
  )
);

// Selectors
export const usePortfolioAssets = () => usePortfolioStore((state) => state.assets);
export const usePortfolioValue = () => usePortfolioStore((state) => state.totalValue);
export const useAssetById = (id: string) =>
  usePortfolioStore((state) => state.assets.find((a) => a.id === id));
