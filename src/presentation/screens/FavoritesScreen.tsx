import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Heart } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useFavoritesStore } from '../../shared/stores/favoritesStore';
import { CardItem } from '../features/tradeup/components/CardItem';
import { useMarkets } from '../../shared/hooks/useMarkets';
import { mapRarity } from '../../shared/utils/cardData';

export const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { favoriteIds } = useFavoritesStore();
  const { data: markets, isLoading, refetch } = useMarkets();
  
  const favoriteCards = useMemo(() => {
    if (!markets) return [];
    return markets.filter(market => favoriteIds.includes(market.id));
  }, [markets, favoriteIds]);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.gridItem}>
      <CardItem 
        card={{
            id: item.id,
            name: item.name,
            rarity: mapRarity(item.rarity),
            value: item.currentPrice,
            symbol: item.symbol,
            tcgPlayerPrice: item.tcgPlayerPrice,
            cardMarketPrice: item.cardMarketPrice,
            listings: item.listings
        }} 
        onToggle={() => navigation.navigate('CardDetail', { symbol: item.symbol })} 
      />
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ChevronLeft size={24} color="#1e293b" />
        </Pressable>
        <Text style={styles.headerTitle}>Yêu Thích ({favoriteCards.length})</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={favoriteCards}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#ef4444" />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
                <Heart size={48} color="#cbd5e1" fill="#f1f5f9" />
            </View>
            <Text style={styles.emptyTitle}>Chưa có yêu thích</Text>
            <Text style={styles.emptyDesc}>
                Hãy thả tim những thẻ bài bạn quan tâm để lưu lại vào đây nhé!
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#f8fafc' 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  listContent: { 
    padding: 16,
    paddingBottom: 40,
    minHeight: '100%',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridItem: { 
    width: '48%',
  },
  emptyState: { 
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: 100,
    padding: 24,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#1e293b', 
    marginBottom: 8 
  },
  emptyDesc: { 
    fontSize: 15, 
    color: '#64748b', 
    textAlign: 'center',
    lineHeight: 22,
  },
});
