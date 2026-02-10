import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { ChevronLeft, Share2, Heart, TrendingUp, ShoppingCart, User, ShieldCheck, Zap } from 'lucide-react-native';
import { useMarket } from '../../../../shared/hooks/useMarkets';
import { RootStackParamList } from '../../../navigation/types';
import { formatVND } from '../../../../shared/utils/formatters';
import { useCartStore } from '../../../../shared/stores/cartStore';
import { useFavoritesStore } from '../../../../shared/stores/favoritesStore';
import { Listing } from '../../../../domain/models/Market';
import { RARITY_CONFIGS, RARITY_COLORS, mapRarity } from '../../../../shared/utils/cardData';

const { width } = Dimensions.get('window');

import { useToast } from '../../../../shared/contexts/ToastContext';

export const CardDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'CardDetail'>>();
  const navigation = useNavigation<any>();
  const { symbol } = route.params;
  const { data: market, isLoading } = useMarket(symbol);
  const addToCart = useCartStore((state) => state.addToCart);
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const { showToast } = useToast();
  
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  if (isLoading || !market) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ef4444" />
      </View>
    );
  }

  // Use mapRarity to ensure we get the correct config key
  const rarityKey = mapRarity(market.rarity);
  const rarityConfig = RARITY_CONFIGS[rarityKey] || RARITY_CONFIGS.common;
  const rarityColor = rarityConfig.color;
  const isCardFavorite = isFavorite(market.id);

  const handleAddToCart = () => {
    const listing = selectedListing || (market.listings?.[0]);
    if (!listing) return;

    addToCart({
      id: market.id,
      name: market.name,
      rarity: mapRarity(market.rarity),
      value: listing.price,
      symbol: market.symbol,
      tcgPlayerPrice: market.tcgPlayerPrice,
      cardMarketPrice: market.cardMarketPrice,
    });
    showToast(`Đã thêm ${market.name} vào giỏ hàng`, 'cart');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    // In a real app, navigate to checkout
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <ChevronLeft size={24} color="#1e293b" />
        </Pressable>
        <View style={styles.headerRight}>
          <Pressable style={styles.headerBtn}>
            <Share2 size={22} color="#1e293b" />
          </Pressable>
          <Pressable 
            onPress={() => {
                const wasFavorite = isCardFavorite;
                toggleFavorite(market.id);
                showToast(
                  wasFavorite 
                    ? `Đã xóa ${market.name} khỏi yêu thích`
                    : `Đã thêm ${market.name} vào yêu thích`,
                  'favorite'
                );
            }} 
            style={[styles.headerBtn, isCardFavorite && styles.headerBtnActive]}
          >
            <Heart size={22} color={isCardFavorite ? '#ef4444' : '#1e293b'} fill={isCardFavorite ? '#ef4444' : 'transparent'} />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Visual Section */}
        <View style={styles.visualSection}>
          <View style={[styles.imagePlaceholder, { shadowColor: rarityColor, borderColor: rarityConfig.borderColor }]}>
            <Text style={styles.cardSymbolText}>{market.symbol}</Text>
          </View>
          <View style={styles.titleInfo}>
            <View style={[styles.rarityTag, { backgroundColor: rarityConfig.glowColor, borderColor: rarityConfig.borderColor }]}>
              <Text style={[styles.rarityLabel, { color: rarityConfig.color }]}>{rarityConfig.label}</Text>
            </View>
            <Text style={styles.cardName}>{market.name}</Text>
          </View>
        </View>

        {/* Market Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>TCGPlayer</Text>
            <Text style={styles.statPrice}>{formatVND(market.tcgPlayerPrice || market.currentPrice)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>CardMarket</Text>
            <Text style={styles.statPrice}>{formatVND(market.cardMarketPrice || market.currentPrice)}</Text>
          </View>
        </View>

        {/* Price History Chart Placeholder */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={18} color="#ef4444" />
            <Text style={styles.sectionTitle}>Lịch sử giá (7 ngày)</Text>
          </View>
          <View style={styles.chartBlock}>
            <View style={styles.chartLine} />
            <Text style={styles.chartPlaceholderText}>Biểu đồ tăng trưởng ổn định</Text>
          </View>
        </View>

        {/* Listings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ShoppingCart size={18} color="#ef4444" />
            <Text style={styles.sectionTitle}>Chọn Người Bán ({market.listings?.length || 0})</Text>
          </View>
          
          <View style={styles.listingsGrid}>
            {market.listings?.map((listing) => (
              <Pressable 
                key={listing.id} 
                onPress={() => setSelectedListing(listing)}
                style={[
                  styles.listingCard, 
                  selectedListing?.id === listing.id && styles.listingCardSelected
                ]}
              >
                <View style={styles.listingTop}>
                  <View style={styles.sellerInfo}>
                    <View style={styles.sellerAvatar}>
                      <User size={16} color="#64748b" />
                    </View>
                    <Text style={styles.sellerName}>{listing.sellerName}</Text>
                  </View>
                  <View style={[styles.conditionBadge, { backgroundColor: '#f0fdf4' }]}>
                    <Text style={styles.conditionText}>{listing.condition}</Text>
                  </View>
                </View>
                <Text style={styles.listingPrice}>{formatVND(listing.price)}</Text>
                {selectedListing?.id === listing.id && (
                  <View style={styles.selectedCheck}>
                    <ShieldCheck size={16} color="#ffffff" />
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Persistent Footer Actions */}
      <View style={styles.footer}>
        <View style={styles.footerPriceInfo}>
          <Text style={styles.footerLabel}>
            {selectedListing ? `Người bán: ${selectedListing.sellerName}` : 'Phổ biến nhất'}
          </Text>
          <Text style={styles.footerPrice}>
            {formatVND(selectedListing ? selectedListing.price : market.currentPrice)}
          </Text>
        </View>
        
        <View style={styles.footerActions}>
          <Pressable 
            onPress={handleAddToCart}
            style={styles.cartBtn}
          >
            <ShoppingCart size={20} color="#ef4444" />
          </Pressable>
          <Pressable 
            onPress={handleBuyNow}
            style={styles.buyBtn}
          >
            <Zap size={20} color="#ffffff" fill="#ffffff" />
            <Text style={styles.buyBtnText}>Mua Ngay</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  headerBtnActive: {
    backgroundColor: '#fef2f2',
    borderColor: '#fee2e2',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  visualSection: {
    alignItems: 'center',
    paddingTop: 20,
  },
  imagePlaceholder: {
    width: width * 0.7,
    height: width * 0.95,
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    borderWidth: 8,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 10,
  },
  cardSymbolText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#e2e8f0',
  },
  titleInfo: {
    alignItems: 'center',
    marginTop: 24,
  },
  rarityTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  rarityLabel: {
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0f172a',
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 32,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#e2e8f0',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '700',
    marginBottom: 4,
  },
  statPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
  chartBlock: {
    height: 120,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  chartLine: {
    position: 'absolute',
    bottom: 40,
    left: -20,
    right: -20,
    height: 40,
    borderTopWidth: 4,
    borderColor: '#ef4444',
    opacity: 0.2,
  },
  chartPlaceholderText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  listingsGrid: {
    gap: 12,
  },
  listingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#f1f5f9',
    position: 'relative',
  },
  listingCardSelected: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  listingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sellerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  conditionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  conditionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10b981',
  },
  listingPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  selectedCheck: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerPriceInfo: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '700',
    marginBottom: 2,
  },
  footerPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ef4444',
  },
  footerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cartBtn: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  buyBtn: {
    backgroundColor: '#ef4444',
    height: 56,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  buyBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
});
