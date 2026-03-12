import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions, Modal, TouchableWithoutFeedback, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { Pokeball3D } from '../../../../shared/components/3d/Pokeball3D';
import { Card, CardRarity, RARITY_COLORS, RARITY_CONFIGS, RARITY_RANKS } from '../../../../shared/utils/cardData';
import { GachaCardItem, getTierColor } from '../../../../shared/components/GachaCardItem';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useTranslation } from '../../../../shared/utils/translations';

const { width } = Dimensions.get('window');

// --- 3D Chest Component ---
import { CardItem } from './CardItem';

// --- Detailed Fantasy Chest Component ---
// --- (Particle and Chest 3D components removed - not compatible with React Native CLI) ---

const _Placeholder = null; // spacer

const __Placeholder2 = ({ active, color }: { active: boolean, color: string }) => {
    const count = 300;
    const mesh = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    
    // Store localized particle state
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            temp.push({
                pos: new THREE.Vector3(0, 0, 0),
                vel: new THREE.Vector3(0, 0, 0),
                scale: 0,
                life: 0,
                decay: 0,
                rot: new THREE.Vector3(Math.random(), Math.random(), Math.random())
            });
        }
        return temp;
    }, []);

    // Reset particles when activated
    const hasTriggered = useRef(false);
    useEffect(() => {
        if (active && !hasTriggered.current) {
            hasTriggered.current = true;
            particles.forEach(p => {
                const phi = Math.random() * Math.PI;
                const theta = Math.random() * 2 * Math.PI;
                const speed = 2 + Math.random() * 4;
                p.pos.set(0, 0.4, 0);
                p.vel.set(
                    Math.sin(phi) * Math.cos(theta) * speed,
                    Math.cos(phi) * speed + 3, // More upward force
                    Math.sin(phi) * Math.sin(theta) * speed
                );
                p.life = 1.0;
                p.decay = 0.005 + Math.random() * 0.015;
            });
        } else if (!active) {
            hasTriggered.current = false;
        }
    }, [active, particles]);

    useFrame((state, delta) => {
        if (!mesh.current || !active) return;

        particles.forEach((p, i) => {
            if (p.life > 0) {
                // Update physics
                p.pos.add(p.vel.clone().multiplyScalar(delta * 2));
                p.vel.y -= 9.8 * delta * 0.6; // Gravity
                p.vel.multiplyScalar(0.98); // Air resistance
                p.life -= p.decay;
                p.scale = Math.max(0, p.life);
                
                dummy.position.copy(p.pos);
                dummy.scale.setScalar(p.scale * 0.12);
                dummy.rotation.set(
                    state.clock.elapsedTime * p.rot.x * 5,
                    state.clock.elapsedTime * p.rot.y * 5,
                    state.clock.elapsedTime * p.rot.z * 5
                );
                dummy.updateMatrix();
                mesh.current!.setMatrixAt(i, dummy.matrix);
            } else {
                // Hide dead particles
                dummy.position.set(0, -100, 0);
                dummy.updateMatrix();
                mesh.current!.setMatrixAt(i, dummy.matrix);
            }
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return null; // placeholder removed
};

// (Chest 3D component removed - uses THREE.js refs not compatible with RN CLI builds)

// --- Main Interface Component ---
interface Lootbox3DProps {
  isOpen: boolean;
  onClose: () => void;
  reward: Card | null;
  currency: string;
  highestSelectedRarity: string;
}

export const Lootbox3D: React.FC<Lootbox3DProps> = ({
  isOpen,
  onClose,
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

  const isSuccess = useMemo(() => {
    if (!reward) return false;
    const rewardRank = RARITY_RANKS[reward.rarity] || 0;
    const targetRank = RARITY_RANKS[highestSelectedRarity as CardRarity] || 0;
    return rewardRank > targetRank;
  }, [reward, highestSelectedRarity]);

  if (!isOpen) return null;

  const rarityColor = reward ? (RARITY_COLORS[reward.rarity] || '#3b82f6') : '#3b82f6';
  const rarityConfig = reward ? RARITY_CONFIGS[reward.rarity] : null;
  const particleColor = rarityConfig?.color || rarityColor; // Use primary color for better saturation

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
            {phase === 'REVEAL' && !revealed && (
              <Animated.View entering={FadeIn.duration(500)} style={styles.resultHeader}>
                <Text style={styles.flipInstructionText}>{"CHẠM THẺ ĐỂ LẬT"}</Text>
              </Animated.View>
            )}

            {/* Success/Failure text */}
            <View style={styles.congratsContainer}>
                <Text style={styles.congratsText}>
                    {isSuccess ? t('fusion_success') : t('fusion_failed')}
                </Text>
            </View>

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
                <TouchableWithoutFeedback onPress={onClose}>
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
  },
  congratsContainer: {
    position: 'absolute',
    top: 100,
    width: '100%',
    alignItems: 'center',
  },
  congratsText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  }
});
