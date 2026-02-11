import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ChevronLeft, 
  ShoppingBag, 
  Trash2, 
  Minus, 
  Plus, 
  CreditCard, 
  CheckCircle2, 
  AlertTriangle,
  XCircle,
  Activity,
  Package 
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useCartStore, useUserStore, usePortfolioStore, useTranslation, useUIStore } from '../../shared/stores';
import { CardItem } from '../features/tradeup/components/CardItem';
import { formatCurrency } from '../../shared/utils/currency';

export const CartScreen: React.FC = () => {
  const navigation = useNavigation();
  const [checkoutStatus, setCheckoutStatus] = React.useState<'idle' | 'processing' | 'success' | 'insufficient_balance' | 'error'>('idle');
  const { items, removeFromCart, updateQuantity, clearCart } = useCartStore();
  const spend = useUserStore((state: any) => state.spend);
  const addItems = usePortfolioStore((state: any) => state.addItems);
  const total = items.reduce((sum: number, item: any) => sum + (item.card.value * item.quantity), 0);
  const user = useUserStore((state: any) => state.profile);
  const currency = user?.currency || 'VND';
  const { t } = useTranslation();
  const showNotification = useUIStore((state) => state.showNotification);
  const [promoCode, setPromoCode] = React.useState('');
  const [promoApplied, setPromoApplied] = React.useState(false);

  const priceBreakdown = {
      subtotal: total,
      tax: total * 0.08,
      shipping: total > 0 ? (currency === 'VND' ? 30000 : 5) : 0,
      discount: promoApplied ? (total * 0.1) : 0, // 10% discount
  };

  const finalCartTotal = priceBreakdown.subtotal + priceBreakdown.tax + priceBreakdown.shipping - priceBreakdown.discount;

  const handleApplyPromo = () => {
      if (promoCode.toUpperCase() === 'POKE10') {
          setPromoApplied(true);
          showNotification(t('promo_code_applied' as any) || 'Promo applied!', 'success');
      } else {
          showNotification(t('invalid_promo_code' as any) || 'Invalid code', 'error');
      }
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    
    const checkoutItems = items.map(item => ({
        id: item.card.id,
        name: item.card.name,
        symbol: item.card.symbol || '',
        rarity: item.card.rarity,
        quantity: item.quantity,
        price: item.card.value,
        image: item.card.image,
    }));
    
    (navigation as any).navigate('Payment', {
        items: checkoutItems,
        total: finalCartTotal,
        fromCart: true
    });
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.cartItemWrapper}>
        <Pressable 
            style={styles.cardContainer}
            onPress={() => (navigation as any).navigate('CardDetail', { symbol: item.card.symbol })}
        >
            {/* Custom borderless image view */}
             <Image 
                source={typeof item.card.image === 'string' ? { uri: item.card.image } : item.card.image}
                style={styles.cardImage}
                resizeMode="contain"
            />
        </Pressable>
        
        <View style={styles.itemContent}>
            <View style={styles.itemHeader}>
                <Pressable 
                    style={{ flex: 1, marginRight: 8 }}
                    onPress={() => (navigation as any).navigate('CardDetail', { symbol: item.card.symbol })}
                >
                    <Text style={styles.itemName} numberOfLines={1}>{item.card.name}</Text>
                </Pressable>
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
          {/* Promo Code */}
          <View style={styles.promoContainer}>
              <View style={styles.promoInputWrapper}>
                  <Package size={18} color="#94a3b8" style={{ marginRight: 8 }} />
                  <TextInput 
                      style={styles.promoInput} 
                      placeholder={t('enter_promo_code' as any) || 'Enter code'} 
                      value={promoCode}
                      onChangeText={setPromoCode}
                      autoCapitalize="characters"
                      editable={!promoApplied}
                  />
              </View>
              <Pressable 
                  onPress={handleApplyPromo}
                  style={[styles.applyBtn, promoApplied && styles.applyBtnDisabled]}
                  disabled={promoApplied || !promoCode}
              >
                  <Text style={styles.applyBtnText}>{promoApplied ? t('equipped' as any) : t('apply' as any)}</Text>
              </Pressable>
          </View>

          {/* Price Breakdown */}
          <View style={styles.breakdownContainer}>
              <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>{t('subtotal' as any) || 'Subtotal'}</Text>
                  <Text style={styles.breakdownValue}>{formatCurrency(priceBreakdown.subtotal, currency)}</Text>
              </View>
              <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>{t('tax' as any) || 'Tax'}</Text>
                  <Text style={styles.breakdownValue}>{formatCurrency(priceBreakdown.tax, currency)}</Text>
              </View>
              <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>{t('shipping' as any) || 'Shipping'}</Text>
                  <Text style={styles.breakdownValue}>{formatCurrency(priceBreakdown.shipping, currency)}</Text>
              </View>
              {promoApplied && (
                  <View style={styles.breakdownRow}>
                      <Text style={[styles.breakdownLabel, { color: '#10b981' }]}>{t('promo_code' as any)} (POKE10)</Text>
                      <Text style={[styles.breakdownValue, { color: '#10b981' }]}>-{formatCurrency(priceBreakdown.discount, currency)}</Text>
                  </View>
              )}
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t('total_price')}</Text>
            <View style={styles.totalValueContainer}>
                <Text style={styles.totalAmount}>{formatCurrency(finalCartTotal, currency)}</Text>
                <Text style={styles.vatText}>{t('vat_included')}</Text>
            </View>
          </View>
          <Pressable 
            style={[styles.checkoutBtn, checkoutStatus === 'processing' && styles.checkoutBtnDisabled]} 
            onPress={handleCheckout}
            disabled={checkoutStatus === 'processing'}
          >
            {checkoutStatus === 'processing' ? (
                <Activity size={20} color="#ffffff" style={{ marginRight: 8 }} />
            ) : (
                <CreditCard size={20} color="#ffffff" style={{ marginRight: 8 }} />
            )}
            <Text style={styles.checkoutBtnText}>
                {checkoutStatus === 'processing' ? t('loading') : t('checkout_now')}
            </Text>
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
    // Removed border
    // borderWidth: 1,
    // borderColor: '#f1f5f9',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
    alignItems: 'center', 
  },
  cardContainer: { 
    width: 70, 
    height: 100, // Vertical aspect ratio
    marginRight: 16,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6, 
  },
  itemContent: {
    flex: 1,
    height: 90, 
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
  checkoutBtnDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
  },
  promoContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  promoInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  promoInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  applyBtn: {
    paddingHorizontal: 20,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnDisabled: {
    backgroundColor: '#94a3b8',
  },
  applyBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  breakdownContainer: {
    gap: 10,
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  breakdownValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '700',
  },
  notificationOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 1000,
  },
  notificationModal: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 40,
    elevation: 20,
  },
  statusIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  statusSubtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '500',
    lineHeight: 22,
  },
  summaryBox: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  btnRow: {
    flexDirection: 'row',
    width: '100%',
  },
  actionBtn: {
    width: '100%',
    height: 60,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  secondaryBtn: {
    height: 60,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '800',
  },
});
