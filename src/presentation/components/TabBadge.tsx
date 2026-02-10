// Badge Component for Tab Icons
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TabBadgeProps {
  count: number;
  children: React.ReactNode;
}

export const TabBadge: React.FC<TabBadgeProps> = ({ count, children }) => {
  return (
    <View style={styles.container}>
      {children}
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
  },
});
