import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { MainTabNavigator } from './MainTabNavigator';
import { CardDetailScreen } from '../features/market/screens/CardDetailScreen';
import { CartScreen } from '../screens/CartScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { PaymentScreen } from '../screens/PaymentScreen';
import { useUserStore } from '../../shared/stores/userStore';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const hasHydrated = useUserStore((state) => state.hasHydrated);

  // Local state to track if we should stop waiting
  const [shouldShowApp, setShouldShowApp] = useState(false);

  useEffect(() => {
    // If store says it's hydrated, show app immediately
    if (hasHydrated) {
      setShouldShowApp(true);
      return;
    }

    // Safety timeout: If hydration takes more than 2.5 seconds, just show the app
    // This resolves the "infinite loading" spin if rehydration listener fails
    const timer = setTimeout(() => {
      setShouldShowApp(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, [hasHydrated]);

  if (!shouldShowApp) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ee1515' }}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={{ color: '#ffffff', marginTop: 12, fontWeight: '700', fontSize: 12 }}>
          POKÉ-MARKET INITIALIZING...
        </Text>
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen name="CardDetail" component={CardDetailScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="Favorites" component={FavoritesScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
