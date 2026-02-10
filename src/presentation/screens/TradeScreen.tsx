// Trade Screen
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShoppingCart, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle } from 'lucide-react-native';
import { OrderBookComponent } from '../features/trade/components/OrderBookComponent';
import { InstantSellPanel } from '../features/trade/components/InstantSellPanel';
import { BuySellModal } from '../features/trade/components/BuySellModal';
import { generateMockOrderBook, mockMarketOrders, MarketOrder } from '../../shared/utils/mockOrderData';
import { TradeFormData } from '../../shared/validation/tradeSchema';
import { formatPrice } from '../../shared/utils/formatters';

export const TradeScreen: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'buy' | 'sell'>('buy');

  // Mock data
  const symbol = 'BTC/USDT';
  const currentPrice = 45000;
  const balance = 0.45; 
  const orderBook = generateMockOrderBook(currentPrice);

  const handleOpenModal = (type: 'buy' | 'sell') => {
    setModalType(type);
    setModalVisible(true);
  };

  const handleTradeSubmit = (data: TradeFormData) => {
    console.log(`${modalType.toUpperCase()} Order:`, data);
    setModalVisible(false);
  };

  const handleInstantSell = () => {
    console.log('Instant sell all:', balance);
  };

  const renderOrderItem = ({ item }: { item: MarketOrder }) => {
    const isBuy = item.type === 'buy';
    const Icon = isBuy ? TrendingUp : TrendingDown;
    const color = isBuy ? '#10b981' : '#ef4444';

    const StatusIcon = item.status === 'filled' ? CheckCircle : item.status === 'pending' ? Clock : XCircle;
    const statusColor = item.status === 'filled' ? '#10b981' : item.status === 'pending' ? '#f59e0b' : '#6b7280';

    return (
      <View style={[styles.orderItem, { borderLeftColor: color }]}>
        <View style={styles.orderHeader}>
          <View style={styles.orderTypeContainer}>
            <Icon size={18} color={color} />
            <Text style={styles.orderTitle}>{isBuy ? 'MUA' : 'BÁN'} {item.symbol}</Text>
          </View>
          <View style={styles.statusContainer}>
            <StatusIcon size={14} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status === 'filled' ? 'Hoàn Thành' : item.status === 'pending' ? 'Chờ' : 'Hủy'}
            </Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Giá:</Text>
            <Text style={styles.detailValue}>{formatPrice(item.price)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Số Lượng:</Text>
            <Text style={styles.detailValue}>{item.quantity}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tổng:</Text>
            <Text style={[styles.detailValue, { color: color, fontWeight: 'bold' }]}>{formatPrice(item.total)}</Text>
          </View>
        </View>
        <Text style={styles.timestamp}>{item.timestamp.toLocaleTimeString()}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList<MarketOrder>
        data={mockMarketOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
        ListHeaderComponent={
          <>
            <View style={styles.mainContent}>
              <OrderBookComponent orderBook={orderBook} />
              
              <View style={styles.actionRow}>
                <Pressable
                  onPress={() => handleOpenModal('buy')}
                  style={[styles.mainButton, { backgroundColor: '#10b981' }]}
                >
                  <Text style={styles.buttonText}>Mua</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleOpenModal('sell')}
                  style={[styles.mainButton, { backgroundColor: '#ef4444' }]}
                >
                  <Text style={styles.buttonText}>Bán</Text>
                </Pressable>
              </View>

              <InstantSellPanel
                symbol={symbol}
                currentPrice={currentPrice}
                balance={balance}
                onSell={handleInstantSell}
              />

              <Text style={styles.sectionTitle}>Lệnh Gần Đây</Text>
            </View>
          </>
        }
        contentContainerStyle={styles.listPadding}
      />

      <BuySellModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        type={modalType}
        symbol={symbol}
        currentPrice={currentPrice}
        onSubmit={handleTradeSubmit}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  mainContent: {
    padding: 16,
    paddingTop: 30,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  mainButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
    marginBottom: 12,
  },
  listPadding: {
    paddingBottom: 24,
  },
  orderItem: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  orderDetails: {
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'right',
  },
});
