export const formatCurrency = (amount: number, currency: 'VND' | 'USD' = 'VND'): string => {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount / 24000); // Approximate conversion: 24,000 VND = 1 USD
  }
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};
