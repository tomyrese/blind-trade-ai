import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { Search, Flame, LayoutGrid, List, ShoppingCart, Filter } from 'lucide-react-native'; // Added List icon
import { useCartStore } from '../../../../shared/stores';
import { useMarkets } from '../../../../shared/hooks/useMarkets';
import { CardItem } from '../../tradeup/components/CardItem';
import { Market } from '../../../../domain/models/Market';
import { Card, mapRarity, RARITY_RANKS } from '../../../../shared/utils/cardData';
import { useTranslation } from '../../../../shared/utils/translations';

type TabType = 'Hot' | 'Normal';
type ViewMode = 'grid' | 'list';

// Memoized SearchBar to prevent re-renders when switching tabs
const SearchBar = React.memo(({ value, onChange, placeholder }: { value: string, onChange: (text: string) => void, placeholder: string }) => (
  <View style={styles.searchSection}>
    <View style={styles.searchBar}>
      <Search size={20} color="#94a3b8" />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        style={styles.searchInput}
        value={value}
        onChangeText={onChange}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  </View>
));

// Sort Options Type
type SortOption = 'price_asc' | 'price_desc' | 'rarity_asc' | 'rarity_desc' | 'date_newest' | 'date_oldest';

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'price_asc', label: 'Giá: Thấp đến Cao' },
  { id: 'price_desc', label: 'Giá: Cao đến Thấp' },
  { id: 'rarity_asc', label: 'Độ hiếm: Thấp đến Cao' },
  { id: 'rarity_desc', label: 'Độ hiếm: Cao đến Thấp' },
  { id: 'date_newest', label: 'Mới đăng bán' },
  { id: 'date_oldest', label: 'Cũ nhất' },
];



import { ArrowUpDown, X } from 'lucide-react-native';
import { Modal } from 'react-native';

