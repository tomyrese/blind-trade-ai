// UI Preferences Store
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createMMKVStorage } from '../storage/mmkv';

export type Theme = 'light' | 'dark' | 'auto';
export type Language = 'en' | 'vi';
export type ChartType = 'candlestick' | 'line' | 'area';

interface UIPreferencesState {
  theme: Theme;
  language: Language;
  defaultChartType: ChartType;
  notificationsEnabled: boolean;
  marketAlertsEnabled: boolean;
  priceChangeAlertsEnabled: boolean;
  dailySummaryEnabled: boolean;
  biometricEnabled: boolean;
  currency: string;

  // Actions
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  setDefaultChartType: (chartType: ChartType) => void;
  toggleNotifications: () => void;
  toggleMarketAlerts: () => void;
  togglePriceChangeAlerts: () => void;
  toggleDailySummary: () => void;
  toggleBiometric: () => void;
  setCurrency: (currency: string) => void;
  resetPreferences: () => void;
}

const defaultPreferences = {
  theme: 'auto' as Theme,
  language: 'vi' as Language,
  defaultChartType: 'candlestick' as ChartType,
  notificationsEnabled: true,
  marketAlertsEnabled: true,
  priceChangeAlertsEnabled: true,
  dailySummaryEnabled: true,
  biometricEnabled: false,
  currency: 'USDT',
};

export const useUIPreferencesStore = create<UIPreferencesState>()(
  persist(
    (set) => ({
      ...defaultPreferences,

      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setDefaultChartType: (defaultChartType) => set({ defaultChartType }),
      toggleNotifications: () =>
        set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),
      toggleMarketAlerts: () =>
        set((state) => ({ marketAlertsEnabled: !state.marketAlertsEnabled })),
      togglePriceChangeAlerts: () =>
        set((state) => ({ priceChangeAlertsEnabled: !state.priceChangeAlertsEnabled })),
      toggleDailySummary: () =>
        set((state) => ({ dailySummaryEnabled: !state.dailySummaryEnabled })),
      toggleBiometric: () =>
        set((state) => ({ biometricEnabled: !state.biometricEnabled })),
      setCurrency: (currency) => set({ currency }),
      resetPreferences: () => set(defaultPreferences),
    }),
    {
      name: 'ui-preferences-storage',
      storage: createJSONStorage(() => createMMKVStorage()),
    }
  )
);

// Selectors
export const useTheme = () => useUIPreferencesStore((state) => state.theme);
export const useLanguage = () => useUIPreferencesStore((state) => state.language);
export const useNotificationsEnabled = () =>
  useUIPreferencesStore((state) => state.notificationsEnabled);
export const useCurrency = () => useUIPreferencesStore((state) => state.currency);
