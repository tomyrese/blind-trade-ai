// Optimized PriceTicker Component
import React, { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { TrendingIndicator } from './TrendingIndicator';
import { Market } from '../../../../domain/models/Market';
import { formatPrice } from '../../../../shared/utils/formatters';

interface PriceTickerProps {
  market: Market;
  onPress?: (market: Market) => void;
}

// Memoized component - only re-renders when props change
export const PriceTicker = memo<PriceTickerProps>(({ market, onPress }) => {
  const isPositive = market.priceChangePercentage24h >= 0;

  const handlePress = React.useCallback(() => {
    onPress?.(market);
  }, [market, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
      }}
    >
      {/* Symbol */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#111827' }}>
          {market.symbol}
        </Text>
        <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
          {market.name}
        </Text>
      </View>

      {/* Price & Change */}
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>
          {formatPrice(market.currentPrice)}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
          <TrendingIndicator value={market.priceChangePercentage24h} size={12} />
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: isPositive ? '#10b981' : '#ef4444',
              marginLeft: 4,
            }}
          >
            {isPositive ? '+' : ''}
            {market.priceChangePercentage24h.toFixed(2)}%
          </Text>
        </View>
      </View>
    </Pressable>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function - only re-render if these changed
  return (
    prevProps.market.id === nextProps.market.id &&
    prevProps.market.currentPrice === nextProps.market.currentPrice &&
    prevProps.market.priceChangePercentage24h === nextProps.market.priceChangePercentage24h &&
    prevProps.onPress === nextProps.onPress
  );
});

PriceTicker.displayName = 'PriceTicker';
