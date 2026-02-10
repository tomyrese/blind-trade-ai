// API Usage Examples

/**
 * MARKETS API EXAMPLES
 */

import { useMarkets, useMarket, usePrice } from '../hooks/useMarkets';

// Example 1: List all markets
const MarketsListExample = () => {
  const { data: markets, isLoading, error, refetch } = useMarkets();

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <>
      {markets?.map((market) => (
        <View key={market.id}>
          <Text>{market.name}: ${market.currentPrice}</Text>
        </View>
      ))}
      <Button onPress={() => refetch()}>Refresh</Button>
    </>
  );
};

// Example 2: Single market with auto-refresh
const MarketDetailExample = ({ symbol }: { symbol: string }) => {
  const { data: market, isLoading } = useMarket(symbol);
  
  // Auto-refreshes every 30 seconds
  return <Text>{market?.name}: ${market?.currentPrice}</Text>;
};

// Example 3: Real-time price tracking
const PriceTrackerExample = ({ symbol }: { symbol: string }) => {
  const { data: price } = usePrice(symbol);
  
  // Auto-refreshes every 15 seconds
  return <Text>${price}</Text>;
};

/**
 * ASSETS API EXAMPLES
 */

import { useAssets, useAddAsset, useUpdateAsset } from '../hooks/useMarkets';

// Example 4: Portfolio display
const PortfolioExample = () => {
  const { data: assets, isLoading } = useAssets();
  
  if (isLoading) return <Text>Loading portfolio...</Text>;
  
  const totalValue = assets?.reduce(
    (sum, asset) => sum + asset.amount * asset.currentPrice,
    0
  );
  
  return (
    <>
      <Text>Total: ${totalValue}</Text>
      {assets?.map((asset) => (
        <View key={asset.symbol}>
          <Text>{asset.symbol}: {asset.amount}</Text>
        </View>
      ))}
    </>
  );
};

// Example 5: Add asset mutation
const AddAssetExample = () => {
  const addAsset = useAddAsset();
  
  const handleAdd = () => {
    addAsset.mutate({
      symbol: 'BTC/USDT',
      amount: 0.5,
      averagePrice: 45000,
      currentPrice: 45234.56,
    }, {
      onSuccess: () => console.log('Asset added!'),
      onError: (error) => console.error(error),
    });
  };
  
  return (
    <Button onPress={handleAdd} disabled={addAsset.isPending}>
      {addAsset.isPending ? 'Adding...' : 'Add BTC'}
    </Button>
  );
};

// Example 6: Update asset
const UpdateAssetExample = ({ symbol }: { symbol: string }) => {
  const updateAsset = useUpdateAsset();
  
  const handleUpdate = () => {
    updateAsset.mutate({
      symbol,
      updates: { currentPrice: 46000 },
    });
  };
  
  return <Button onPress={handleUpdate}>Update Price</Button>;
};

/**
 * TRENDING API EXAMPLES
 */

import { useTrending } from '../hooks/useMarkets';

// Example 7: Trending cards
const TrendingExample = () => {
  const { data: trending, isLoading } = useTrending();
  
  if (isLoading) return <Text>Loading trending...</Text>;
  
  return (
    <>
      {trending?.map((card) => (
        <View key={card.id}>
          <Text>{card.name} ({card.rarity})</Text>
          <Text>${card.value}</Text>
        </View>
      ))}
    </>
  );
};

/**
 * COMBINED EXAMPLE: Dashboard with multiple queries
 */

const DashboardExample = () => {
  const { data: markets } = useMarkets();
  const { data: assets } = useAssets();
  const { data: trending } = useTrending();
  
  // All queries run in parallel and cached independently
  return (
    <>
      <Text>Markets: {markets?.length}</Text>
      <Text>Assets: {assets?.length}</Text>
      <Text>Trending: {trending?.length}</Text>
    </>
  );
};

/**
 * MANUAL REFETCH EXAMPLE
 */

import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../hooks/useMarkets';

const ManualRefetchExample = () => {
  const queryClient = useQueryClient();
  
  const refreshAll = () => {
    // Invalidate all market queries
    queryClient.invalidateQueries({ queryKey: queryKeys.markets });
    queryClient.invalidateQueries({ queryKey: queryKeys.assets });
  };
  
  return <Button onPress={refreshAll}>Refresh All</Button>;
};
