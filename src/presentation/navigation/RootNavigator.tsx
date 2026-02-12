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
import { PurchaseHistoryScreen } from '../screens/PurchaseHistoryScreen';
import { TransactionDetailScreen } from '../screens/TransactionDetailScreen';
import { useUserStore } from '../../shared/stores/userStore';
const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const hasHydrated = useUserStore((state) => state.hasHydrated);

  const [shouldShowApp, setShouldShowApp] = useState(() =>
    useUserStore.getState().hasHydrated
  );

  useEffect(() => {
    if (hasHydrated) {
      setShouldShowApp(true);
      return;
    }

    const timer = setTimeout(() => {
      setShouldShowApp(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, [hasHydrated]);

  if (!shouldShowApp) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#ee1515',
        }}
      >
        <ActivityIndicator size="large" color="#ffffff" />
        <Text
          style={{
            color: '#ffffff',
            marginTop: 12,
            fontWeight: '700',
            fontSize: 12,
          }}
        >
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
          <Stack.Screen name="PurchaseHistory" component={PurchaseHistoryScreen} />
          <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
