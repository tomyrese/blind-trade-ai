// Mock candlestick data generator
export const generateMockCandlesticks = (basePrice: number, count: number = 24) => {
  const candles = [];
  let currentPrice = basePrice;

  for (let i = 0; i < count; i++) {
    const volatility = basePrice * 0.02; // 2% volatility
    const change = (Math.random() - 0.5) * 2 * volatility;

    const open = currentPrice;
    const close = currentPrice + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;

    candles.push({
      open: parseFloat(open.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
    });

    currentPrice = close;
  }

  return candles;
};

export const mockChartData = generateMockCandlesticks(45000, 24);
