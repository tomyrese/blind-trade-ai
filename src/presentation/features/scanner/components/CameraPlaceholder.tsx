// Camera Placeholder for AI Scanner
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Camera, Scan } from 'lucide-react-native';

export const CameraPlaceholder: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Grid overlay */}
      <View style={styles.grid}>
        {[...Array(6)].map((_, i) => (
          <View key={`v-${i}`} style={[styles.gridLineV, { left: `${(i + 1) * 16.6}%` }]} />
        ))}
        {[...Array(8)].map((_, i) => (
          <View key={`h-${i}`} style={[styles.gridLineH, { top: `${(i + 1) * 12.5}%` }]} />
        ))}
      </View>

      <View style={styles.iconContainer}>
        <Camera size={64} color="#3b82f6" />
      </View>
      <Text style={styles.title}>Camera nhắm vào Sticker</Text>
      <Text style={styles.subtitle}>AI đang chờ nhận diện mã...</Text>

      {/* Frame corners */}
      <View style={[styles.corner, styles.topLeft]} />
      <View style={[styles.corner, styles.topRight]} />
      <View style={[styles.corner, styles.bottomLeft]} />
      <View style={[styles.corner, styles.bottomRight]} />

      <View style={styles.scanIndicator}>
        <Scan size={24} color="#3b82f6" />
        <Text style={styles.scanText}>Đang Quét...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 400,
    backgroundColor: '#0f172a',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#1e293b',
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#3b82f6',
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#3b82f6',
  },
  iconContainer: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    zIndex: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    zIndex: 1,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 8,
    zIndex: 1,
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#3b82f6',
    zIndex: 1,
  },
  topLeft: {
    top: 20,
    left: 20,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 20,
    right: 20,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 20,
    left: 20,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 20,
    right: 20,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  scanIndicator: {
    marginTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1,
  },
  scanText: {
    color: '#3b82f6',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
