// Updated HomeScreen with TanStack Query & SafeArea
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MarketDashboardScreen } from '../features/market/screens/MarketDashboardScreen';
import { useMarkets } from '../../shared/hooks/useMarkets';

export const HomeScreen: React.FC = () => {
  const { isLoading, error, data } = useMarkets();
  console.log('DEBUG: HomeScreen mounted. isLoading:', isLoading, 'error:', error, 'dataLength:', data?.length);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#ef4444" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <MarketDashboardScreen />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
