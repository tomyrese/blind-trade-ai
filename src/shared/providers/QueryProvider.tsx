// QueryClient Provider Setup
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create QueryClient instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30000, // 30 seconds default
      gcTime: 300000, // 5 minutes garbage collection
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Provider Component
export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
