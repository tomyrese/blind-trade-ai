import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, Pressable, Alert } from 'react-native';
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
  Package
} from 'lucide-react-native';
import { TextInput, Modal } from 'react-native';
import { mapRarity, RARITY_RANKS } from '../../shared/utils/cardData';
import { CardItem } from '../features/tradeup/components/CardItem';
import { LootboxAnimation } from '../features/tradeup/components/LootboxAnimation';
import { usePortfolioStore } from '../../shared/stores/portfolioStore';
import { useUserStore } from '../../shared/stores/userStore';
import { useTranslation } from '../../shared/utils/translations';
import { generateReward, getFusionProbabilities, mockCards, Card } from '../../shared/utils/cardData';
import { formatCurrency } from '../../shared/utils/currency';
import { useNavigation } from '@react-navigation/native';

export const TradeUpScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const assets = usePortfolioStore((state) => state.assets);
  const addAsset = usePortfolioStore((state) => state.addAsset);
  const removeAsset = usePortfolioStore((state) => state.removeAsset);
  const currency = useUserStore((state) => state.profile?.currency || 'VND');
  const { t } = useTranslation();
  
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [isOpening, setIsOpening] = useState(false);
  const [reward, setReward] = useState<Card | null>(null);

  // Filtering & Search state
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('value_desc');
  const [isSortModalVisible, setSortModalVisible] = useState(false);

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
      rarity: mapRarity(a.rarity),
      value: a.value,
      symbol: a.symbol,
      amount: a.amount,
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
  }, [ownedCards, searchQuery, sortBy]);

  const totalValue = useMemo(() => {
    return ownedCards
      .filter((c) => selectedCards.includes(c.id))
      .reduce((sum, c) => sum + c.value, 0);
  }, [ownedCards, selectedCards]);

  const fusionChances = useMemo(() => {
    const cards = ownedCards.filter(c => selectedCards.includes(c.id));
    if (cards.length === 0) return { upgrade: 0, same: 0, downgrade: 0 };
    
    // Use the logic from cardData.ts
    const odds = getFusionProbabilities(cards);
    return {
        upgrade: Math.round(odds.upgrade * 100),
        same: Math.round(odds.same * 100),
        risk: Math.round(odds.downgrade * 100)
    };
  }, [ownedCards, selectedCards]);

  const handleToggleCard = useCallback((id: string) => {
    setSelectedCards((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= 10) {
        Alert.alert(t('fusion_limit_title'), t('fusion_limit_message'));
        return prev;
      }
      return [...prev, id];
    });
  }, [t]);

  const handleFusion = () => {
    if (selectedCards.length < 2) {
      Alert.alert(t('fusion_requirement_title'), t('fusion_requirement_message'));
      return;
    }

    const cardsToFuse = ownedCards.filter(c => selectedCards.includes(c.id));
    const newReward = generateReward(cardsToFuse);
    setReward(newReward);
    setIsOpening(true);

    // Remove selected assets and add reward
    selectedCards.forEach(id => removeAsset(id));
    addAsset({
      id: newReward.id,
      name: newReward.name,
      symbol: newReward.symbol || newReward.name.substring(0, 3).toUpperCase(),
      rarity: newReward.rarity,
      amount: 1,
      value: newReward.value,
      purchasePrice: totalValue / selectedCards.length, // Rough estimation for profit tracking
    });
    
    setSelectedCards([]);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Fusion Panel */}
        <View style={[styles.fusionPanel, { marginTop: 20 }]}>
          <View style={styles.fusionHeader}>
            <View style={styles.valueInfo}>
              <Text style={styles.valueLabel}>{t('fusion_value')}</Text>
              <Text style={styles.valueAmount}>{formatCurrency(totalValue, currency)}</Text>
            </View>
            <View style={styles.chancesBox}>
              <View style={styles.chanceItem}>
                <Sparkles size={14} color="#f59e0b" />
                <Text style={styles.chanceText}>{t('fusion_upgrade')}: {fusionChances.upgrade}%</Text>
              </View>
              <View style={styles.chanceItem}>
                <Layers size={14} color="#64748b" />
                <Text style={styles.chanceText}>{t('condition')}: {fusionChances.same}%</Text>
              </View>
              <View style={styles.chanceItem}>
                <Zap size={14} color="#ef4444" />
                <Text style={styles.chanceText}>{t('fusion_risk')}: {fusionChances.risk}%</Text>
              </View>
            </View>
          </View>

          <View style={styles.fusionSlot}>
            {selectedCards.length === 0 ? (
              <View style={styles.emptySlot}>
                <Layers size={48} color="#cbd5e1" strokeWidth={1} />
                <Text style={styles.emptySlotText}>{t('no_cards_selected')}</Text>
              </View>
            ) : (
              <View style={styles.selectedGrid}>
                {selectedCards.slice(0, 5).map(id => {
                  const card = ownedCards.find(c => c.id === id);
                  return card ? (
                    <View key={id} style={styles.smallSelectedCard}>
                      <CardItem card={card} size="small" showActions={false} />
                    </View>
                  ) : null;
                })}
                  <View style={styles.moreBadge}>
                    <Text style={styles.moreText}>+{selectedCards.length - 5}</Text>
                  </View>
              </View>
            )}
          </View>

          <Pressable 
            style={[styles.fuseButton, selectedCards.length < 2 && styles.buttonDisabled]} 
            onPress={handleFusion}
            disabled={selectedCards.length < 2}
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
                  <Pressable onPress={() => setSortModalVisible(true)} style={styles.controlBtn}>
                      <ArrowUpDown size={20} color="#1e293b" />
                  </Pressable>

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
          
          <View style={styles.cardGrid}>
            {filteredCards.map((card) => (
              <View 
                key={card.id} 
                style={[
                    viewMode === 'grid' ? styles.gridItem : styles.listItem, 
                    viewMode === 'grid' && { width: isTablet ? '33.33%' : '50%' }
                ]}
              >
                <CardItem
                  card={card}
                  selected={selectedCards.includes(card.id)}
                  onToggle={handleToggleCard}
                  size={viewMode === 'grid' ? 'normal' : 'list'}
                />
                {(card.amount !== undefined && card.amount > 1) && (
                  <View style={styles.amountBadge}>
                    <Text style={styles.amountText}>x{card.amount}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
          
          {filteredCards.length === 0 && (
            <View style={styles.emptyInventory}>
              {searchQuery ? (
                <Text style={styles.emptyInventoryText}>{t('no_results_found')}</Text>
              ) : (
                <Text style={styles.emptyInventoryText}>{t('no_cards_to_fuse')}</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Lootbox Animation Overlay */}
      {reward && (
        <LootboxAnimation
          isOpen={isOpening}
          onClose={() => {
            setIsOpening(false);
            setReward(null);
          }}
          reward={reward}
        />
      )}
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
  fusionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  valueInfo: {
    flex: 1,
  },
  valueLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 6,
  },
  valueAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#10b981',
  },
  chancesBox: {
    gap: 4,
  },
  chanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chanceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  fusionSlot: {
    height: 120,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    padding: 12,
  },
  emptySlot: {
    alignItems: 'center',
    gap: 8,
  },
  emptySlotText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
  },
  selectedGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  smallSelectedCard: {
    width: 60,
    marginHorizontal: -8, // Stacking effect
    transform: [{ scale: 0.9 }],
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
    paddingHorizontal: 20,
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
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8, // Increased negative margin for better spacing with gridItem padding
  },
  gridItem: {
    padding: 8, // Standard padding to match Portfolio
    position: 'relative'
  },
  amountBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#0f172a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    zIndex: 10,
  },
  amountText: { color: '#ffffff', fontSize: 10, fontWeight: '900' },
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
  listItem: { paddingVertical: 8, position: 'relative' },

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
});
