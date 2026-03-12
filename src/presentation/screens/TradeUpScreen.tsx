import {
  Card,
  CardRarity,
  mapRarity,
  RARITY_RANKS,
  generateReward,
  mockCards
} from '../../shared/utils/cardData';


import { executeGacha } from '../../shared/utils/gachaEngine';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Layers,
  Zap,
  Info,
  ArrowRight,
  Sparkles,
  Filter,
  Search,
  ArrowUpDown,
  LayoutGrid,
  List,
  X,
  Package,
  ChevronLeft
} from 'lucide-react-native';
import { TextInput, Modal } from 'react-native';
import { CardItem } from '../features/tradeup/components/CardItem';
import { Lootbox3D } from '../features/tradeup/components/Lootbox3D';
import { usePortfolioStore } from '../../shared/stores/portfolioStore';
import { useUserStore } from '../../shared/stores/userStore';
import { useTranslation } from '../../shared/utils/translations';
import { useUIStore } from '../../shared/stores/uiStore';
import { LinearGradient } from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

export const TradeUpScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const assets = usePortfolioStore((state) => state.assets);
  const addAsset = usePortfolioStore((state) => state.addAsset);
  const removeAsset = usePortfolioStore((state) => state.removeAsset);
  const currency = useUserStore((state) => state.profile?.currency || 'VND');
  const { t } = useTranslation();
  const showNotification = useUIStore((state) => state.showNotification);

  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [isOpening, setIsOpening] = useState(false);
  const [reward, setReward] = useState<Card | null>(null);

  const handleGacha = () => {
    const result = executeGacha();
    setReward(result);
    setIsOpening(true);
  };

  // Filtering & Search state
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('value_desc');
  const [isSortModalVisible, setSortModalVisible] = useState(false);

  // Filter state
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(inputText), 350);
    return () => clearTimeout(timer);
  }, [inputText]);

  const isTablet = width > 768;

  // Convert Assets to Cards for the UI
  const ownedCards: Card[] = useMemo(() => {
    return assets.map(a => ({
      id: a.id,
      name: a.name,
      rarity: mapRarity(a.rarity, a.name),
      value: a.value,
      symbol: a.symbol,
      amount: a.amount,
      image: a.image,
    }));
  }, [assets]);

  const SORT_OPTIONS = [
    { id: 'value_desc', label: t('sort_price_desc') },
    { id: 'value_asc', label: t('sort_price_asc') },
    { id: 'rarity_desc', label: t('sort_rarity_desc') },
    { id: 'rarity_asc', label: t('sort_rarity_asc') },
  ];

  const filteredCards = useMemo(() => {
    let result = [...ownedCards];

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
      switch (sortBy) {
        case 'value_desc': return b.value - a.value;
        case 'value_asc': return a.value - b.value;
        case 'rarity_desc': return (RARITY_RANKS[b.rarity] || 0) - (RARITY_RANKS[a.rarity] || 0);
        case 'rarity_asc': return (RARITY_RANKS[a.rarity] || 0) - (RARITY_RANKS[b.rarity] || 0);
        case 'name_asc': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });

    return result;
  }, [ownedCards, searchQuery, sortBy, selectedRarities]);



  const highestSelectedRarity = useMemo(() => {
    if (selectedCards.length === 0) return 'common';
    const selectedOwnedCards = ownedCards.filter(c => selectedCards.includes(c.id));
    let highest = 0;
    let rarity: CardRarity = 'common';
    selectedOwnedCards.forEach(c => {
      const rank = RARITY_RANKS[c.rarity] || 0;
      if (rank > highest) {
        highest = rank;
        rarity = c.rarity;
      }
    });
    return rarity;
  }, [selectedCards, ownedCards]);

  const handleToggleCard = useCallback((id: string) => {
    const asset = assets.find(a => a.id === id);
    if (!asset) return;

    const currentCount = selectedCards.filter(i => i === id).length;

    // If we are adding to our selection (currentCount < asset.amount)
    if (currentCount < asset.amount) {
      // Enforce all cards matching the rarity of the first selected card
      if (selectedCards.length > 0) {
        const firstAsset = assets.find(a => a.id === selectedCards[0]);
        if (firstAsset) {
          const firstRarity = mapRarity(firstAsset.rarity, firstAsset.name);
          const thisRarity = mapRarity(asset.rarity, asset.name);
          if (firstRarity !== thisRarity) {
            showNotification(t('error_rarity_mismatch' as any) || 'Bạn phải chọn các thẻ cùng độ hiếm.', 'warning');
            return;
          }
        }
      }

      if (selectedCards.length >= 3) {
        showNotification(t('fusion_limit_message' as any) || 'Bạn chỉ có thể chọn tối đa 3 thẻ để hợp nhất.', 'warning');
        return;
      }

      setSelectedCards((prev) => [...prev, id]);
    } else {
      // If we have selected all available or just want to toggle off
      setSelectedCards((prev) => prev.filter(i => i !== id));
    }
  }, [assets, selectedCards, showNotification, t]);

  const handleFusion = () => {
    if (selectedCards.length !== 3) {
      showNotification(t('fusion_requirement_message' as any) || 'Bạn cần chọn đúng 3 thẻ bài để bắt đầu hợp nhất.', 'info');
      return;
    }

    // Get the unique asset IDs to find their details
    const uniqueIds = Array.from(new Set(selectedCards));
    const cardsToFuse: Card[] = [];

    // Build the list of cards for fusion calculation (including duplicates)
    selectedCards.forEach(id => {
        const asset = assets.find(a => a.id === id);
        if (asset) {
            cardsToFuse.push({
                id: asset.id,
                name: asset.name,
                rarity: mapRarity(asset.rarity, asset.name),
                value: asset.value,
                symbol: asset.symbol,
                amount: 1, // Treat as individual card for fusion
                image: asset.image
            });
        }
    });

    const newReward = generateReward(cardsToFuse);
    setReward(newReward); // newReward can be null now
    setIsOpening(true);

    // Remove selected assets (burn them)
    selectedCards.forEach(id => removeAsset(id));

    if (newReward) {
      // Add reward
      addAsset({
        id: newReward.id,
        name: newReward.name,
        symbol: newReward.symbol || newReward.name.substring(0, 3).toUpperCase(),
        rarity: newReward.rarity,
        amount: 1,
        value: newReward.value,
        purchasePrice: newReward.value, // Keep literal value as remote's calculation (totalValue/length) might be zero if totalValue is mocked/missing
        image: newReward.image,
      });
    }

    setSelectedCards([]);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.appHeader}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <ChevronLeft size={28} color="#0f172a" />
          </Pressable>
          <View style={styles.headerTitleContainer}>
              <Zap size={20} color="#3b82f6" fill="#3b82f6" />
              <Text style={styles.headerTitleText}>{t('nav_tradeup')}</Text>
          </View>
          <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Fusion Panel */}
        <View style={[styles.fusionPanel, { marginTop: 20 }]}>

          <View style={styles.slotsContainer}>
            {[0, 1, 2].map((i) => {
              const cardId = selectedCards[i];
              const card = cardId ? ownedCards.find(c => c.id === cardId) : null;
              
              return (
                <Pressable 
                  key={i} 
                  style={styles.slotItem}
                  onPress={() => cardId && handleToggleCard(cardId)}
                >
                  {card ? (
                    <CardItem card={card} size="small" showActions={false} hideSeller={true} />
                  ) : (
                    <View style={styles.emptySlotBox}>
                      <Text style={styles.emptySlotPlus}>+</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={[styles.fuseButton, selectedCards.length !== 3 && styles.buttonDisabled]}
            onPress={handleFusion}
            disabled={selectedCards.length !== 3}
          >
            <Zap size={24} color="#ffffff" fill="#ffffff" />
            <Text style={styles.fuseButtonText}>{t('start_fusion')}</Text>
          </Pressable>
        </View>

        {/* Inventory Selection Grid */}
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>{t('your_inventory')}</Text>
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

          <View style={viewMode === 'grid' ? styles.cardGrid : styles.cardList}>
            {filteredCards.map((card) => (
              <View
                key={card.id}
                style={[
                    viewMode === 'grid' ? styles.gridItem : styles.listItem,
                    viewMode === 'grid' ? { width: isTablet ? '33.33%' : '50%' } : { width: '100%' }
                ]}
              >
                <CardItem
                  card={card}
                  selected={selectedCards.includes(card.id)}
                  onToggle={handleToggleCard}
                  size={viewMode === 'grid' ? 'normal' : 'list'}
                  largeImage={true} // Use larger image in TradeUp Grid
                  showActions={false}
                  hideSeller={true}
                  amount={card.amount}
                />
                {selectedCards.filter(id => id === card.id).length > 0 && (card.amount || 0) > 1 && (
                  <View style={styles.selectionCountBadge}>
                    <Text style={styles.selectionCountText}>
                      {selectedCards.filter(id => id === card.id).length}/{card.amount}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {filteredCards.length === 0 && (
            <View style={styles.emptyInventory}>
              {(searchQuery || selectedRarities.length > 0) ? (
                <Text style={styles.emptyInventoryText}>{t('no_results_found')}</Text>
              ) : (
                <Text style={styles.emptyInventoryText}>{t('no_cards_to_fuse')}</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Lootbox Animation Overlay */}
      <Lootbox3D
        isOpen={isOpening}
        onClose={() => {
          setIsOpening(false);
          setReward(null);
        }}
        reward={reward}
        currency={currency}
        highestSelectedRarity={highestSelectedRarity}
      />
      {/* Filter Modal - Force Rebuild */}
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

      {/* Sort Modal */}
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
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
  },
  infoBadge: {
    padding: 8,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
  },
  fusionPanel: {
    marginHorizontal: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  slotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
    marginTop: 10,
  },
  slotItem: {
    width: 90,
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySlotBox: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySlotPlus: {
    fontSize: 24,
    color: '#94a3b8',
    fontWeight: '600',
  },
  moreBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  moreText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  fuseButton: {
    backgroundColor: '#3b82f6',
    height: 60,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0,
    elevation: 0,
  },
  fuseButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  listSection: {
    marginTop: 32,
    paddingHorizontal: 12, // Reduced to match Portfolio (12+4=16 total edge)
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  gridItem: {
    padding: 4,
    position: 'relative'
  },

  emptyInventory: {
    padding: 40,
    alignItems: 'center',
  },
  emptyInventoryText: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
  },

  // Filter Section
  filterSection: {
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
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#f1f5f9', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  listItem: { paddingHorizontal: 0, paddingVertical: 8, position: 'relative' },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  cardList: {
    paddingHorizontal: 0,
  },

  // Sort Modal Styles
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
  selectionCountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#ef4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#ffffff',
    zIndex: 10,
  },
  selectionCountText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
  },
});
