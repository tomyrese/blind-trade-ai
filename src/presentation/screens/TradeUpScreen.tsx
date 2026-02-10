import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Layers, Zap, Info, ArrowRight, Sparkles, Filter } from 'lucide-react-native';
import { CardItem } from '../features/tradeup/components/CardItem';
import { LootboxAnimation } from '../features/tradeup/components/LootboxAnimation';
import { usePortfolioStore } from '../../shared/stores/portfolioStore';
import { generateReward, mockCards, Card } from '../../shared/utils/cardData';
import { formatVND } from '../../shared/utils/formatters';

export const TradeUpScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const assets = usePortfolioStore((state) => state.assets);
  const addAsset = usePortfolioStore((state) => state.addAsset);
  const removeAsset = usePortfolioStore((state) => state.removeAsset);
  
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [isOpening, setIsOpening] = useState(false);
  const [reward, setReward] = useState<Card | null>(null);

  const isTablet = width > 768;

  // Convert Assets to Cards for the UI
  const ownedCards: Card[] = useMemo(() => {
    return assets.map(a => ({
      id: a.id,
      name: a.name,
      rarity: a.rarity as any,
      value: a.value,
      symbol: a.symbol,
    }));
  }, [assets]);

  const totalValue = useMemo(() => {
    return ownedCards
      .filter((c) => selectedCards.includes(c.id))
      .reduce((sum, c) => sum + c.value, 0);
  }, [ownedCards, selectedCards]);

  const fusionChances = useMemo(() => {
    const count = selectedCards.length;
    if (count === 0) return { upgrade: 0, fail: 0 };
    // Probability estimation based on count
    const upgrade = Math.min(15 + count * 5, 90);
    const fail = Math.max(20 - count * 2, 5);
    return { upgrade, fail };
  }, [selectedCards]);

  const handleToggleCard = useCallback((id: string) => {
    setSelectedCards((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= 10) {
        Alert.alert('Giới hạn', 'Bạn chỉ có thể chọn tối đa 10 thẻ để hợp nhất.');
        return prev;
      }
      return [...prev, id];
    });
  }, []);

  const handleFusion = () => {
    if (selectedCards.length < 2) {
      Alert.alert('Yêu cầu', 'Bạn cần ít nhất 2 thẻ bài để bắt đầu hợp nhất.');
      return;
    }

    const newReward = generateReward(totalValue);
    setReward(newReward);
    setIsOpening(true);

    // Remove selected assets and add reward
    selectedCards.forEach(id => removeAsset(id));
    addAsset({
      id: newReward.id,
      name: newReward.name,
      symbol: newReward.name.substring(0, 3).toUpperCase(),
      rarity: newReward.rarity,
      amount: 1,
      value: newReward.value,
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
              <Text style={styles.valueLabel}>Giá trị hợp nhất</Text>
              <Text style={styles.valueAmount}>{formatVND(totalValue)}</Text>
            </View>
            <View style={styles.chancesBox}>
              <View style={styles.chanceItem}>
                <Sparkles size={14} color="#f59e0b" />
                <Text style={styles.chanceText}>Nâng cấp: {fusionChances.upgrade}%</Text>
              </View>
              <View style={styles.chanceItem}>
                <Zap size={14} color="#ef4444" />
                <Text style={styles.chanceText}>Rủi ro: {fusionChances.fail}%</Text>
              </View>
            </View>
          </View>

          <View style={styles.fusionSlot}>
            {selectedCards.length === 0 ? (
              <View style={styles.emptySlot}>
                <Layers size={48} color="#cbd5e1" strokeWidth={1} />
                <Text style={styles.emptySlotText}>Chưa có thẻ nào được chọn</Text>
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
                {selectedCards.length > 5 && (
                  <View style={styles.moreBadge}>
                    <Text style={styles.moreText}>+{selectedCards.length - 5}</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          <Pressable 
            style={[styles.fuseButton, selectedCards.length < 2 && styles.buttonDisabled]} 
            onPress={handleFusion}
            disabled={selectedCards.length < 2}
          >
            <Zap size={24} color="#ffffff" fill="#ffffff" />
            <Text style={styles.fuseButtonText}>BẮT ĐẦU HỢP NHẤT</Text>
          </Pressable>
        </View>

        {/* Inventory Selection Grid */}
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Kho Thẻ Của Bạn</Text>
            <View style={styles.filterBtn}>
              <Filter size={16} color="#64748b" />
              <Text style={styles.filterText}>Lọc</Text>
            </View>
          </View>
          
          <View style={styles.cardGrid}>
            {ownedCards.map((card) => (
              <View key={card.id} style={styles.gridItem}>
                <CardItem
                  card={card}
                  selected={selectedCards.includes(card.id)}
                  onToggle={handleToggleCard}
                  size="small"
                />
              </View>
            ))}
          </View>
          
          {ownedCards.length === 0 && (
            <View style={styles.emptyInventory}>
              <Text style={styles.emptyInventoryText}>Bạn không có thẻ bài nào để hợp nhất.</Text>
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
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 4,
  },
  valueAmount: {
    fontSize: 20,
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
    fontSize: 20,
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
    marginHorizontal: -6,
  },
  gridItem: {
    width: '33.33%',
    padding: 6,
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
});
