// Lootbox Opening Animation using Reanimated
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Card, RARITY_COLORS } from '../../../../shared/utils/cardData';
import { formatVND } from '../../../../shared/utils/formatters';

const { width, height } = Dimensions.get('window');

interface LootboxAnimationProps {
  isOpen: boolean;
  reward: Card | null;
  onClose: () => void;
}

export const LootboxAnimation: React.FC<LootboxAnimationProps> = ({
  isOpen,
  reward,
  onClose,
}) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);
  const cardScale = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (isOpen && reward) {
      // 1. Shake before opening
      rotation.value = withRepeat(
        withSequence(
          withTiming(-10, { duration: 100 }),
          withTiming(10, { duration: 100 })
        ),
        4,
        true
      );

      // 2. Expand and explode
      setTimeout(() => {
        scale.value = withTiming(2, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 });

        // 3. Reveal the card
        setTimeout(() => {
          cardScale.value = withSpring(1, { damping: 10 });
          glowOpacity.value = withRepeat(
            withTiming(0.8, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
          );

          // 4. Auto complete after viewing
          setTimeout(() => {
            runOnJS(onClose)();
          }, 3000);
        }, 300);
      }, 1000);
    } else {
      // Reset
      scale.value = 1;
      rotation.value = 0;
      opacity.value = 1;
      cardScale.value = 0;
      glowOpacity.value = 0;
    }
  }, [isOpen, reward, onClose, rotation, scale, opacity, cardScale, glowOpacity]);

  const boxStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
    opacity: opacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardScale.value > 0 ? 1 : 0,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  if (!isOpen || !reward) return null;

  const rarityColor = RARITY_COLORS[reward.rarity] || '#3b82f6';

  return (
    <View style={styles.overlay}>
      {/* The Box */}
      <Animated.View style={[styles.boxContainer, boxStyle]}>
        <View style={styles.box}>
          <Text style={styles.boxText}>🎁</Text>
        </View>
        <Text style={styles.statusText}>Đang Hợp Nhất...</Text>
      </Animated.View>

      {/* The Reward */}
      {reward && (
        <Animated.View style={[styles.rewardContainer, cardStyle]}>
          <Animated.View style={[styles.glow, glowStyle, { shadowColor: rarityColor, backgroundColor: rarityColor }]} />
          <View style={[styles.card, { borderColor: rarityColor }]}>
            <View style={[styles.cardImage, { backgroundColor: rarityColor }]}>
              <Text style={styles.cardInitial}>{reward.name.charAt(0)}</Text>
            </View>
            <Text style={styles.cardName}>{reward.name}</Text>
            <Text style={[styles.cardRarity, { color: rarityColor }]}>{reward.rarity.toUpperCase()}</Text>
            <Text style={styles.cardValue}>{formatVND(reward.value)}</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  boxContainer: {
    width: 150,
    height: 150,
    alignItems: 'center',
  },
  statusText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
    width: 200,
  },
  box: {
    width: 150,
    height: 150,
    backgroundColor: '#f59e0b',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#d97706',
  },
  boxText: {
    fontSize: 64,
  },
  rewardContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 260,
    height: 360,
    borderRadius: 30,
    opacity: 0.2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 50,
    elevation: 20,
  },
  card: {
    width: 240,
    height: 340,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 6,
  },
  cardImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardInitial: {
    fontSize: 64,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  cardName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  cardRarity: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
    marginTop: 16,
  },
});
