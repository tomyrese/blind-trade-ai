/**
 * Utility functions for formatting market data
 */

export const formatVND = (value: number): string => {
  return `${value.toLocaleString('vi-VN')} ₫`;
};

export const formatCurrency = (value: number): string => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B ₫`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M ₫`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K ₫`;
  }
  return formatVND(value);
};

export const formatPercentage = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

export const formatPrice = (value: number): string => {
  return formatVND(value);
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};
