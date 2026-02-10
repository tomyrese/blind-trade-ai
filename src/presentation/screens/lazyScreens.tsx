// Lazy-loaded Screens
import React, { lazy, Suspense } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Loading fallback component
const LoadingScreen = () => (
  <SafeAreaView style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#3b82f6" />
  </SafeAreaView>
);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});

// Lazy load screens
export const HomeScreen = lazy(() =>
  import('./HomeScreen').then((module) => ({ default: module.HomeScreen }))
);

export const PortfolioScreen = lazy(() =>
  import('./PortfolioScreen').then((module) => ({ default: module.PortfolioScreen }))
);

export const TradeScreen = lazy(() =>
  import('./TradeScreen').then((module) => ({ default: module.TradeScreen }))
);

export const TradeUpScreen = lazy(() =>
  import('./TradeUpScreen').then((module) => ({ default: module.TradeUpScreen }))
);

export const ScannerScreen = lazy(() =>
  import('./ScannerScreen').then((module) => ({ default: module.ScannerScreen }))
);

export const ProfileScreen = lazy(() =>
  import('./ProfileScreen').then((module) => ({ default: module.ProfileScreen }))
);

// Wrapper component with Suspense
export const withLazyLoading = (Component: React.LazyExoticComponent<React.FC<any>>) => {
  return (props: any) => (
    <Suspense fallback={<LoadingScreen />}>
      <Component {...props} />
    </Suspense>
  );
};
