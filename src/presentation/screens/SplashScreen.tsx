// Splash Screen - Optimized Pokemon Theme
import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../navigation/types';
import { Sparkles } from 'lucide-react-native';

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();

  useEffect(() => {
    // Simulate loading/initialization
    const timer = setTimeout(() => {
      console.log('Navigating to MainTabs');
      navigation.replace('MainTabs');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.pokeballTop} />
      <View style={styles.pokeballBottom} />
      
      <View style={styles.centerContainer}>
        <View style={styles.logoCircle}>
          <Sparkles size={48} color="#ef4444" fill="#ef4444" />
        </View>
        <Text style={styles.title}>POKÉ MARKET</Text>
        <Text style={styles.subtitle}>BlindTrade AI Integration</Text>
        
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Đang tải dữ liệu Trainer...</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pokeballTop: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: '50%',
    backgroundColor: '#ef4444',
    borderBottomWidth: 10,
    borderBottomColor: '#1e293b',
  },
  pokeballBottom: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '50%',
    backgroundColor: '#ffffff',
    borderTopWidth: 10,
    borderTopColor: '#1e293b',
  },
  centerContainer: {
    alignItems: 'center',
    zIndex: 10,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffffff',
    borderWidth: 10,
    borderColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '800',
    marginTop: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  loaderContainer: {
    marginTop: 60,
    alignItems: 'center',
  },
  loadingText: {
    color: '#1e293b',
    marginTop: 16,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
