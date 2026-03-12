import React from 'react';
import { StatusBar, useColorScheme, View, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './src/presentation/navigation/RootNavigator';
import { QueryProvider } from './src/shared/providers/QueryProvider';
import { ToastProvider } from './src/shared/contexts/ToastContext';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: '#FF0000', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>CRITICAL ERROR</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 14 }}>Please check logcat/terminal</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

import NotificationService from './src/shared/utils/NotificationService';
import MarketAlertMonitor from './src/shared/utils/MarketAlertMonitor';

function App(): React.JSX.Element {
  React.useEffect(() => {
    // Request permissions on mount
    NotificationService.requestPermissions();
    // Start simulated monitor
    MarketAlertMonitor.start();
    
    return () => MarketAlertMonitor.stop();
  }, []);

  const isDarkMode = useColorScheme() === 'dark';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <QueryProvider>
            <ToastProvider>
              <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={isDarkMode ? '#000000' : '#FFFFFF'}
              />
              <NavigationContainer>
                <RootNavigator />
              </NavigationContainer>
            </ToastProvider>
          </QueryProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

export default App;
