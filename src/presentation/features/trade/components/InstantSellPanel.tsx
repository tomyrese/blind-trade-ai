// Instant Sell Panel
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { TrendingDown } from 'lucide-react-native';
import { formatPrice } from '../../../../shared/utils/formatters';

interface InstantSellPanelProps {
  symbol: string;
  currentPrice: number;
  balance: number;
  onSell: () => void;
}

export const InstantSellPanel: React.FC<InstantSellPanelProps> = ({
  symbol,
  currentPrice,
  balance,
  onSell,
}) => {
  const estimatedValue = balance * currentPrice;

  return (
    <View
      style={{
        backgroundColor: '#fef2f2',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#fecaca',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View
          style={{
            backgroundColor: '#fee2e2',
            borderRadius: 8,
            padding: 8,
          }}
        >
          <TrendingDown size={20} color="#ef4444" />
        </View>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#991b1b', marginLeft: 12 }}>
          Bán Nhanh
        </Text>
      </View>

      <View style={{ gap: 8, marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 13, color: '#6b7280' }}>Số Dư Hiện Tại:</Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#111827' }}>
            {balance} {symbol.split('/')[0]}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 13, color: '#6b7280' }}>Giá Thị Trường:</Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#111827' }}>
            {formatPrice(currentPrice)}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 13, color: '#6b7280' }}>Giá Trị Ước Tính:</Text>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#10b981' }}>
            {formatPrice(estimatedValue)}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={onSell}
        style={{
          backgroundColor: '#ef4444',
          paddingVertical: 12,
          borderRadius: 8,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 14 }}>
          Bán Toàn Bộ
        </Text>
      </Pressable>
    </View>
  );
};
