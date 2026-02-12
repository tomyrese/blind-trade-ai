import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Pressable, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Star, 
  TrendingUp, 
  ShoppingBag, 
  Heart, 
  MoreHorizontal, 
  Search, 
  ArrowUpDown, 
  LayoutGrid, 
  List, 
  Filter,
  X,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Book
} from 'lucide-react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { FlashList } from '@shopify/flash-list';
import { formatCurrency, formatCompactVND } from '../../shared/utils/currency';
import { CardItem } from '../features/tradeup/components/CardItem';
import { useCartStore, usePortfolioStore, useUserStore, useTranslation, useFavoritesStore } from '../../shared/stores';
import { useNavigation } from '@react-navigation/native';
import { mapRarity, RARITY_RANKS } from '../../shared/utils/cardData';

export const PortfolioScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isTablet = width > 768;
  const navigation = useNavigation<any>();

  // Filtering & Search state
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('value_desc');
  const [isSortModalVisible, setSortModalVisible] = useState(false);
  const [selectedAssetForOptions, setSelectedAssetForOptions] = useState<any>(null);
  
  // Filter state
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(inputText), 350);
    return () => clearTimeout(timer);
  }, [inputText]);

  const assets = usePortfolioStore((state) => state.assets);
  const totalValue = assets.reduce((sum, a) => sum + (a.value * a.amount), 0);
  const totalCost = assets.reduce((sum, a) => sum + (a.purchasePrice * a.amount), 0);
  const totalProfit = totalValue - totalCost;
  const profitPercentage = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  const cartItemsCount = useCartStore((state) => state.totalItems());
  const favoritesCount = useFavoritesStore((state) => state.favoriteIds.length);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const isFavorite = useFavoritesStore((state) => state.isFavorite);
  const sellAsset = usePortfolioStore((state) => state.removeFromPortfolio);
  const updateBalance = useUserStore((state) => state.updateBalance);
  const currency = useUserStore((state) => state.profile?.currency || 'VND');
  const { t } = useTranslation();

  const SORT_OPTIONS = [
    { id: 'value_desc', label: t('sort_price_desc') },
    { id: 'value_asc', label: t('sort_price_asc') },
    { id: 'rarity_desc', label: t('sort_rarity_desc') },
    { id: 'rarity_asc', label: t('sort_rarity_asc') },
  ];

  const filteredAssets = useMemo(() => {
    let result = [...assets];
    
    if (searchQuery) {
      result = result.filter(a => 
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.symbol?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedRarities.length > 0) {
        result = result.filter(a => selectedRarities.includes(mapRarity(a.rarity)));
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'value_desc': return b.value - a.value;
        case 'value_asc': return a.value - b.value;
        case 'rarity_desc': return (RARITY_RANKS[mapRarity(b.rarity)] || 0) - (RARITY_RANKS[mapRarity(a.rarity)] || 0);
        case 'rarity_asc': return (RARITY_RANKS[mapRarity(a.rarity)] || 0) - (RARITY_RANKS[mapRarity(b.rarity)] || 0);
        case 'name_asc': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });

    return result;
  }, [assets, searchQuery, sortBy]);

  const renderHeader = () => (
    <View>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          {/* Poke Ball Top Half (Red) */}
          <LinearGradient 
            colors={['#ef4444', '#dc2626']} 
            style={styles.pokeBallTop}
          >
            <View style={styles.pokeBallTopContent}>
              <View style={styles.pokeBallHeader}>
                <View style={[styles.pokeIconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Package size={18} color="#ffffff" />
                </View>
                <View style={styles.pokeTrendBadge}>
                  {profitPercentage !== 0 && (
                    profitPercentage >= 0 ? 
                    <ArrowUpRight size={14} color="#ffffff" /> : 
                    <ArrowDownRight size={14} color="#ffffff" />
                  )}
                  <Text style={styles.pokeTrendText}>
                    {profitPercentage >= 0 ? '+' : ''}{profitPercentage.toFixed(1)}%
                  </Text>
                </View>
              </View>
              <Text style={styles.pokeLabel}>{t('portfolio_total_value')}</Text>
            </View>
          </LinearGradient>

          {/* Poke Ball Center Strip */}
          <View style={styles.pokeBallCenterStrip}>
            <View style={styles.pokeBallButtonOuter}>
              <View style={styles.pokeBallButtonInner}>
                <View style={styles.pokeBallButtonCore} />
              </View>
            </View>
          </View>

          {/* Poke Ball Bottom Half (White) */}
          <View style={styles.pokeBallBottom}>
            <Text style={styles.pokeAmount} numberOfLines={1}>
              {currency === 'VND' ? formatCompactVND(totalValue) : formatCurrency(totalValue, 'USD')}
            </Text>
            <View style={styles.pokeFooter}>
              <View style={styles.pokeProfitRow}>
                <Text style={styles.pokeProfitLabel}>
                  {totalProfit >= 0 ? t('profit') : t('loss')}
                </Text>
                <Text style={[styles.pokeProfitValue, { color: totalProfit >= 0 ? '#10b981' : '#ef4444' }]}>
                  {totalProfit >= 0 ? '+' : '-'}{currency === 'VND' ? formatCompactVND(Math.abs(totalProfit)) : formatCurrency(Math.abs(totalProfit), 'USD')}
                </Text>
              </View>
              <Text style={styles.pokeFooterDate}>{t('updated_just_now')}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
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
          <Pressable onPress={() => navigation.navigate('TradeUp')} style={styles.actionItem}>
            <View style={[styles.actionIcon, { backgroundColor: '#f1f5f9' }]}>
              <Zap size={24} color="#475569" />
            </View>
            <Text style={styles.actionLabel}>{t('nav_tradeup')}</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Pokedex')} style={styles.actionItem}>
            <View style={[styles.actionIcon, { backgroundColor: '#f8fafc' }]}>
              <Book size={24} color="#64748b" />
            </View>
            <Text style={styles.actionLabel}>Poké Dex</Text>
          </Pressable>
        </View>

        {/* Search & Filters */}
        <View style={styles.filterSection}>
            <View style={styles.searchBar}>
                <Search size={20} color="#94a3b8" />
                <TextInput
                    placeholder={t('search_placeholder')}
                    placeholderTextColor="#94a3b8"
                    style={styles.searchInput}
                    value={inputText}
                    onChangeText={setInputText}
                />
            </View>

            <View style={styles.controlsRow}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Pressable onPress={() => setSortModalVisible(true)} style={styles.controlBtn}>
                        <ArrowUpDown size={20} color="#1e293b" />
                    </Pressable>

                    <Pressable 
                        onPress={() => setFilterModalVisible(true)} 
                        style={[
                            styles.controlBtn, 
                            selectedRarities.length > 0 && { backgroundColor: '#fef2f2', borderColor: '#fee2e2' }
                        ]}
                    >
                        <Filter 
                            size={20} 
                            color={selectedRarities.length > 0 ? '#ef4444' : '#1e293b'} 
                            fill={selectedRarities.length > 0 ? '#ef4444' : 'transparent'} 
                        />
                    </Pressable>
                </View>

                <View style={styles.viewSwitcher}>
                    <Pressable 
                        onPress={() => setViewMode('grid')}
                        style={[styles.viewIconBtn, viewMode === 'grid' && styles.activeViewIcon]}
                    >
                        <LayoutGrid size={20} color={viewMode === 'grid' ? '#0f172a' : '#94a3b8'} />
                    </Pressable>
                    <View style={styles.vDivider} />
                    <Pressable 
                        onPress={() => setViewMode('list')}
                        style={[styles.viewIconBtn, viewMode === 'list' && styles.activeViewIcon]}
                    >
                        <List size={20} color={viewMode === 'list' ? '#0f172a' : '#94a3b8'} />
                    </Pressable>
                </View>
            </View>
        </View>

        <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
                <Star size={20} color="#ef4444" fill="#ef4444" />
                <Text style={styles.sectionTitle}>{t('pokemon_inventory')}</Text>
            </View>
            <Text style={styles.sectionCount}>{filteredAssets.length} {t('items')}</Text>
        </View>
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <FlashList<any>
        data={filteredAssets}
        keyExtractor={item => item.id}
        key={viewMode}
        numColumns={viewMode === 'grid' ? (isTablet ? 3 : 2) : 1}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}

        renderItem={({ item: asset }) => (
            <View style={viewMode === 'grid' ? styles.gridItem : styles.listItem}>
                <Pressable 
                  onPress={() => navigation.navigate('CardDetail', { symbol: asset.symbol || asset.id })}
                  style={{ width: '100%' }}
                >
                  <CardItem 
                    card={{
                      id: asset.id,
                      name: asset.name,
                      rarity: mapRarity(asset.rarity),
                      value: asset.value,
                      symbol: asset.symbol,
                      amount: asset.amount,
                      image: asset.image,
                    }}
                    showActions={false}
                    hideSeller={true}
                    size={viewMode === 'grid' ? 'normal' : 'list'}
                    largeImage={true} // Use larger image in Portfolio Grid
                    onToggle={() => {}}
                    amount={asset.amount}
                  />
                </Pressable>

                <View style={[styles.itemProfitBadge, { backgroundColor: asset.value >= asset.purchasePrice ? '#10b981' : '#ef4444' }]}>
                   <Text style={styles.itemProfitText}>
                     {asset.value >= asset.purchasePrice ? '+' : ''}
                     {(((asset.value - asset.purchasePrice) / (asset.purchasePrice || 1)) * 100).toFixed(0)}%
                   </Text>
                </View>
            </View>
        )}
        ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Package size={48} color="#cbd5e1" style={{ marginBottom: 12 }} />
                <Text style={styles.emptyText}>{t('no_assets_owned')}</Text>
            </View>
        }
      />


      {/* Filter Modal - Force Rebuild */}
      <Modal
        visible={isFilterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
        statusBarTranslucent={true}
      >
        <Pressable 
            style={styles.modalOverlay} 
            onPress={() => setFilterModalVisible(false)}
        >
            <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{t('filter_title')}</Text>
                    <Pressable onPress={() => setFilterModalVisible(false)}>
                        <X size={24} color="#64748b" />
                    </Pressable>
                </View>
                
                <View style={styles.modalBody}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {Object.keys(RARITY_RANKS).map((rarityKey) => {
                            const isSelected = selectedRarities.includes(rarityKey);
                            return (
                                <Pressable
                                    key={rarityKey}
                                    style={[
                                        styles.filterChip,
                                        isSelected && styles.activeFilterChip
                                    ]}
                                    onPress={() => {
                                        setSelectedRarities(prev => {
                                            if (prev.includes(rarityKey)) {
                                                return prev.filter(r => r !== rarityKey);
                                            } else {
                                                return [...prev, rarityKey];
                                            }
                                        });
                                    }}
                                >
                                    <Text style={[
                                        styles.filterChipLabel,
                                        isSelected && styles.activeFilterChipLabel
                                    ]}>
                                        {t(`rarity_${rarityKey}` as any)}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    {selectedRarities.length > 0 && (
                        <Pressable 
                            style={styles.clearFilterBtn}
                            onPress={() => {
                                setSelectedRarities([]);
                                setFilterModalVisible(false);
                            }}
                        >
                            <Text style={styles.clearFilterText}>{t('clear_filter')}</Text>
                        </Pressable>
                    )}
                </View>
            </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={isSortModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSortModalVisible(false)}
        statusBarTranslucent={true}
      >
        <Pressable 
            style={styles.modalOverlay} 
            onPress={() => setSortModalVisible(false)}
        >
            <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{t('sort_by')}</Text>
                    <Pressable onPress={() => setSortModalVisible(false)}>
                        <X size={24} color="#64748b" />
                    </Pressable>
                </View>
                
                <View style={styles.modalBody}>
                    {SORT_OPTIONS.map((option) => (
                        <Pressable
                            key={option.id}
                            style={[
                                styles.sortOptionItem,
                                sortBy === option.id && styles.activeSortOptionItem
                            ]}
                            onPress={() => {
                                setSortBy(option.id);
                                setSortModalVisible(false);
                            }}
                        >
                            <Text style={[
                                styles.sortOptionLabel,
                                sortBy === option.id && styles.activeSortOptionLabel
                            ]}>
                                {option.label}
                            </Text>
                            {sortBy === option.id && (
                                <View style={styles.activeDot} />
                            )}
                        </Pressable>
                    ))}
                </View>
            </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  listContent: { paddingBottom: 40, paddingTop: 20, paddingHorizontal: 8 },
  balanceCard: {
    marginHorizontal: 4,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pokeBallTop: {
    padding: 24,
    paddingBottom: 32,
  },
  pokeBallTopContent: {
    gap: 12,
  },
  pokeBallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pokeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pokeTrendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  pokeTrendText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  pokeLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  pokeBallCenterStrip: {
    height: 12,
    backgroundColor: '#1e293b',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  pokeBallButtonOuter: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
    position: 'absolute',
  },
  pokeBallButtonInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pokeBallButtonCore: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pokeBallBottom: {
    padding: 24,
    paddingTop: 36,
    backgroundColor: '#ffffff',
  },
  pokeAmount: {
    fontSize: 42,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -1,
    marginBottom: 12,
  },
  pokeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  pokeProfitRow: {
    gap: 2,
  },
  pokeProfitLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  pokeProfitValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  pokeFooterDate: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  footerText: {
      fontSize: 13,
      fontWeight: '800',
  },
  footerDate: {
      color: '#64748b',
      fontSize: 11,
      fontWeight: '600',
  },
  actionsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 4, 
    marginBottom: 32 
  },
  actionItem: { alignItems: 'center', position: 'relative' },
  actionIcon: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionLabel: { fontSize: 13, fontWeight: '800', color: '#1e293b' },
  badge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: '#ef4444', width: 22, height: 22,
    borderRadius: 11, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#ffffff',
  },
  badgeText: { color: '#ffffff', fontSize: 10, fontWeight: '900' },
  
  filterSection: {
    paddingHorizontal: 4,
    marginBottom: 20,
    gap: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  viewSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    padding: 4,
    alignItems: 'center',
  },
  viewIconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  activeViewIcon: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  vDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 4,
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  sectionCount: { fontSize: 13, color: '#94a3b8', fontWeight: '700' },
  gridItem: { padding: 4, position: 'relative' },
  listItem: { paddingHorizontal: 4, paddingVertical: 8, position: 'relative' },

  itemProfitBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 10,
  },
  itemProfitText: { color: '#ffffff', fontSize: 9, fontWeight: '900' },
  emptyContainer: { padding: 60, alignItems: 'center' },
  emptyText: { color: '#94a3b8', fontSize: 15, fontWeight: '700' },
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
  },
  modalContent: {
      backgroundColor: 'white',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      paddingBottom: 40,
  },
  modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
  },
  modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#0f172a',
  },
  modalBody: { gap: 8 },
  sortOptionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 16,
      backgroundColor: '#f8fafc',
  },
  activeSortOptionItem: {
      backgroundColor: '#fef2f2',
      borderWidth: 1,
      borderColor: '#fee2e2',
  },
  sortOptionLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: '#475569',
  },
  activeSortOptionLabel: {
      color: '#ef4444',
      fontWeight: '700',
  },
  activeDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#ef4444',
  },
  modalSubtitle: {
      fontSize: 14,
      color: '#64748b',
      fontWeight: '600',
      marginTop: 2,
  },
  optionActionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      gap: 16,
  },
  optionIconBox: {
      width: 48,
      height: 48,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
  },
  optionActionLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: '#1e293b',
  },
  sellHint: {
      fontSize: 12,
      color: '#94a3b8',
      fontWeight: '600',
      marginTop: 2,
  },
  optionDivider: {
      height: 1,
      backgroundColor: '#f1f5f9',
      marginVertical: 8,
  },
  listMoreBtn: {
      position: 'absolute',
      right: 20,
      top: '50%',
      marginTop: -20,
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
  },
  filterChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: '#f8fafc',
      borderWidth: 1,
      borderColor: '#e2e8f0',
  },
  activeFilterChip: {
      backgroundColor: '#fef2f2',
      borderColor: '#fee2e2',
  },
  filterChipLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: '#64748b',
  },
  activeFilterChipLabel: {
      color: '#ef4444',
      fontWeight: '700',
  },
  clearFilterBtn: {
      marginTop: 16,
      alignItems: 'center',
      paddingVertical: 12,
      backgroundColor: '#f1f5f9',
      borderRadius: 12,
  },
  clearFilterText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#475569',
  },
});
