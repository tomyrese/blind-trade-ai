import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  interpolate,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { Card, RARITY_CONFIGS, RARITY_RANKS } from '../utils/cardData';

const { width } = Dimensions.get('window');

export const getTierColor = (rarity: string) => {
  const r = rarity.toLowerCase();
  const config = RARITY_CONFIGS[r as keyof typeof RARITY_CONFIGS];

  if (config) {
    return config.borderColor;
  }

  if (r.includes('secret') || r.includes('rainbow') || r.includes('vstar') || r.includes('vmax') || r.includes('gold')) {
    return '#FACC15'; 
  }
  if (r.includes('rare') || r.includes('holo')) {
    return '#A78BFA';
  }
  if (r.includes('uncommon')) {
    return '#34D399';
  }

  return '#9CA3AF';
};

interface GachaCardItemProps {
  item: Card;
  index: number;
  revealed: boolean;
  onFlip: () => void;
  sizeMode: 'big' | 'small' | 'massive'; // Added massive for TradeUp
}

export const GachaCardItem: React.FC<GachaCardItemProps> = ({ item, index, revealed, onFlip, sizeMode }) => {
  const tierColor = getTierColor(item.rarity);
  const rank = RARITY_RANKS[item.rarity as keyof typeof RARITY_RANKS] || 0;
  const isGoldTier = rank >= 5;
  const isPurpleTier = rank >= 3 && rank < 5;

  const hintBorderColor = revealed ? tierColor : tierColor + '40';

  const entryDelay = index * 100;
  const rotate = useSharedValue(0);
  const shineOpacity = useSharedValue(0);
  const borderRotate = useSharedValue(0);

  useEffect(() => {
    if (rank >= 3) {
      borderRotate.value = withRepeat(
        withTiming(360, { duration: 2500, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, []);

  useEffect(() => {
    if (revealed) {
      rotate.value = withTiming(180, { duration: 600 });
      if (rank >= 3) {
        shineOpacity.value = withDelay(500, withSequence(
          withTiming(1, { duration: 150 }), 
          withTiming(0, { duration: 500 })    
        ));
      }
    } else {
      rotate.value = 0;
      shineOpacity.value = 0;
    }
  }, [revealed]);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const spin = interpolate(rotate.value, [0, 180], [180, 360]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${spin}deg` }],
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const spin = interpolate(rotate.value, [0, 180], [0, 180]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${spin}deg` }],
    };
  });

  const beam1Style = useAnimatedStyle(() => ({
    opacity: shineOpacity.value,
    transform: [{ rotate: '45deg' }, { scale: interpolate(shineOpacity.value, [0, 1], [0.8, 1.8]) }]
  }));

  const beam2Style = useAnimatedStyle(() => ({
    opacity: shineOpacity.value,
    transform: [{ rotate: '-45deg' }, { scale: interpolate(shineOpacity.value, [0, 1], [0.8, 1.8]) }]
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: shineOpacity.value * 0.5,
    transform: [{ scale: 1.4 }]
  }));

  const flashOverlayStyle = useAnimatedStyle(() => ({
    opacity: shineOpacity.value
  }));

  const runningBorderStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${borderRotate.value}deg` }]
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(entryDelay).duration(500)}
      style={sizeMode === 'massive' ? styles.massiveCardSpace : sizeMode === 'big' ? styles.bigCardSpace : styles.cardSpace2Col}
    >
      {(rank >= 3) && (
        <>
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              { zIndex: -1, justifyContent: 'center', alignItems: 'center' },
              beam1Style
            ]}
          >
            <LinearGradient
              colors={['transparent', tierColor, tierColor, 'transparent']}
              start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
              style={{ width: '150%', height: '20%' }}
            />
            <LinearGradient
              colors={['transparent', 'white', 'white', 'transparent']}
              start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
              style={{ position: 'absolute', width: '5%', height: '140%' }}
            />
          </Animated.View>

          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              { zIndex: -1, justifyContent: 'center', alignItems: 'center' },
              beam2Style
            ]}
          >
            <LinearGradient
              colors={['transparent', tierColor, tierColor, 'transparent']}
              start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
              style={{ width: '150%', height: '20%' }}
            />
            <LinearGradient
              colors={['transparent', 'white', 'white', 'transparent']}
              start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
              style={{ position: 'absolute', width: '5%', height: '140%' }}
            />
          </Animated.View>

          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              { zIndex: -2, backgroundColor: tierColor, borderRadius: 20 },
              haloStyle
            ]}
          />
        </>
      )}

      <TouchableOpacity activeOpacity={0.9} onPress={onFlip} style={{ flex: 1 }}>
        <View style={styles.cardBaseContainer}>
          <Animated.View style={[
            styles.cardFace,
            styles.cardFront,
            frontAnimatedStyle,
            {
              borderColor: (rank >= 3) ? 'transparent' : tierColor,
              borderWidth: (rank >= 3) ? 0 : (isGoldTier ? 4 : 2),
              shadowColor: tierColor,
              shadowOpacity: 0.6,
              shadowRadius: 10,
              elevation: 5,
              padding: (rank >= 3) ? 3 : 0,
            }
          ]}>
            {(rank >= 3) && (
              <View style={[StyleSheet.absoluteFill, { overflow: 'hidden', borderRadius: 12 }]}>
                <Animated.View style={[
                  { width: '250%', height: '250%', position: 'absolute', top: '-75%', left: '-75%' },
                  runningBorderStyle
                ]}>
                  <LinearGradient
                    colors={['transparent', tierColor, tierColor, 'transparent']}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 1, y: 1 }}
                    locations={[0.35, 0.45, 0.55, 0.65]}
                    style={{ flex: 1 }}
                  />
                </Animated.View>
              </View>
            )}

            <View style={{ flex: 1, width: '100%', borderRadius: 9, overflow: 'hidden', backgroundColor: '#0f172a' }}>
              <Image source={item.image} style={styles.cardImg} resizeMode="cover" />
              <View style={styles.cardOverlay}>
                <Text style={[styles.cardNameText, { color: tierColor }]}>{item.name}</Text>
              </View>
              {(isPurpleTier || isGoldTier) && (
                <Animated.View
                  style={[
                    StyleSheet.absoluteFillObject,
                    { backgroundColor: 'white', zIndex: 10 },
                    flashOverlayStyle
                  ]}
                />
              )}
            </View>
          </Animated.View>

          <Animated.View style={[
            styles.cardFace,
            styles.cardBack,
            backAnimatedStyle,
            {
              borderColor: (rank >= 3 && !revealed) ? 'transparent' : hintBorderColor,
              borderWidth: (rank >= 3 && !revealed) ? 0 : 2,
              shadowColor: tierColor,
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 3,
              padding: (rank >= 3 && !revealed) ? 3 : 0, 
            }
          ]}>
            {(rank >= 3 && !revealed) && (
              <View style={[StyleSheet.absoluteFill, { overflow: 'hidden', borderRadius: 12 }]}>
                <Animated.View style={[
                  { width: '250%', height: '250%', position: 'absolute', top: '-75%', left: '-75%' },
                  runningBorderStyle
                ]}>
                  <LinearGradient
                    colors={['transparent', tierColor, tierColor, 'transparent']}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 1, y: 1 }}
                    locations={[0.35, 0.45, 0.55, 0.65]}
                    style={{ flex: 1 }}
                  />
                </Animated.View>
              </View>
            )}

            <View style={{ flex: 1, width: '100%', borderRadius: 9, backgroundColor: '#0f172a', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
              <View style={styles.pokeballDecor}>
                <View style={styles.pokeballTop} />
                <View style={styles.pokeballBelt} />
                <View style={styles.pokeballBase} />
                <View style={styles.pokeballCenter} />
              </View>
              <Sparkles color={tierColor} size={32} opacity={0.6} />
              <Text style={styles.rarityHintText}>
                {(RARITY_CONFIGS[item.rarity as keyof typeof RARITY_CONFIGS]?.label || item.rarity).toUpperCase()}
              </Text>
            </View>
          </Animated.View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardSpace2Col: { width: Math.min(width * 0.40, 160), aspectRatio: 0.72 },
  bigCardSpace: { width: Math.min(width * 0.6, 280), aspectRatio: 0.72 },
  massiveCardSpace: { width: width * 0.75, aspectRatio: 0.72 }, // Used for TradeUp single result
  cardBaseContainer: { flex: 1, borderRadius: 12 },
  cardFace: { ...StyleSheet.absoluteFillObject, borderRadius: 12, backfaceVisibility: 'hidden', justifyContent: 'center', alignItems: 'center' },
  cardFront: { backgroundColor: '#0f172a' },
  cardBack: { backgroundColor: '#0f172a' },
  cardImg: { width: '100%', height: '100%' },
  cardOverlay: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'rgba(0,0,0,0.85)', padding: 10, alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  cardNameText: { fontSize: 13, fontWeight: '900', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5 },
  rarityHintText: { color: 'white', fontSize: 11, fontWeight: '900', position: 'absolute', bottom: 15, opacity: 0.8, letterSpacing: 1 },
  pokeballDecor: { position: 'absolute', width: 100, height: 100, borderRadius: 50, overflow: 'hidden', opacity: 0.1, borderWidth: 4, borderColor: '#0f172a' },
  pokeballTop: { flex: 1, backgroundColor: '#ef4444' },
  pokeballBase: { flex: 1, backgroundColor: 'white' },
  pokeballBelt: { position: 'absolute', top: '46%', width: '100%', height: 8, backgroundColor: '#0f172a' },
  pokeballCenter: { position: 'absolute', top: '50%', left: '50%', width: 28, height: 28, marginLeft: -14, marginTop: -14, borderRadius: 14, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
});
