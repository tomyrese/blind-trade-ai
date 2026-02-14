import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Pressable, TextInput, Modal, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Heart, 
  Search, 
  ArrowUpDown, 
  LayoutGrid, 
  List, 
  Filter,
  X,
  ChevronLeft
} from 'lucide-react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import { CardItem } from '../features/tradeup/components/CardItem';
import { useFavoritesStore } from '../../shared/stores/favoritesStore';
import { useTranslation } from '../../shared/utils/translations';
import { useMarkets } from '../../shared/hooks/useMarkets';
import { mapRarity, RARITY_RANKS } from '../../shared/utils/cardData';

export const FavoritesScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation<any>();
  const { favoriteIds } = useFavoritesStore();
  const { data: markets, isLoading, refetch } = useMarkets();
  const { t } = useTranslation();

  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('value_desc');
  const [isSortModalVisible, setSortModalVisible] = useState(false);
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(inputText), 350);
    return () => clearTimeout(timer);
  }, [inputText]);

  const SORT_OPTIONS = [
    { id: 'value_desc', label: t('sort_price_desc') },
    { id: 'value_asc', label: t('sort_price_asc') },
    { id: 'rarity_desc', label: t('sort_rarity_desc') },
    { id: 'rarity_asc', label: t('sort_rarity_asc') },
  ];

  const filteredCards = useMemo(() => {
    if (!markets) return [];
    let result = markets.filter(market => favoriteIds.includes(market.id));
    
    if (searchQuery) {
      result = result.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.symbol?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedRarities.length > 0) {
      result = result.filter(c => selectedRarities.includes(mapRarity(c.rarity, c.name)));
    }

    result.sort((a, b) => {
      const rarityA = mapRarity(a.rarity, a.name);
      const rarityB = mapRarity(b.rarity, b.name);
      switch (sortBy) {
        case 'value_desc': return b.currentPrice - a.currentPrice;
        case 'value_asc': return a.currentPrice - b.currentPrice;
        case 'rarity_desc': return (RARITY_RANKS[rarityB] || 0) - (RARITY_RANKS[rarityA] || 0);
        case 'rarity_asc': return (RARITY_RANKS[rarityA] || 0) - (RARITY_RANKS[rarityB] || 0);
        default: return 0;
      }
    });

    return result;
  }, [markets, favoriteIds, searchQuery, sortBy, selectedRarities]);

  const renderHeader = () => (
    <View style={styles.header}>
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
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.appHeader}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <ChevronLeft size={28} color="#0f172a" />
          </Pressable>
          <View style={styles.headerTitleContainer}>
              <Heart size={20} color="#ef4444" fill="#ef4444" />
              <Text style={styles.headerTitleText}>{t('favorites_title')} ({filteredCards.length})</Text>
          </View>
          <View style={{ width: 40 }} />
      </View>

      <FlashList<any>
        data={filteredCards}
        keyExtractor={item => item.id}
        key={viewMode === 'grid' ? `grid-${width > 900 ? 5 : width > 600 ? 4 : width > 400 ? 3 : 2}` : 'list'}
        numColumns={viewMode === 'grid' ? (width > 900 ? 5 : width > 600 ? 4 : width > 400 ? 3 : 2) : 1}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#ef4444" />
        }
        renderItem={({ item }) => (
            <View style={viewMode === 'grid' ? styles.gridItem : styles.listItem}>
                <Pressable 
                  onPress={() => navigation.navigate('CardDetail', { symbol: item.symbol })}
                >
                  <CardItem 
                    card={{
                        id: item.id,
                        name: item.name,
                        rarity: mapRarity(item.rarity, item.name),
                        value: item.currentPrice,
                        symbol: item.symbol,
                        image: item.image,
                        tcgPlayerPrice: item.tcgPlayerPrice,
                        cardMarketPrice: item.cardMarketPrice,
                        listings: item.listings
                    }}
                    showActions={false}
                    hideSeller={false}
                    size={viewMode === 'grid' ? 'normal' : 'list'}
                    largeImage={true}
                  />
                </Pressable>
            </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Heart size={48} color="#cbd5e1" style={{ marginBottom: 12 }} />
            <Text style={styles.emptyText}>{t('no_results_found')}</Text>
          </View>
        }
      />

      {/* Sort Modal */}
      <Modal
        visible={isSortModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSortModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSortModalVisible(false)}>
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

      {/* Filter Modal */}
      <Modal
        visible={isFilterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setFilterModalVisible(false)}>
            <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{t('filter_title')}</Text>
                    <Pressable onPress={() => setFilterModalVisible(false)}>
                        <X size={24} color="#64748b" />
                    </Pressable>
                </View>
                <View style={styles.modalBody}>
                    <View style={styles.rarityGrid}>
                        {Object.keys(RARITY_RANKS).map((rarityKey) => {
                            const isSelected = selectedRarities.includes(rarityKey);
                            return (
                                <Pressable
                                    key={rarityKey}
                                    style={[styles.filterChip, isSelected && styles.activeFilterChip]}
                                    onPress={() => {
                                        setSelectedRarities(prev => 
                                            prev.includes(rarityKey) 
                                            ? prev.filter(r => r !== rarityKey) 
                                            : [...prev, rarityKey]
                                        );
                                    }}
                                >
                                    <Text style={[styles.filterChipLabel, isSelected && styles.activeFilterChipLabel]}>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 40, 
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  header: { paddingHorizontal: 16, paddingTop: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingBottom: 40 },
  gridItem: { padding: 8 },
  listItem: { padding: 12 },
  filterSection: { gap: 12, marginBottom: 16 },
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
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, color: '#0f172a', fontWeight: '600' },
  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  controlBtn: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  viewSwitcher: { flexDirection: 'row', backgroundColor: '#f8fafc', borderRadius: 14, borderWidth: 1, borderColor: '#f1f5f9', padding: 4 },
  viewIconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  activeViewIcon: { backgroundColor: '#ffffff', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  vDivider: { width: 1, height: 16, backgroundColor: '#e2e8f0', marginHorizontal: 4, alignSelf: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  modalBody: { gap: 8 },
  sortOptionItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingVertical: 16, 
    paddingHorizontal: 20, 
    borderRadius: 16, 
    backgroundColor: '#f8fafc', 
    marginBottom: 8 
  },
  activeSortOptionItem: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fee2e2' },
  sortOptionLabel: { fontSize: 16, fontWeight: '700', color: '#475569' },
  activeSortOptionLabel: { color: '#ef4444' },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' },
  rarityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' },
  activeFilterChip: { backgroundColor: '#fef2f2', borderColor: '#fee2e2' },
  filterChipLabel: { fontSize: 14, fontWeight: '700', color: '#64748b' },
  activeFilterChipLabel: { color: '#ef4444' },
  clearFilterBtn: { marginTop: 16, paddingVertical: 12, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  clearFilterText: { fontSize: 14, fontWeight: '800', color: '#ef4444', textTransform: 'uppercase', letterSpacing: 0.5 },
  emptyContainer: { padding: 60, alignItems: 'center' },
  emptyText: { color: '#94a3b8', fontSize: 15, fontWeight: '700' },
});
