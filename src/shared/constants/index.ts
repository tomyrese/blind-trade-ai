export const COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  background: {
    light: '#f9fafb',
    dark: '#111827',
  },
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    inverse: '#ffffff',
  },
};

export const REFRESH_INTERVALS = {
  MARKETS: 10000, // 10 seconds
  ORDERS: 5000,   // 5 seconds
  BALANCE: 30000, // 30 seconds
};

export const API_ENDPOINTS = {
  MARKETS: '/api/markets',
  ORDERS: '/api/orders',
  USER: '/api/user',
};
