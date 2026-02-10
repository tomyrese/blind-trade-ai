// Store Hooks - Centralized export
export {
  usePortfolioStore,
  usePortfolioAssets,
  usePortfolioValue,
  useAssetBySymbol,
} from './portfolioStore';

export {
  useMarketPricesStore,
  usePriceBySymbol,
  useAllPrices,
  useLastPriceUpdate,
} from './marketPricesStore';

export {
  useOrdersStore,
  useAllOrders,
  usePendingOrders,
  useOrdersBySymbol,
  useRecentOrders,
} from './ordersStore';

export {
  useUIPreferencesStore,
  useTheme,
  useLanguage,
  useNotificationsEnabled,
  useCurrency,
} from './uiPreferencesStore';

// Re-export types
export type { Asset } from './portfolioStore';
export type { Order } from './ordersStore';
export type { Theme, Language, ChartType } from './uiPreferencesStore';
