// Beautiful Toast Notification Component
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { CheckCircle, Heart, ShoppingCart, X, AlertCircle } from 'lucide-react-native';

export type ToastType = 'success' | 'error' | 'favorite' | 'cart';

interface ToastProps {
  visible: boolean;
  message: string;
  type: ToastType;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ visible, message, type, onDismiss }) => {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      // Slide in from top
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 65,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 3 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible) return null;

  const config = {
    success: {
      backgroundColor: '#10b981',
      icon: <CheckCircle size={24} color="#ffffff" />,
    },
    error: {
      backgroundColor: '#ef4444',
      icon: <AlertCircle size={24} color="#ffffff" />,
    },
    favorite: {
      backgroundColor: '#ef4444',
      icon: <Heart size={24} color="#ffffff" fill="#ffffff" />,
    },
    cart: {
      backgroundColor: '#3b82f6',
      icon: <ShoppingCart size={24} color="#ffffff" />,
    },
  };

  const currentConfig = config[type] || config.success;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
          backgroundColor: currentConfig.backgroundColor,
        },
      ]}
    >
      <View style={styles.iconContainer}>
        {currentConfig.icon}
      </View>
      <Text style={styles.message} numberOfLines={2}>
        {message}
      </Text>
      <Pressable onPress={handleDismiss} style={styles.closeButton}>
        <X size={20} color="#ffffff" />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    minHeight: 70,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  iconContainer: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
});