export const MarketDashboardScreen: React.FC = () => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const marketsQuery = useMarkets();
  
  console.log('DEBUG: MarketDashboard render. isLoading:', marketsQuery.isLoading, 'Data length:', Array.isArray(marketsQuery.data) ? marketsQuery.data.length : 'N/A');

  // Cart Store for Badge
  const cartItems = useCartStore((state: any) => state.items);
  const cartCount = cartItems.length;
  
  // Local state for the text input itself (uncontrolled-like for Vietnamese stability)
  const [inputText, setInputText] = useState('');
  // Parent state that actually triggers the memoized list filtering
  const [searchQuery, setSearchQuery] = useState('');
  
  const [activeTab, setActiveTab] = useState<TabType>('Hot');
  const [viewMode, setViewMode] = useState<ViewMode>('grid'); // View mode state
  
  // Sorting State
  const [sortBy, setSortBy] = useState<SortOption>('date_newest');
  const [isSortModalVisible, setSortModalVisible] = useState(false);

  // Filter state
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);

  const isTablet = width > 768;

  // Debounce the list filtering update to 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(inputText);
    }, 350);
    return () => clearTimeout(timer);
  }, [inputText]);

  const markets = Array.isArray(marketsQuery.data) ? marketsQuery.data : [];
  const isLoading = marketsQuery.isLoading;

  const marketToCard = (market: Market): Card => ({
    id: market.id,
    name: market.name,
    rarity: mapRarity(market.rarity, market.name),
    rarityLabel: market.rarityLabel,
    value: market.currentPrice,
    tcgPlayerPrice: market.tcgPlayerPrice,
    cardMarketPrice: market.cardMarketPrice,
    symbol: market.symbol,
    image: market.image, // Pass image for display
    listedAt: market.listedAt, // Pass through listedAt
    isTrending: market.isTrending, // Pass through isTrending
  });

  const filteredMarkets = useMemo(() => {
    let result = [...markets];
    
    // 1. Filter by Search
    if (searchQuery) {
      result = result.filter(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.symbol?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by Rarity
    if (selectedRarities.length > 0) {
        result = result.filter(m => selectedRarities.includes(mapRarity(m.rarity, m.name)));
    }

    // 2. Filter by Tab (Hot = Trending cards)
    if (activeTab === 'Hot') {
        // Filter to only show items marked as trending
        result = result.filter(m => m.isTrending);
        
        // Optional: Sort trending items by popularity or price change if data existed
        // largely depends on backend, but for mock data we just show the subset
    }

    // 3. Apply Explicit Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.currentPrice - b.currentPrice;
        case 'price_desc':
          return b.currentPrice - a.currentPrice;
        case 'rarity_asc':
          return (RARITY_RANKS[mapRarity(a.rarity, a.name)] || 0) - (RARITY_RANKS[mapRarity(b.rarity, b.name)] || 0);
        case 'rarity_desc':
          return (RARITY_RANKS[mapRarity(b.rarity, b.name)] || 0) - (RARITY_RANKS[mapRarity(a.rarity, a.name)] || 0);
        case 'date_newest':
            // Newest first
            return (new Date(b.listedAt || 0).getTime()) - (new Date(a.listedAt || 0).getTime());
        case 'date_oldest':
             // Oldest first
            return (new Date(a.listedAt || 0).getTime()) - (new Date(b.listedAt || 0).getTime());
        default:
          return 0;
      }
    });
    
    return result;
  }, [markets, searchQuery, activeTab, sortBy, selectedRarities]);

  const badgeTextStyles = styles.badgeText as any;


  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ef4444" />
      </View>
    );
  }

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <View>
          <View style={styles.headerContainer}>
              <View style={styles.searchContainer}>
                 <SearchBar value={inputText} onChange={setInputText} placeholder={t('search_placeholder')} />
              </View>
              <Pressable 
                style={styles.cartButton}
                onPress={() => navigation.navigate('Cart')}
              >
                <ShoppingCart size={24} color="#0f172a" />
                {cartCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={badgeTextStyles}>{cartCount > 99 ? '99+' : cartCount}</Text>
                    </View>
                )}
              </Pressable>
          </View>

          {/* Controls Row: Tabs + Sort + View */}
          <View style={styles.controlsRow}>
            <View style={styles.tabBar}>
              <Pressable 
                onPress={() => setActiveTab('Hot')}
                style={[styles.tabItem, activeTab === 'Hot' && styles.activeTab]}
              >
                <Flame size={16} color={activeTab === 'Hot' ? '#ef4444' : '#64748b'} fill={activeTab === 'Hot' ? '#ef4444' : 'transparent'} />
                <Text style={[styles.tabLabel, activeTab === 'Hot' && styles.activeTabLabel]}>{t('tab_hot')}</Text>
              </Pressable>
              <Pressable 
                onPress={() => setActiveTab('Normal')}
                style={[styles.tabItem, activeTab === 'Normal' && styles.activeTab]}
              >
                <Text style={[styles.tabLabel, activeTab === 'Normal' && styles.activeTabLabel]}>{t('tab_all')}</Text>
              </Pressable>
            </View>

            <View style={{ flexDirection: 'row', gap: 8 }}>
                {/* Sort Button */}
                <Pressable 
                    onPress={() => setSortModalVisible(true)}
                    style={styles.sortButton}
                >
                    <ArrowUpDown size={20} color="#0f172a" />
                </Pressable>

                {/* Filter Button */}
                <Pressable 
                    onPress={() => setFilterModalVisible(true)} 
                    style={[
                        styles.sortButton, 
                        selectedRarities.length > 0 && { backgroundColor: '#fef2f2', borderColor: '#fee2e2' }
                    ]}
                >
                    <Filter 
                        size={20} 
                        color={selectedRarities.length > 0 ? '#ef4444' : '#0f172a'} 
                        fill={selectedRarities.length > 0 ? '#ef4444' : 'transparent'} 
                    />
                </Pressable>

                {/* View Switcher */}
                <View style={styles.viewSwitcher}>
                    <Pressable 
                        onPress={() => setViewMode('grid')}
                        style={[styles.viewBtn, viewMode === 'grid' && styles.activeViewBtn]}
                    >
                        <LayoutGrid size={20} color={viewMode === 'grid' ? '#0f172a' : '#94a3b8'} />
                    </Pressable>
                    <View style={styles.divider} />
                    <Pressable 
                        onPress={() => setViewMode('list')}
                        style={[styles.viewBtn, viewMode === 'list' && styles.activeViewBtn]}
                    >
                        <List size={20} color={viewMode === 'list' ? '#0f172a' : '#94a3b8'} />
                    </Pressable>
                </View>
            </View>
          </View>
      </View>

      <View style={{ flex: 1 }}>
        <FlashList
          data={filteredMarkets}
          renderItem={({ item }) => (
            <View style={viewMode === 'grid' ? styles.gridItem : styles.listItem}>
              <Pressable 
                onPress={() => navigation.navigate('CardDetail', { symbol: item.symbol })}
                style={{ width: '100%' }}
              >
                <CardItem 
                  card={marketToCard(item)} 
                  onToggle={() => navigation.navigate('CardDetail', { symbol: item.symbol })}
                  showActions={true}
                  size={viewMode === 'grid' ? 'normal' : 'list'}
                />
              </Pressable>
            </View>
          )}
          keyExtractor={(item) => item.id}
          key={viewMode} // Force re-render when switching view modes
          numColumns={viewMode === 'grid' ? (isTablet ? 3 : 2) : 1}
          ListHeaderComponent={null}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, paddingTop: 4 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('no_cards_found')}</Text>
            </View>
          }
        />
      </View>



      {/* Filter Modal */}
      <Modal
        visible={isFilterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
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

      {/* Sort Options Modal */}
      <Modal
        visible={isSortModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSortModalVisible(false)}
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
                                {t(('sort_' + option.id) as any)}
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
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSection: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48, // Match cartButton height
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
  },
  
  // Controls Row containing Tabs and View Switcher
  controlsRow: {
      flexDirection: 'row', // Keeping row to align items
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 8,
      marginBottom: 12,
      gap: 12,
  },
  tabBar: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f8fafc', // transparent or subtle gray
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#fef2f2',
    borderColor: '#fee2e2',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
  activeTabLabel: {
    color: '#ef4444',
  },

  // View Switcher Styles
  viewSwitcher: {
      flexDirection: 'row',
      backgroundColor: '#f8fafc',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#f1f5f9',
      padding: 4,
      alignItems: 'center',
  },
  sortButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#e2e8f0',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
  },
  viewBtn: {
      padding: 6,
      borderRadius: 8,
  },
  activeViewBtn: {
      backgroundColor: '#ffffff',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
  },
  divider: {
      width: 1,
      height: 16,
      backgroundColor: '#e2e8f0',
      marginHorizontal: 2,
  },

  gridItem: {
    flex: 1, 
    padding: 4,
  },
  listItem: {
      flex: 1,
      paddingVertical: 6,
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Modal Styles
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
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 20,
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
  modalBody: {
      gap: 8,
  },
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
  
  // Header Styles
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
  },
  cartButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
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
