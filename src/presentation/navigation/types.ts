// Navigation Type Definitions
import { NavigatorScreenParams } from '@react-navigation/native';

// Root Stack Navigator
export type RootStackParamList = {
  Splash: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  MarketDetail: { symbol: string };
  TradeExecute: { symbol: string; type: 'buy' | 'sell' };
  CardDetail: { symbol: string };
  Cart: undefined;
  Favorites: undefined;
  OtherCategory: undefined;
  TrainerEdit: undefined;
};

// Main Bottom Tab Navigator
export type MainTabParamList = {
  Home: undefined;
  Portfolio: undefined;
  TradeUp: undefined;
  AIChat: undefined;
  Profile: undefined;
};

// Navigation Props Helper Types
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type MainTabNavigationProp = BottomTabNavigationProp<MainTabParamList>;
