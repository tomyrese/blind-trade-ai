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
import { usePortfolioStore } from '../../../../shared/stores/portfolioStore';
import { useTranslation } from '../../../../shared/utils/translations';

const { width } = Dimensions.get('window');

import { useToast } from '../../../../shared/contexts/ToastContext';

export const CardDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'CardDetail'>>();
  const navigation = useNavigation<any>();
  const { symbol } = route.params;
  const { data: marketData, isLoading } = useMarket(symbol);
  const addToCart = useCartStore((state) => state.addToCart);
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const ownedAssets = usePortfolioStore((state) => state.assets);
  const { showToast } = useToast();
  const { t } = useTranslation();
  
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  // Fallback logic: If not in market, check portfolio
  const market = useMemo(() => {
    if (marketData) return marketData;
    
    // Search in owned assets (id or symbol)
    const owned = ownedAssets.find(a => a.symbol === symbol || a.id === symbol);
    if (owned) {
        return {
            id: owned.id,
            name: owned.name,
            symbol: owned.symbol,
            currentPrice: owned.value,
            rarity: owned.rarity,
            tcgPlayerPrice: owned.value, // Fallback to current value
            cardMarketPrice: owned.value,
            listings: [],
            isSynthetic: true // Flag to show it's from portfolio
        } as any;
    }
    return null;
  }, [marketData, ownedAssets, symbol]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ef4444" />
      </View>
    );
  }

  if (!market) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Không tìm thấy thông tin của thẻ này</Text>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Quay lại</Text>
        </Pressable>
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
    const listing = selectedListing || (market.listings?.[0]);
    if (!listing) return;

    navigation.navigate('Payment', {
      items: [{
        id: market.id,
        name: market.name,
        symbol: market.symbol || '',
        rarity: mapRarity(market.rarity),
        quantity: 1,
        price: listing.price,
      }],
      total: listing.price
    });
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

        {/* Profit/Loss Analysis for Portfolio Items */}
        {market.isSynthetic && (
           <View style={styles.section}>
             <View style={styles.sectionHeader}>
               <TrendingUp size={18} color="#ef4444" />
               <Text style={styles.sectionTitle}>{t('ai_analysis')}</Text>
             </View>
             <View style={styles.profitAnalysisCard}>
               <View style={styles.profitSplitRow}>
                 <View style={styles.profitSplitBox}>
                   <Text style={styles.profitSplitLabel}>{t('purchase_price')}</Text>
                   <Text style={styles.profitSplitValue}>{formatVND(market.tcgPlayerPrice || 0)}</Text>
                 </View>
                 <View style={styles.profitArrow}>
                    <ChevronLeft size={20} color="#94a3b8" style={{ transform: [{ rotate: '180deg'}] }} />
                 </View>
                 <View style={styles.profitSplitBox}>
                   <Text style={styles.profitSplitLabel}>{t('current_value')}</Text>
                   <Text style={[styles.profitSplitValue, { color: '#ef4444' }]}>{formatVND(market.currentPrice)}</Text>
                 </View>
               </View>
               <View style={styles.profitResultRow}>
                  <Text style={styles.profitResultText}>
                    {market.currentPrice >= (market.tcgPlayerPrice || 0) ? t('profit') : t('loss')}: 
                  </Text>
                  <Text style={[styles.profitResultValue, { color: market.currentPrice >= (market.tcgPlayerPrice || 0) ? '#10b981' : '#ef4444' }]}>
                    {market.currentPrice >= (market.tcgPlayerPrice || 0) ? '+' : ''}
                    {formatVND(Math.abs(market.currentPrice - (market.tcgPlayerPrice || 0)))}
                    ({(((market.currentPrice - (market.tcgPlayerPrice || 0)) / (market.tcgPlayerPrice || 1)) * 100).toFixed(1)}%)
                  </Text>
               </View>
             </View>
           </View>
        )}

        {/* Market Stats - Only if not synthetic */}
        {!market.isSynthetic && (
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
        )}

        {/* AI Valuation Section */}
        {market.valuation && (
          <View style={styles.section}>
             <View style={styles.sectionHeader}>
               <ShieldCheck size={18} color="#ef4444" />
               <Text style={styles.sectionTitle}>{t('ai_valuation')}</Text>
             </View>
             <View style={styles.valuationCard}>
               <View style={styles.valuationHeader}>
                  <View style={styles.scoreCircle}>
                    <Text style={styles.scoreValue}>{market.valuation.score}</Text>
                    <Text style={styles.scoreLabel}>AI Score</Text>
                  </View>
                  <View style={styles.valuationMeta}>
                    <View style={styles.ratingRow}>
                      <Text style={styles.ratingLabel}>Rating:</Text>
                      <View style={[styles.ratingBadge, { backgroundColor: '#fef2f2' }]}>
                        <Text style={styles.ratingText}>{market.valuation.rating}</Text>
                      </View>
                    </View>
                    <View style={styles.ratingRow}>
                      <Text style={styles.ratingLabel}>{t('liquidity')}:</Text>
                      <Text style={styles.liquidityValue}>{market.valuation.liquidity}</Text>
                    </View>
                  </View>
               </View>
               <View style={styles.aiDivider} />
               <Text style={styles.aiAnalysisTitle}>{t('ai_analysis')}</Text>
               <Text style={styles.aiAnalysisText}>{market.valuation.aiAnalysis}</Text>
             </View>
          </View>
        )}

        {/* Listings Section - Only if market data is real */}
        {!market.isSynthetic && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ShoppingCart size={18} color="#ef4444" />
              <Text style={styles.sectionTitle}>Chọn Người Bán ({market.listings?.length || 0})</Text>
            </View>
            
            <View style={styles.listingsGrid}>
              {market.listings?.map((listing: any) => (
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
        )}

        {/* Recent Sales History */}
        {market.recentSales && market.recentSales.length > 0 && (
          <View style={styles.section}>
             <View style={styles.sectionHeader}>
               <TrendingUp size={18} color="#ef4444" />
               <Text style={styles.sectionTitle}>{t('recent_sales')}</Text>
             </View>
             <View style={styles.salesList}>
                {market.recentSales.map((sale: any) => (
                  <View key={sale.id} style={styles.saleItem}>
                    <View style={styles.saleMain}>
                      <Text style={styles.salePrice}>{formatVND(sale.price)}</Text>
                      <Text style={styles.saleDate}>{sale.timestamp.split('T')[0]}</Text>
                    </View>
                    <View style={styles.saleDetails}>
                      <Text style={styles.saleCondition}>{sale.condition}</Text>
                      <View style={styles.saleDot} />
                      <Text style={styles.saleUser}>{sale.buyerName || sale.sellerName}</Text>
                    </View>
                  </View>
                ))}
             </View>
          </View>
        )}
      </ScrollView>

      {/* Persistent Footer Actions - Hide if synthetic (already owned) */}
      {!market.isSynthetic && (
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
      )}
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
  errorText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  backBtn: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backBtnText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  ownedInfoCard: {
    flexDirection: 'row',
    backgroundColor: '#f0fdf4',
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bcf0da',
    gap: 16,
  },
  ownedInfoContent: {
    flex: 1,
  },
  ownedInfoTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#065f46',
    marginBottom: 4,
  },
  ownedInfoDesc: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 20,
    fontWeight: '500',
  },
  profitAnalysisCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  profitSplitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  profitSplitBox: {
    flex: 1,
    alignItems: 'center',
  },
  profitSplitLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 4,
  },
  profitSplitValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  profitArrow: {
    paddingHorizontal: 10,
  },
  profitResultRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  profitResultText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '700',
  },
  profitResultValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  valuationCard: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 24,
  },
  valuationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
  },
  scoreLabel: {
    fontSize: 9,
    color: '#94a3b8',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  valuationMeta: {
    flex: 1,
    gap: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingLabel: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  ratingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '900',
  },
  liquidityValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  aiDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 20,
  },
  aiAnalysisTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  aiAnalysisText: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 22,
    fontWeight: '500',
  },
  salesList: {
    gap: 12,
  },
  saleItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  saleMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  salePrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  saleDate: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '700',
  },
  saleDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saleCondition: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '800',
  },
  saleDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e2e8f0',
  },
  saleUser: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
});
