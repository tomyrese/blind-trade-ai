// Responsive Candlestick Chart Component
import React, { useState } from 'react';
import { View, Text, LayoutChangeEvent, StyleSheet } from 'react-native';
import { TrendingUp } from 'lucide-react-native';

interface CandlestickData {
  high: number;
  low: number;
  open: number;
  close: number;
}

interface CandlestickChartProps {
  data: CandlestickData[];
  symbol: string;
  currentPrice: number;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  data,
  symbol,
  currentPrice,
}) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const chartHeight = 220;

  const onLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const candleWidth = containerWidth > 0 ? (containerWidth - 32) / data.length : 0;

  // Calculate min and max for scaling
  const allValues = data.flatMap(d => [d.high, d.low]);
  const minPrice = Math.min(...allValues);
  const maxPrice = Math.max(...allValues);
  const priceRange = maxPrice - minPrice;

  const getY = (price: number) => {
    return chartHeight - ((price - minPrice) / priceRange) * chartHeight;
  };

  return (
    <View onLayout={onLayout} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.symbol}>{symbol}</Text>
          <Text style={styles.price}>
            ${currentPrice.toLocaleString()}
          </Text>
        </View>
        <View style={styles.changeContainer}>
          <View style={styles.changeRow}>
            <TrendingUp size={16} color="#10b981" />
            <Text style={styles.changeText}>
              +2.5%
            </Text>
          </View>
          <Text style={styles.timeLabel}>24h</Text>
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartArea}>
        {containerWidth > 0 && data.map((candle, index) => {
          const isGreen = candle.close >= candle.open;
          const bodyTop = getY(Math.max(candle.open, candle.close));
          const bodyBottom = getY(Math.min(candle.open, candle.close));
          const bodyHeight = Math.max(bodyBottom - bodyTop, 2);

          return (
            <View
              key={index}
              style={{
                position: 'absolute',
                left: index * candleWidth + 8,
                width: candleWidth - 2,
              }}
            >
              {/* Wick */}
              <View
                style={{
                  position: 'absolute',
                  left: (candleWidth - 2) / 2 - 1,
                  top: getY(candle.high),
                  width: 2,
                  height: Math.max(getY(candle.low) - getY(candle.high), 1),
                  backgroundColor: isGreen ? '#10b981' : '#ef4444',
                  opacity: 0.6,
                }}
              />
              {/* Body */}
              <View
                style={{
                  position: 'absolute',
                  top: bodyTop,
                  width: candleWidth - 2,
                  height: bodyHeight,
                  backgroundColor: isGreen ? '#10b981' : '#ef4444',
                  borderRadius: 1,
                }}
              />
            </View>
          );
        })}
      </View>

      {/* Time labels */}
      <View style={styles.footer}>
        <Text style={styles.footerLabel}>00:00</Text>
        <Text style={styles.footerLabel}>12:00</Text>
        <Text style={styles.footerLabel}>24:00</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#1f2937',
    borderRadius: 16,
    marginVertical: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  symbol: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
  },
  price: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: 'bold',
  },
  changeContainer: {
    alignItems: 'flex-end',
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  changeText: {
    color: '#10b981',
    fontSize: 14,
    marginLeft: 4,
    fontWeight: 'bold',
  },
  timeLabel: {
    color: '#9ca3af',
    fontSize: 10,
    marginTop: 4,
  },
  chartArea: {
    height: 220,
    position: 'relative',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  footerLabel: {
    color: '#6b7280',
    fontSize: 10,
    fontWeight: '500',
  },
});
