// Presentation Layer - Market Card Component
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Market } from '../../../../domain/models/Market';
import { formatCurrency, formatPercentage, formatPrice } from '../../../../shared/utils/formatters';

interface MarketCardProps {
  market: Market;
  onPress?: (market: Market) => void;
}

export const MarketCard: React.FC<MarketCardProps> = ({ market, onPress }) => {
  const isPositive = market.priceChangePercentage24h >= 0;
  const changeColor = isPositive ? 'text-green-500' : 'text-red-500';

  return (
    <Pressable
      className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-3 border border-gray-200 dark:border-gray-700"
      onPress={() => onPress?.(market)}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View>
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            {market.symbol}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {market.name}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatPrice(market.currentPrice)}
          </Text>
          <Text className={`text-sm font-medium ${changeColor}`}>
            {formatPercentage(market.priceChangePercentage24h)}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <View>
          <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Market Cap
          </Text>
          <Text className="text-sm font-medium text-gray-900 dark:text-white">
            {formatCurrency(market.marketCap)}
          </Text>
        </View>
        <View>
          <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Volume 24h
          </Text>
          <Text className="text-sm font-medium text-gray-900 dark:text-white">
            {formatCurrency(market.volume24h)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};
