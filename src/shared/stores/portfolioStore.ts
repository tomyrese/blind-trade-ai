// Portfolio Store
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createMMKVStorage } from '../storage/mmkv';

export interface Asset {
  id: string;
  name: string;
  symbol: string; // e.g., "PKM-025"
  rarity: string;
  rarityLabel?: string;
  amount: number;
  value: number; // Current market value in VND
  purchasePrice: number; // Price at which it was acquired
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
  addItems: (items: Asset[]) => void;
  removeFromPortfolio: (id: string) => void;
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
        // Take a diverse set of 10 cards (e.g., every other card or a slice of interesting ones)
        // For simplicity and quality, we'll take a specific slice or map carefully
        const demoAssets = mockCards.slice(0, 10).map((card: any, index: number) => ({
          id: `demo-${card.id}-${index}`, // Unique ID
          name: card.name,
          symbol: card.symbol || `PKM-${card.id.padStart(3, '0')}`,
          rarity: card.rarity,
          amount: index === 0 ? 3 : (index < 4 ? 2 : 1), // Varied amounts
          value: card.value
        }));
        
        const totalValue = demoAssets.reduce((sum: number, a: any) => sum + (a.value * a.amount), 0);
        set({ assets: demoAssets, totalValue });
      },
      addItems: (newItems: Asset[]) => {
        set((state) => {
          const updatedAssets = [...state.assets];
          
          newItems.forEach((item: Asset) => {
            const existingIndex = updatedAssets.findIndex(a => a.id === item.id || a.symbol === item.symbol);
            if (existingIndex > -1) {
              updatedAssets[existingIndex] = {
                ...updatedAssets[existingIndex],
                amount: updatedAssets[existingIndex].amount + item.amount,
                value: item.value // Update to latest price
              };
            } else {
              updatedAssets.push(item);
            }
          });
          
          const totalValue = updatedAssets.reduce((sum, a) => sum + (a.value * a.amount), 0);
          return { assets: updatedAssets, totalValue };
        });
      },
      removeFromPortfolio: (id) =>
        set((state) => {
          const asset = state.assets.find(a => a.id === id);
          if (!asset) return state;
          
          let newAssets;
          if (asset.amount > 1) {
            newAssets = state.assets.map(a => 
              a.id === id ? { ...a, amount: a.amount - 1 } : a
            );
          } else {
            newAssets = state.assets.filter(a => a.id !== id);
          }
          
          const totalValue = newAssets.reduce((sum, a) => sum + (a.value * a.amount), 0);
          return { assets: newAssets, totalValue };
        }),
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
