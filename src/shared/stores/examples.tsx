// Example Usage of Stores

/**
 * PORTFOLIO STORE EXAMPLES
 */

// Basic usage
import { usePortfolioStore, usePortfolioAssets } from '../stores';

// Get all assets
const AllAssets = () => {
  const assets = usePortfolioAssets();
  return <>{/* Render assets */}</>;
};

// Add asset
const AddAssetButton = () => {
  const addAsset = usePortfolioStore((state) => state.addAsset);
  
  const handleAdd = () => {
    addAsset({
      symbol: 'BTC/USDT',
      amount: 0.5,
      averagePrice: 45000,
      currentPrice: 46000,
    });
  };
  
  return <button onClick={handleAdd}>Add BTC</button>;
};

// Update prices from API
const PriceUpdater = () => {
  const updatePrices = usePortfolioStore((state) => state.updatePrices);
  
  const fetchAndUpdate = async () => {
    // Fetch from API
    const prices = { 'BTC/USDT': 47000, 'ETH/USDT': 2600 };
    updatePrices(prices);
  };
  
  return <button onClick={fetchAndUpdate}>Update Prices</button>;
};

/**
 * MARKET PRICES STORE EXAMPLES
 */

import { useMarketPricesStore, usePriceBySymbol } from '../stores';

// Get specific price
const BitcoinPrice = () => {
  const btcPrice = usePriceBySymbol('BTC/USDT');
  return <>{btcPrice?.price || 'N/A'}</>;
};

// Update price
const UpdatePrice = () => {
  const updatePrice = useMarketPricesStore((state) => state.updatePrice);
  
  updatePrice('BTC/USDT', { price: 47000, change24h: 2.5 });
};

/**
 * ORDERS STORE EXAMPLES
 */

import { useOrdersStore, usePendingOrders, useRecentOrders } from '../stores';

// Create order
const CreateOrder = () => {
  const addOrder = useOrdersStore((state) => state.addOrder);
  
  const handleBuy = () => {
    addOrder({
      type: 'buy',
      symbol: 'BTC/USDT',
      price: 47000,
      quantity: 0.5,
      total: 23500,
      status: 'pending',
    });
  };
  
  return <button onClick={handleBuy}>Buy BTC</button>;
};

// Get pending orders
const PendingOrdersList = () => {
  const pending = usePendingOrders();
  return <>{/* Render pending orders */}</>;
};

// Cancel order
const CancelOrderButton = ({ orderId }: { orderId: string }) => {
  const cancelOrder = useOrdersStore((state) => state.cancelOrder);
  return <button onClick={() => cancelOrder(orderId)}>Cancel</button>;
};

/**
 * UI PREFERENCES STORE EXAMPLES
 */

import { useUIPreferencesStore, useTheme, useLanguage } from '../stores';

// Theme selector
const ThemeToggle = () => {
  const theme = useTheme();
  const setTheme = useUIPreferencesStore((state) => state.setTheme);
  
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  );
};

// Notifications toggle
const NotificationsToggle = () => {
  const enabled = useUIPreferencesStore((state) => state.notificationsEnabled);
  const toggle = useUIPreferencesStore((state) => state.toggleNotifications);
  
  return (
    <switch value={enabled} onValueChange={toggle}>
      Notifications {enabled ? 'On' : 'Off'}
    </switch>
  );
};

/**
 * ADVANCED SELECTORS
 */

// Custom selector - Total portfolio profit
const useTotalProfit = () => {
  return usePortfolioStore((state) => {
    return state.assets.reduce((total, asset) => {
      const profit = (asset.currentPrice - asset.averagePrice) * asset.amount;
      return total + profit;
    }, 0);
  });
};

// Custom selector - Orders by type
const useOrdersByType = (type: 'buy' | 'sell') => {
  return useOrdersStore((state) => state.orders.filter((o) => o.type === type));
};

// Custom selector - Price change
const usePriceChange = (symbol: string) => {
  return useMarketPricesStore((state) => state.prices[symbol]?.change24h ?? 0);
};
