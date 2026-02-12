// Lootbox Opening Animation using Reanimated
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  runOnJS,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { Package, Sparkles } from 'lucide-react-native';
import { Card, RARITY_COLORS } from '../../../../shared/utils/cardData';
import { formatCurrency } from '../../../../shared/utils/currency';

const { width, height } = Dimensions.get('window');

interface LootboxAnimationProps {
  isOpen: boolean;
  reward: Card | null;
  onClose: () => void;
  currency: string;
}

export const LootboxAnimation: React.FC<LootboxAnimationProps> = ({
  isOpen,
  reward,
  onClose,
  currency,
}) => {
  const [isOpened, setIsOpened] = useState(false);
  
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);
  const cardScale = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const statusOpacity = useSharedValue(1);

  useEffect(() => {
    if (isOpen && !isOpened) {
      // Gentle rattle while waiting for user to open
      rotation.value = withRepeat(
        withSequence(
          withTiming(-3, { duration: 150 }),
          withTiming(3, { duration: 150 })
        ),
        -1,
        true
      );
    } else if (!isOpen) {
      // Reset state when overlay is hidden
      setIsOpened(false);
      scale.value = 1;
      rotation.value = 0;
      opacity.value = 1;
      cardScale.value = 0;
      glowOpacity.value = 0;
      statusOpacity.value = 1;
    }
  }, [isOpen, isOpened]);

  const handleOpenChest = () => {
    if (isOpened) return;
    setIsOpened(true);
    cancelAnimation(rotation);
    
    // 1. Shake intensely
    rotation.value = withSequence(
      withRepeat(
        withSequence(
          withTiming(-15, { duration: 40 }),
          withTiming(15, { duration: 40 })
        ),
        8,
        true
      ),
      withTiming(0, { duration: 100 })
    );

    statusOpacity.value = withTiming(0, { duration: 200 });

    // 2. Expand and explode
    setTimeout(() => {
      scale.value = withTiming(3, { duration: 500, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
      opacity.value = withTiming(0, { duration: 400 });

      // 3. Reveal the card
      setTimeout(() => {
        cardScale.value = withSpring(1, { damping: 12, stiffness: 100 });
        glowOpacity.value = withRepeat(
          withTiming(0.8, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          -1,
          true
        );

        // 4. Auto close after viewing
        setTimeout(() => {
          runOnJS(onClose)();
        }, 5000);
      }, 400);
    }, 600);
  };

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

  const statusStyle = useAnimatedStyle(() => ({
    opacity: statusOpacity.value,
  }));

  if (!isOpen || !reward) return null;

  const rarityColor = RARITY_COLORS[reward.rarity] || '#3b82f6';

  return (
    <View style={styles.overlay}>
      {/* The Interactive Box (Chest) */}
      <Animated.View style={[styles.boxContainer, boxStyle]}>
        <Pressable onPress={handleOpenChest} style={styles.boxPressable}>
          <View style={styles.chestWrapper}>
            <View style={styles.chestBody}>
                <Package size={80} color="#ffffff" strokeWidth={1.5} />
                <View style={styles.chestDecor}>
                    <Sparkles size={20} color="rgba(255,255,255,0.5)" />
                </View>
            </View>
            <View style={styles.chestBase} />
          </View>
        </Pressable>
        {!isOpened && (
          <Animated.View style={statusStyle}>
             <Text style={styles.statusText}>Hợp Nhất Thành Công!</Text>
             <Text style={styles.tapToOpenText}>Nhấp vào rương để mở</Text>
          </Animated.View>
        )}
      </Animated.View>

      {/* The Reward */}
      {isOpened && (
        <Animated.View style={[styles.rewardContainer, cardStyle]}>
          <Animated.View style={[styles.glow, glowStyle, { shadowColor: rarityColor, backgroundColor: rarityColor }]} />
          <View style={[styles.card, { borderColor: rarityColor }]}>
            <View style={[styles.cardImage, { backgroundColor: rarityColor }]}>
              <Text style={styles.cardInitial}>{reward.name.charAt(0)}</Text>
            </View>
            <Text style={styles.cardName}>{reward.name}</Text>
            <Text style={[styles.cardRarity, { color: rarityColor }]}>{reward.rarity.toUpperCase()}</Text>
            <Text style={styles.cardValue}>{formatCurrency(reward.value, currency === 'USD' ? 'USD' : 'VND')}</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  boxContainer: {
    width: 250,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxPressable: {
    padding: 20,
  },
  chestWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chestBody: {
    width: 160,
    height: 130,
    backgroundColor: '#92400e',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#78350f',
    position: 'relative',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  chestDecor: {
    position: 'absolute',
    top: 10,
    right: 15,
  },
  chestBase: {
    width: 140,
    height: 10,
    backgroundColor: '#451a03',
    borderRadius: 5,
    marginTop: -5,
    zIndex: -1,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 24,
    textAlign: 'center',
    textShadowColor: 'rgba(245, 158, 11, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 0.5,
  },
  tapToOpenText: {
    color: '#fcd34d',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    textAlign: 'center',
    opacity: 0.9,
  },
  rewardContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 400,
    borderRadius: 50,
    opacity: 0.15,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 60,
    elevation: 30,
  },
  card: {
    width: 260,
    height: 380,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 25,
  },
  cardImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  cardInitial: {
    fontSize: 80,
    color: '#ffffff',
    fontWeight: '900',
  },
  cardName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
  },
  cardRarity: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
    letterSpacing: 1,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#10b981',
    marginTop: 20,
  },
});
