import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ShoppingBag, Trash2, Minus, Plus, CreditCard } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useCartStore } from '../../shared/stores/cartStore';
import { useUserStore } from '../../shared/stores/userStore';
import { useTranslation } from '../../shared/utils/translations';
import { CardItem } from '../features/tradeup/components/CardItem';
import { formatCurrency } from '../../shared/utils/currency';

export const CartScreen: React.FC = () => {
  const navigation = useNavigation();
  const { items, removeFromCart, updateQuantity, clearCart } = useCartStore();
  const total = items.reduce((sum, item) => sum + (item.card.value * item.quantity), 0);
  const currency = useUserStore((state) => state.profile.currency);
  const { t } = useTranslation();

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.cartItemWrapper}>
        <View style={styles.cardContainer}>
            <CardItem card={item.card} size="small" showActions={false} />
        </View>
        
        <View style={styles.itemContent}>
            <View style={styles.itemHeader}>
                <Text style={styles.itemName} numberOfLines={1}>{item.card.name}</Text>
                <Pressable onPress={() => removeFromCart(item.card.id)} hitSlop={10} style={styles.deleteBtn}>
                    <Trash2 size={18} color="#94a3b8" />
                </Pressable>
            </View>
            
            <Text style={styles.itemRarity}>{item.card.rarityLabel || item.card.rarity}</Text>
            
            <View style={styles.itemFooter}>
                <Text style={styles.itemPrice}>{formatCurrency(item.card.value, currency)}</Text>
                
                <View style={styles.quantityControls}>
                    <Pressable 
                        onPress={() => updateQuantity(item.card.id, item.quantity - 1)}
                        style={[styles.qtyBtn, item.quantity <= 1 && styles.qtyBtnDisabled]}
                        disabled={item.quantity <= 1}
                    >
                        <Minus size={14} color={item.quantity <= 1 ? "#cbd5e1" : "#475569"} />
                    </Pressable>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <Pressable 
                        onPress={() => updateQuantity(item.card.id, item.quantity + 1)}
                        style={styles.qtyBtn}
                    >
                        <Plus size={14} color="#475569" />
                    </Pressable>
                </View>
            </View>
        </View>
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ChevronLeft size={24} color="#1e293b" />
        </Pressable>
        <Text style={styles.headerTitle}>{t('cart_title')} ({items.length})</Text>
        {items.length > 0 ? (
             <Pressable onPress={clearCart} style={[styles.iconButton, { borderColor: '#fee2e2' }]}>
                <Trash2 size={20} color="#ef4444" />
            </Pressable>
        ) : <View style={{ width: 40 }} />}
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.card.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
                <ShoppingBag size={48} color="#cbd5e1" fill="#f1f5f9" />
            </View>
            <Text style={styles.emptyTitle}>{t('cart_empty_title')}</Text>
            <Text style={styles.emptyDesc}>{t('cart_empty_desc')}</Text>
          </View>
        }
      />

      {items.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t('total_price')}</Text>
            <View style={styles.totalValueContainer}>
                <Text style={styles.totalAmount}>{formatCurrency(total, currency)}</Text>
                <Text style={styles.vatText}>{t('vat_included')}</Text>
            </View>
          </View>
          <Pressable style={styles.checkoutBtn}>
            <CreditCard size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.checkoutBtnText}>{t('checkout_now')}</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#f8fafc' 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  listContent: { 
    padding: 16, 
    paddingBottom: 120, // Space for footer
    minHeight: '100%',
  },
  emptyState: { 
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: 80,
    padding: 24,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#1e293b', 
    marginBottom: 8 
  },
  emptyDesc: { 
    fontSize: 15, 
    color: '#64748b', 
    textAlign: 'center',
    lineHeight: 22,
  },
  
  // Cart Item Components
  cartItemWrapper: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    alignItems: 'center', // Vertically align thumbnail and content
  },
  cardContainer: { 
    width: 80,
    height: 80,
    marginRight: 16,
    // Add shadow to the thumbnail itself for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    backgroundColor: 'transparent',
  },
  itemContent: {
    flex: 1,
    height: 80, // Match thumbnail height to distribute content evenly
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: '#0f172a',
    flex: 1,
    marginRight: 8,
    lineHeight: 20,
    letterSpacing: -0.3,
  },
  deleteBtn: {
    padding: 6,
    marginTop: -6, // Pull up to align with top
    marginRight: -6, // Pull right
    opacity: 0.6,
  },
  itemRarity: { 
    fontSize: 11, 
    fontWeight: '700', 
    color: '#64748b', 
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: -2, // Pull closer to title
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end', // Align price baseline with controls
  },
  itemPrice: { 
    fontSize: 17, 
    fontWeight: '900', 
    color: '#ef4444', // Use primary red for price
    letterSpacing: -0.5,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  qtyBtn: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  qtyBtnDisabled: {
    backgroundColor: '#f1f5f9',
    elevation: 0,
    opacity: 0.5,
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginHorizontal: 10,
    minWidth: 16,
    textAlign: 'center',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#ffffff',
    padding: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 10,
  },
  totalRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 16 
  },
  totalLabel: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#64748b',
  },
  totalValueContainer: {
    alignItems: 'flex-end',
  },
  totalAmount: { 
    fontSize: 24, 
    fontWeight: '900', 
    color: '#ef4444',
    letterSpacing: -0.5,
  },
  vatText: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  checkoutBtn: {
    backgroundColor: '#ef4444',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  checkoutBtnText: { 
    color: '#ffffff', 
    fontSize: 16, 
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
