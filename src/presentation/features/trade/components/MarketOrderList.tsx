// Market Order Listing
import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { MarketOrder } from '../../../../shared/utils/mockOrderData';
import { formatPrice } from '../../../../shared/utils/formatters';
import { TrendingUp, TrendingDown, Clock, CheckCircle, XCircle } from 'lucide-react-native';

interface MarketOrderListProps {
  orders: MarketOrder[];
}

export const MarketOrderList: React.FC<MarketOrderListProps> = ({ orders }) => {
  const renderOrder = ({ item }: { item: MarketOrder }) => {
    const isBuy = item.type === 'buy';
    const Icon = isBuy ? TrendingUp : TrendingDown;
    const color = isBuy ? '#10b981' : '#ef4444';

    const StatusIcon =
      item.status === 'filled'
        ? CheckCircle
        : item.status === 'pending'
        ? Clock
        : XCircle;

    const statusColor =
      item.status === 'filled'
        ? '#10b981'
        : item.status === 'pending'
        ? '#f59e0b'
        : '#6b7280';

    return (
      <View
        style={{
          backgroundColor: '#ffffff',
          padding: 16,
          marginBottom: 12,
          borderRadius: 12,
          borderLeftWidth: 4,
          borderLeftColor: color,
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon size={20} color={color} />
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827', marginLeft: 8 }}>
              {isBuy ? 'MUA' : 'BÁN'} {item.symbol}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <StatusIcon size={16} color={statusColor} />
            <Text
              style={{
                fontSize: 12,
                color: statusColor,
                fontWeight: '600',
                marginLeft: 4,
                textTransform: 'capitalize',
              }}
            >
              {item.status === 'filled' ? 'Hoàn Thành' : item.status === 'pending' ? 'Chờ' : 'Hủy'}
            </Text>
          </View>
        </View>

        {/* Details */}
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 13, color: '#6b7280' }}>Giá:</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#111827' }}>
              {formatPrice(item.price)}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 13, color: '#6b7280' }}>Số Lượng:</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#111827' }}>
              {item.quantity}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 13, color: '#6b7280' }}>Tổng:</Text>
            <Text style={{ fontSize: 13, fontWeight: 'bold', color: color }}>
              {formatPrice(item.total)}
            </Text>
          </View>
        </View>

        {/* Timestamp */}
        <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 8 }}>
          {item.timestamp.toLocaleString('vi-VN')}
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 12 }}>
        Lệnh Gần Đây
      </Text>
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ color: '#9ca3af', fontSize: 14 }}>Chưa có lệnh nào</Text>
          </View>
        }
      />
    </View>
  );
};
