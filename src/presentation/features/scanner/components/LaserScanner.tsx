// Laser Scanning Animation
import React, { useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface LaserScannerProps {
  isScanning: boolean;
}

export const LaserScanner: React.FC<LaserScannerProps> = ({ isScanning }) => {
  const translateY = useSharedValue(-100);

  useEffect(() => {
    if (isScanning) {
      translateY.value = withRepeat(
        withTiming(100, {
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    } else {
      translateY.value = withTiming(-100, { duration: 300 });
    }
  }, [isScanning]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  if (!isScanning) return null;

  return (
    <View
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Laser line */}
      <Animated.View
        style={[
          {
            width: '100%',
            height: 4,
            backgroundColor: '#3b82f6',
            shadowColor: '#3b82f6',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 20,
          },
          animatedStyle,
        ]}
      />

      {/* Glow effect */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: '100%',
            height: 60,
            backgroundColor: '#3b82f6',
            opacity: 0.2,
            shadowColor: '#3b82f6',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 40,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};
