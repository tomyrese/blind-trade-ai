// Presentation Layer - Markets List Screen
import React from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useMarkets } from '../../../../shared/hooks/useMarkets';
import { MarketCard } from '../components/MarketCard';
import { Market } from '../../../../domain/models/Market';

export const MarketsListScreen: React.FC = () => {
  const { data: markets, isLoading, error, refetch, isRefetching } = useMarkets();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-gray-900">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600 dark:text-gray-400">
          Loading markets...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-gray-900 px-6">
        <Text className="text-red-500 text-lg font-semibold mb-2">
          Error loading markets
        </Text>
        <Text className="text-gray-600 dark:text-gray-400 text-center">
          {error.message}
        </Text>
      </View>
    );
  }

  const handleMarketPress = (market: Market) => {
    console.log('Market pressed:', market.symbol);
    // Navigate to market details screen
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="px-4 pt-6 pb-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">
          Markets
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {markets?.length || 0} trading pairs
        </Text>
      </View>

      <FlatList
        data={markets}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <MarketCard market={item} onPress={handleMarketPress} />
        )}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor="#3b82f6"
          />
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-12">
            <Text className="text-gray-500 dark:text-gray-400">
              No markets available
            </Text>
          </View>
        }
      />
    </View>
  );
};
