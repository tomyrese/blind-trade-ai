import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, TrendingUp, ShoppingBag, Heart, MoreHorizontal } from 'lucide-react-native';
import { formatCurrency } from '../../shared/utils/currency';
import { CardItem } from '../features/tradeup/components/CardItem';
import { useCartStore } from '../../shared/stores/cartStore';
import { usePortfolioStore } from '../../shared/stores/portfolioStore';
import { useUserStore } from '../../shared/stores/userStore';
import { useTranslation } from '../../shared/utils/translations';
import { useNavigation } from '@react-navigation/native';
import { useFavoritesStore } from '../../shared/stores/favoritesStore';

export const PortfolioScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation<any>();
  const assets = usePortfolioStore((state) => state.assets);
  const totalValue = assets.reduce((sum, a) => sum + (a.value * a.amount), 0);
  const cartItemsCount = useCartStore((state) => state.totalItems());
  const favoritesCount = useFavoritesStore((state) => state.favoriteIds.length);
  const currency = useUserStore((state) => state.profile.currency);
  const { t } = useTranslation();

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        {/* Balance Card Premium Redesign */}
        <View style={styles.balanceCard}>
          {/* Background Decorations */}
          <View style={styles.cardDecorationCircle} />
          <View style={styles.cardDecorationStar}>
             <Star size={80} color="rgba(255, 255, 255, 0.05)" fill="white" />
          </View>

          <View style={styles.balanceHeader}>
            <View style={styles.iconContainer}>
                 <TrendingUp size={20} color="#ffffff" />
            </View>
            <View style={styles.trendBadge}>
                 <TrendingUp size={12} color="#10b981" />
                 <Text style={styles.trendText}>+12.5%</Text>
            </View>
          </View>
          
          <View style={styles.balanceContent}>
            <Text style={styles.balanceLabel}>{t('portfolio_total_value')}</Text>
            <Text style={styles.balanceAmount}>{formatCurrency(totalValue, currency)}</Text>
          </View>

          <View style={styles.cardFooter}>
             <Text style={styles.footerText}>{t('updated_just_now')}</Text>
          </View>
        </View>

        {/* Quick Actions / Categories */}
        <View style={styles.actionsRow}>
          <Pressable onPress={() => navigation.navigate('Cart')} style={styles.actionItem}>
            <View style={[styles.actionIcon, { backgroundColor: '#fef2f2' }]}>
              <ShoppingBag size={24} color="#ef4444" />
            </View>
            <Text style={styles.actionLabel}>{t('cart_title')}</Text>
            {cartItemsCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartItemsCount}</Text>
              </View>
            )}
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Favorites')} style={styles.actionItem}>
            <View style={[styles.actionIcon, { backgroundColor: '#fef2f2' }]}>
              <Heart size={24} color="#ef4444" />
            </View>
            <Text style={styles.actionLabel}>{t('favorites_title')}</Text>
            {favoritesCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{favoritesCount}</Text>
              </View>
            )}
          </Pressable>
          <Pressable onPress={() => {}} style={styles.actionItem}>
            <View style={[styles.actionIcon, { backgroundColor: '#f8fafc' }]}>
              <MoreHorizontal size={24} color="#64748b" />
            </View>
            <Text style={styles.actionLabel}>{t('options')}</Text>
          </Pressable>
        </View>

        {/* Owned Assets Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Star size={20} color="#ef4444" fill="#ef4444" />
              <Text style={styles.sectionTitle}>{t('pokemon_inventory')}</Text>
            </View>
            <Text style={styles.sectionCount}>{assets.length} {t('items')}</Text>
          </View>
          
          <View style={styles.denseGrid}>
            {assets.map((asset) => (
              <Pressable 
                key={asset.id} 
                style={styles.denseGridItem}
                onPress={() => navigation.navigate('CardDetail', { symbol: asset.symbol || asset.id })}
              >
                <CardItem 
                  card={{
                    id: asset.id,
                    name: asset.name,
                    rarity: asset.rarity as any,
                    value: asset.value,
                    symbol: asset.symbol,
                  }}
                  size="small"
                  showActions={false}
                  onToggle={() => navigation.navigate('CardDetail', { symbol: asset.symbol || asset.id })}
                />
              </Pressable>
            ))}
          </View>
          
          {assets.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('no_assets_owned')}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  container: { paddingBottom: 40, marginTop: 20 },
  balanceCard: {
    marginHorizontal: 20,
    backgroundColor: '#0f172a',
    borderRadius: 32,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    minHeight: 180,
    justifyContent: 'space-between',
  },
  cardDecorationCircle: {
      position: 'absolute',
      top: -40,
      right: -40,
      width: 150,
      height: 150,
      borderRadius: 75,
      backgroundColor: '#3b82f6',
      opacity: 0.1,
  },
  cardDecorationStar: {
      position: 'absolute',
      bottom: -20,
      left: -20,
      opacity: 0.5,
  },
  balanceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
  },
  iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: 'rgba(255,255,255,0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
  },
  trendBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
      gap: 4,
  },
  trendText: {
      color: '#10b981',
      fontSize: 13,
      fontWeight: '800',
  },
  balanceContent: {
      marginTop: 20,
  },
  balanceLabel: {
      color: '#94a3b8',
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
  },
  balanceAmount: {
      color: '#ffffff',
      fontSize: 36,
      fontWeight: '900',
      letterSpacing: -1,
  },
  cardFooter: {
      marginTop: 20,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.1)',
      paddingTop: 12,
  },
  footerText: {
      color: '#64748b',
      fontSize: 12,
      fontWeight: '600',
  },
  balanceInfo: { flex: 1 },
  balanceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
    marginBottom: 4,
  },
  balanceTagText: { color: '#10b981', fontSize: 13, fontWeight: '800' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, marginTop: 24 },
  actionItem: { alignItems: 'center', position: 'relative' },
  actionIcon: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionLabel: { fontSize: 14, fontWeight: '800', color: '#1e293b' },
  badge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: '#ef4444', width: 22, height: 22,
    borderRadius: 11, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#ffffff',
  },
  badgeText: { color: '#ffffff', fontSize: 11, fontWeight: '900' },
  section: { marginTop: 32, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  sectionCount: { fontSize: 14, color: '#94a3b8', fontWeight: '700' },
  denseGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  denseGridItem: { width: '33.33%', padding: 4 },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#94a3b8', fontSize: 15, fontWeight: '700' },
});
