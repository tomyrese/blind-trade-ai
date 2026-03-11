import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Modal, TouchableWithoutFeedback, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { Pokeball3D } from '../../../../shared/components/3d/Pokeball3D';
import { Card, RARITY_COLORS } from '../../../../shared/utils/cardData';
import { GachaCardItem, getTierColor } from '../../../../shared/components/GachaCardItem';
import Animated, { FadeIn, ZoomIn, FadeInUp, withDelay } from 'react-native-reanimated';
import { useTranslation } from '../../../../shared/utils/translations';
import { formatCurrency } from '../../../../shared/utils/currency';

const { width } = Dimensions.get('window');

interface LootboxProps {
  onAnimationComplete: () => void;
  reward: Card | null;
  currency: string;
  highestSelectedRarity: string;
}

export const Lootbox3D: React.FC<LootboxProps> = ({
  onAnimationComplete,
  reward,
  currency,
  highestSelectedRarity
}) => {
  const [phase, setPhase] = useState<'IDLE' | 'ANIMATING' | 'OPTIONS' | 'REVEAL'>('IDLE');
  const [started, setStarted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const { t } = useTranslation();

  const effectiveRarity = reward?.rarity || highestSelectedRarity;
  const tierColor = getTierColor(effectiveRarity);

  const onPokeballFinish = () => {
    setPhase('REVEAL');
  };

  const handleStart = () => {
    if (!started) {
      setStarted(true);
      setPhase('ANIMATING');
    }
  };

  const handleSkip = () => {
    if (phase === 'IDLE' || phase === 'ANIMATING') {
      setPhase('REVEAL');
      setStarted(true);
    }
  };

  const handleFlip = () => {
    if (!revealed) setRevealed(true);
  };

  // When card is revealed, wait a bit then show OPTIONS (Done button)
  useEffect(() => {
    if (revealed && phase === 'REVEAL') {
      const timer = setTimeout(() => {
        setPhase('OPTIONS');
      }, 1000); 
      return () => clearTimeout(timer);
    }
  }, [revealed, phase]);

  return (
    <Modal visible={true} transparent={true} animationType="fade">
      <View style={styles.container}>
        <View style={styles.overlay} />

        {/* 1. Pokeball Animation Phase */}
        {(phase === 'IDLE' || phase === 'ANIMATING') && (
          <TouchableWithoutFeedback onPress={handleStart}>
            <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ width: width, height: width }}>
                <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                  <ambientLight intensity={0.8} />
                  <directionalLight position={[5, 10, 5]} intensity={1.5} />
                  <pointLight position={[-5, -5, 5]} intensity={0.5} />

                  <Pokeball3D
                    tierColor={tierColor}
                    isMulti={false} // Trade Up always gives 1 card
                    onFinish={onPokeballFinish}
                    started={started}
                    onStart={handleStart}
                  />
                </Canvas>
              </View>

              <Text style={styles.tapText}>
                {started ? t('nav_tradeup') + "..." : "CHẠM ĐỂ MỞ"}
              </Text>

              {/* Skip Button */}
              <SafeAreaView style={styles.skipContainer}>
                <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                  <Text style={styles.skipText}>SKIP {'>>'}</Text>
                </TouchableOpacity>
              </SafeAreaView>
            </View>
          </TouchableWithoutFeedback>
        )}

        {/* 2. Reward Reveal Phase */}
        {(phase === 'REVEAL' || phase === 'OPTIONS') && reward && (
          <View style={styles.resultContainer}>
            <Animated.View entering={FadeIn.duration(500)} style={styles.resultHeader}>
              {!revealed && (
                 <Text style={styles.flipInstructionText}>{"CHẠM THẺ ĐỂ LẬT"}</Text>
              )}
            </Animated.View>

            <Animated.View entering={FadeIn.duration(600)} style={styles.cardWrapper}>
              <GachaCardItem 
                item={reward} 
                index={0} 
                revealed={revealed} 
                onFlip={handleFlip} 
                sizeMode="massive" 
              />
            </Animated.View>

            {/* Wait for REVEAL to finish, then show DONE button */}
            {phase === 'OPTIONS' && (
              <Animated.View entering={FadeInUp.duration(400)} style={styles.actionRow}>
                <TouchableWithoutFeedback onPress={onAnimationComplete}>
                  <View style={styles.doneBtn}>
                    <Text style={styles.doneBtnText}>{t('gacha_done') || 'XONG'}</Text>
                  </View>
                </TouchableWithoutFeedback>
              </Animated.View>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.98)', // Dark slate bg
  },
  tapText: {
    position: 'absolute',
    bottom: 120,
    color: 'white',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  resultContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultHeader: {
    position: 'absolute',
    top: 60,
    alignItems: 'center',
    zIndex: 10,
  },
  resultTitle: {
    color: '#eab308', // Gold text
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(234, 179, 8, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  cardWrapper: {
    width: width * 0.7,
    aspectRatio: 0.72,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  actionRow: {
    position: 'absolute',
    bottom: 80,
    width: '100%',
    alignItems: 'center',
  },
  doneBtn: {
    backgroundColor: '#3b82f6',
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  doneBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  skipContainer: { position: 'absolute', top: 10, right: 0, width: '100%', alignItems: 'flex-end', zIndex: 10000, padding: 10 },
  skipButton: { paddingVertical: 8, paddingHorizontal: 16 },
  skipText: { color: 'rgba(255,255,255,0.8)', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },
  flipInstructionText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  }
});
