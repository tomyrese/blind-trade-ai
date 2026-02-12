// TanStack Query Hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { marketsApi, assetsApi, trendingApi } from '../api/endpoints';
import { Asset } from '../../domain/models/Asset';

// Query Keys
export const queryKeys = {
  markets: ['markets'] as const,
  market: (symbol: string) => ['market', symbol] as const,
  assets: ['assets'] as const,
  trending: ['trending'] as const,
};

// Market Queries
export const useMarkets = () => {
  return useQuery({
    queryKey: queryKeys.markets,
    queryFn: marketsApi.fetchMarkets,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every 60 seconds
  });
};

export const useMarket = (symbol: string) => {
  return useQuery({
    queryKey: queryKeys.market(symbol),
    queryFn: () => marketsApi.fetchMarket(symbol),
    staleTime: 30000,
    enabled: !!symbol,
  });
};

export const usePrice = (symbol: string) => {
  return useQuery({
    queryKey: ['price', symbol],
    queryFn: () => marketsApi.fetchPrice(symbol),
    staleTime: 10000, // 10 seconds
    refetchInterval: 15000, // Refetch every 15 seconds
    enabled: !!symbol,
  });
};

// Assets Queries
export const useAssets = () => {
  return useQuery({
    queryKey: queryKeys.assets,
    queryFn: assetsApi.fetchAssets,
    staleTime: 60000, // 1 minute
  });
};

export const useAddAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (asset: Asset) => assetsApi.addAsset(asset),
    onSuccess: () => {
      // Invalidate and refetch assets
      queryClient.invalidateQueries({ queryKey: queryKeys.assets });
    },
  });
};

export const useUpdateAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ symbol, updates }: { symbol: string; updates: Partial<Asset> }) =>
      assetsApi.updateAsset(symbol, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assets });
    },
  });
};

// Trending Queries
export const useTrending = () => {
  return useQuery({
    queryKey: queryKeys.trending,
    queryFn: trendingApi.fetchTrending,
    staleTime: 300000, // 5 minutes
  });
};
