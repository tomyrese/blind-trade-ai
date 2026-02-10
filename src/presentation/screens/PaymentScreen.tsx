import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ChevronLeft, 
  CreditCard, 
  Wallet, 
  Truck, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCartStore, useUserStore, useTranslation, usePortfolioStore } from '../../shared/stores';
import { formatCurrency } from '../../shared/utils/currency';

export const PaymentScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useTranslation();
  const currency = useUserStore((state) => state.profile?.currency || 'VND');
  const balance = useUserStore((state) => state.profile?.balance || 0);
  const spend = useUserStore((state) => state.spend);
  
  const cartItems = useCartStore((state) => state.items);
  const cartTotal = useCartStore((state) => state.totalPrice());
  const clearCart = useCartStore((state) => state.clearCart);
  const addAsset = usePortfolioStore((state) => state.addAsset);

  // If items passed via route (buy direct), use those, else use cart
  const checkoutItems = route.params?.items || cartItems;
  const totalAmount = route.params?.total || cartTotal;

  const [paymentMethod, setPaymentMethod] = useState<'balance' | 'card' | 'wallet'>('balance');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePay = async () => {
    if (totalAmount === 0) return;

    if (paymentMethod === 'balance' && balance < totalAmount) {
      Alert.alert(t('error'), t('insufficient_balance'));
      return;
    }

    setIsProcessing(true);
    
    // Simulate API delay
    await new Promise<void>(resolve => setTimeout(resolve, 2000));

    try {
      if (paymentMethod === 'balance') {
        spend(totalAmount);
      }

      // Add items to portfolio
      checkoutItems.forEach((item: any) => {
        addAsset({
          id: item.id || `item-${Date.now()}-${Math.random()}`,
          name: item.name,
          symbol: item.symbol || 'PKM',
          rarity: item.rarity || 'common',
          amount: item.quantity || 1,
          value: item.price,
          purchasePrice: item.price,
        });
      });

      if (!route.params?.items) {
          clearCart();
      }

      setIsProcessing(false);
      setShowSuccess(true);
    } catch (error) {
      setIsProcessing(false);
      Alert.alert(t('error'), t('something_went_wrong'));
    }
  };

  if (showSuccess) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIconBox}>
          <CheckCircle2 size={80} color="#10b981" />
        </View>
        <Text style={styles.successTitle}>{t('purchase_success')}</Text>
        <Text style={styles.successSub}>{t('items_added_to_collection')}</Text>
        
        <Pressable 
          style={styles.successButton}
          onPress={() => navigation.navigate('Portfolio')}
        >
          <Text style={styles.successButtonText}>{t('view_portfolio')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#0f172a" />
        </Pressable>
        <Text style={styles.headerTitle}>{t('nav_payment')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('recent_sales')}</Text>
          <View style={styles.orderCard}>
            {checkoutItems.map((item: any, idx: number) => (
              <View key={idx} style={[styles.orderItem, idx === 0 && { borderTopWidth: 0 }]}>
                <View>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQty}>x{item.quantity || 1}</Text>
                </View>
                <Text style={styles.itemPrice}>{formatCurrency(item.price * (item.quantity || 1), currency)}</Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t('total_price')}</Text>
              <Text style={styles.totalPrice}>{formatCurrency(totalAmount, currency)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('payment_method') || 'Payment Method'}</Text>
          <View style={styles.methodList}>
            <Pressable 
              onPress={() => setPaymentMethod('balance')}
              style={[styles.methodItem, paymentMethod === 'balance' && styles.activeMethod]}
            >
              <View style={[styles.methodIcon, { backgroundColor: '#eff6ff' }]}>
                <Wallet size={20} color="#3b82f6" />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodName}>{t('balance')}</Text>
                <Text style={styles.methodDesc}>{t('current_value')}: {formatCurrency(balance, currency)}</Text>
              </View>
              <View style={[styles.radio, paymentMethod === 'balance' && styles.radioActive]} />
            </Pressable>

            <Pressable 
              onPress={() => setPaymentMethod('card')}
              style={[styles.methodItem, paymentMethod === 'card' && styles.activeMethod]}
            >
              <View style={[styles.methodIcon, { backgroundColor: '#fef2f2' }]}>
                <CreditCard size={20} color="#ef4444" />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodName}>Visa / Mastercard</Text>
                <Text style={styles.methodDesc}>**** **** **** 4242</Text>
              </View>
              <View style={[styles.radio, paymentMethod === 'card' && styles.radioActive]} />
            </Pressable>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <ShieldCheck size={20} color="#10b981" />
          <Text style={styles.infoText}>Your transaction is secured with 256-bit encryption.</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerLabel}>{t('total_price')}</Text>
          <Text style={styles.footerPrice}>{formatCurrency(totalAmount, currency)}</Text>
        </View>
        <Pressable 
          style={[styles.payBtn, (isProcessing || totalAmount === 0) && styles.payBtnDisabled]}
          onPress={handlePay}
          disabled={isProcessing || totalAmount === 0}
        >
          {isProcessing ? (
            <Text style={styles.payBtnText}>{t('loading')}</Text>
          ) : (
            <>
              <Text style={styles.payBtnText}>{t('pay_now')}</Text>
              <ArrowRight size={20} color="#ffffff" />
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  scrollContent: { padding: 20 },
  section: { marginBottom: 28 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
  },
  orderCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  itemName: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
  itemQty: { fontSize: 13, color: '#94a3b8', marginTop: 2 },
  itemPrice: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#f1f5f9',
    borderStyle: 'dashed',
  },
  totalLabel: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  totalPrice: { fontSize: 20, fontWeight: '900', color: '#ef4444' },
  methodList: { gap: 12 },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
  },
  activeMethod: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  methodInfo: { flex: 1 },
  methodName: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  methodDesc: { fontSize: 13, color: '#64748b', marginTop: 2 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f6',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  infoText: { flex: 1, fontSize: 13, color: '#166534', fontWeight: '500' },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerInfo: { flex: 1 },
  footerLabel: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  footerPrice: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  payBtn: {
    flex: 1.2,
    backgroundColor: '#0f172a',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  payBtnDisabled: { backgroundColor: '#94a3b8' },
  payBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  successContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  successIconBox: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  successTitle: { fontSize: 28, fontWeight: '900', color: '#0f172a', marginBottom: 12, textAlign: 'center' },
  successSub: { fontSize: 16, color: '#64748b', textAlign: 'center', marginBottom: 40, lineHeight: 24 },
  successButton: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  successButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});
