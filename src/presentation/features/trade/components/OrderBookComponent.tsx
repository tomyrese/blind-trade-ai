// Order Book Component
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { OrderBook } from '../../../../shared/utils/mockOrderData';
import { formatPrice } from '../../../../shared/utils/formatters';

interface OrderBookProps {
  orderBook: OrderBook;
}

export const OrderBookComponent: React.FC<OrderBookProps> = ({ orderBook }) => {
  return (
    <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 12 }}>
        Sổ Lệnh
      </Text>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {/* Bids (Buy Orders) */}
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: 'row',
              paddingBottom: 8,
              borderBottomWidth: 1,
              borderBottomColor: '#e5e7eb',
            }}
          >
            <Text style={{ flex: 1, fontSize: 11, color: '#6b7280', fontWeight: '600' }}>
              Giá
            </Text>
            <Text style={{ flex: 1, fontSize: 11, color: '#6b7280', fontWeight: '600', textAlign: 'right' }}>
              SL
            </Text>
          </View>
          <ScrollView style={{ maxHeight: 200 }}>
            {orderBook.bids.slice(0, 8).map((bid, i) => (
              <View key={i} style={{ flexDirection: 'row', paddingVertical: 6 }}>
                <Text style={{ flex: 1, fontSize: 12, color: '#10b981', fontWeight: '600' }}>
                  {formatPrice(bid.price)}
                </Text>
                <Text style={{ flex: 1, fontSize: 12, color: '#6b7280', textAlign: 'right' }}>
                  {bid.quantity}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Asks (Sell Orders) */}
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: 'row',
              paddingBottom: 8,
              borderBottomWidth: 1,
              borderBottomColor: '#e5e7eb',
            }}
          >
            <Text style={{ flex: 1, fontSize: 11, color: '#6b7280', fontWeight: '600' }}>
              Giá
            </Text>
            <Text style={{ flex: 1, fontSize: 11, color: '#6b7280', fontWeight: '600', textAlign: 'right' }}>
              SL
            </Text>
          </View>
          <ScrollView style={{ maxHeight: 200 }}>
            {orderBook.asks.slice(0, 8).map((ask, i) => (
              <View key={i} style={{ flexDirection: 'row', paddingVertical: 6 }}>
                <Text style={{ flex: 1, fontSize: 12, color: '#ef4444', fontWeight: '600' }}>
                  {formatPrice(ask.price)}
                </Text>
                <Text style={{ flex: 1, fontSize: 12, color: '#6b7280', textAlign: 'right' }}>
                  {ask.quantity}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
};
