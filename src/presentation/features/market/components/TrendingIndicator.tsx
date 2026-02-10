// Trending Arrow Indicator
import React from 'react';
import { View, Text } from 'react-native';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';

interface TrendingIndicatorProps {
  value: number;
  size?: 'small' | 'medium' | 'large' | number;
}

export const TrendingIndicator: React.FC<TrendingIndicatorProps> = ({ value, size = 'medium' }) => {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  
  const iconSize = typeof size === 'number' ? size : size === 'small' ? 14 : size === 'medium' ? 18 : 24;
  const textSize = typeof size === 'number' ? size * 0.8 : size === 'small' ? 12 : size === 'medium' ? 14 : 18;

  const color = isNeutral ? '#6b7280' : isPositive ? '#10b981' : '#ef4444';
  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Icon size={iconSize} color={color} />
      <Text style={{ color, fontSize: textSize, fontWeight: '600', marginLeft: 4 }}>
        {isPositive ? '+' : ''}{value.toFixed(2)}%
      </Text>
    </View>
  );
};
