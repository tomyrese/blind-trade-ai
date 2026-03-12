import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Dimensions, Modal, TouchableWithoutFeedback, Text, TouchableOpacity, SafeAreaView, Image, Text as RNText } from 'react-native';
import { Canvas, useFrame, useThree } from '@react-three/fiber/native';
import { Pokeball3D } from '../../../../shared/components/3d/Pokeball3D';
import { Card, CardRarity, RARITY_COLORS, RARITY_CONFIGS, RARITY_RANKS } from '../../../../shared/utils/cardData';
import { GachaCardItem, getTierColor } from '../../../../shared/components/GachaCardItem';
import Animated, { FadeIn, ZoomIn, FadeInUp, withDelay } from 'react-native-reanimated';
import { useTranslation } from '../../../../shared/utils/translations';
import { formatCurrency } from '../../../../shared/utils/currency';
import * as THREE from 'three';
import { useGLTF, useTexture } from '@react-three/drei/native';
import * as Asset from 'expo-asset';

const { width } = Dimensions.get('window');

// --- 3D Chest Component ---
import { CardItem } from './CardItem';

// --- Detailed Fantasy Chest Component ---
// --- Dynamic Particle Burst Component ---
const ParticleBurst = ({ active, color }: { active: boolean, color: string }) => {
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

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]} position={[0, 0, 0]}>
            <dodecahedronGeometry args={[0.3, 0]} />
            <meshStandardMaterial 
                color={color} 
                emissive={color} 
                emissiveIntensity={2} // Lower intensity to prevent white-out
                toneMapped={true} 
                transparent 
                opacity={0.9} 
            />
        </instancedMesh>
    );
};

// --- 3D Reward Card Component ---
const RewardCard3D = ({ active, image, rarityColor, isSuccess, onComplete }: { 
    active: boolean, 
    image: any, 
    rarityColor: string, 
    isSuccess: boolean,
    onComplete: () => void
}) => {
    const mesh = useRef<THREE.Mesh>(null);
    const [phase, setPhase] = useState<'hidden' | 'pop' | 'vanish'>('hidden');
    
    // Safe texture loading - using public CDN or local asset
    const textureUri = image ? (typeof image === 'string' ? image : 'https://placehold.co/400x600/png?text=Fusion+Reward') : 'https://placehold.co/400x600/png?text=Fusion+Failed';
    const texture = useTexture(textureUri);
    
    // Spring physics refs for ultra-smooth motion
    const posYSprung = useRef(0);
    const posYVelocity = useRef(0);
    const scaleSprung = useRef(0.1);
    const scaleVelocity = useRef(0);
    const spinVelocity = useRef(0);
    const opacity = useRef(1);

    useEffect(() => {
        if (active && phase === 'hidden') {
            setPhase('pop');
            spinVelocity.current = 10; // Slower initial spin
        }
    }, [active, isSuccess]);

    if (texture) {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.flipY = false;
    }

    useFrame((state, delta) => {
        if (!mesh.current || phase === 'hidden') return;
        
        if (phase === 'pop') {
            const targetY = isSuccess ? 2.0 : 1.4; // Lower peaks for smaller scene
            const targetScale = isSuccess ? 1.5 : 1.2; // Even smaller card as requested

            // Absolute smoothness via Ease-Out Lerp
            mesh.current.position.y = THREE.MathUtils.lerp(mesh.current.position.y, targetY, 0.035);
            
            // Spin Deceleration
            mesh.current.rotation.y += spinVelocity.current * delta;
            spinVelocity.current *= 0.94; 
            mesh.current.rotation.y = THREE.MathUtils.lerp(mesh.current.rotation.y, 0, 0.01); // Slowly align to front

            // Scale Lerp
            mesh.current.scale.setScalar(THREE.MathUtils.lerp(mesh.current.scale.x, targetScale, 0.04));

            // Apex logic: when height is 99% reached
            if (Math.abs(targetY - mesh.current.position.y) < 0.02) {
                setPhase('vanish');
                onComplete(); // Official reveal
            }
        } else if (phase === 'vanish') {
            // Explosive vanish towards screen
            mesh.current.scale.setScalar(mesh.current.scale.x + delta * 12);
            opacity.current = Math.max(0, opacity.current - delta * 6);
            mesh.current.position.z += delta * 15;
            
            if (opacity.current <= 0) {
                mesh.current.visible = false;
            }
        }
        
        // Secondary wobble (Organic)
        mesh.current.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.15;
        mesh.current.rotation.x = Math.cos(state.clock.elapsedTime * 2) * 0.1;
    });

    if (phase === 'hidden') return null;

    return (
        <mesh ref={mesh} position={[0, 0, 0]} scale={[0.1, 0.1, 0.1]}>
            <planeGeometry args={[1, 1.4]} />
            <meshStandardMaterial 
                map={isSuccess ? texture : null} 
                transparent 
                side={THREE.DoubleSide} 
                emissive={isSuccess ? rarityColor : '#450a0a'} // Dark blood red for failure
                opacity={opacity.current}
                emissiveIntensity={isSuccess ? 0.6 : 1.2}
                color={isSuccess ? '#ffffff' : '#1a1a1a'} // Dark charcoal for burnt/failed effect
            />
        </mesh>
    );
};

// --- Detailed Fantasy Chest Component ---
const Chest = ({ onOpenComplete, onOpenStart, onCardComplete, rarityColor, particleColor, rewardImage, isSuccess }: { 
    onOpenComplete: () => void, 
    onOpenStart?: () => void,
    onCardComplete: () => void,
    rarityColor: string, 
    particleColor: string, 
    rewardImage: any,
    isSuccess: boolean 
}) => {
  const group = useRef<THREE.Group>(null);
  const lidRef = useRef<THREE.Group>(null);
  const latchRef = useRef<THREE.Group>(null);
  const gemRef = useRef<THREE.Mesh>(null);
  
  const [opening, setOpening] = useState(false);
  const [rumble, setRumble] = useState(false);
  const [opened, setOpened] = useState(false);
  const [showEffects, setShowEffects] = useState(false);
  
  const lidProgress = useRef(0);
  const lidVelocity = useRef(0);
  const floatOffset = useRef(0);

  // handlePress logic handled in useFrame and useEffect for state management
  const handlePress = () => {
    if (opening || rumble || opened) return;
    setRumble(true);
    
    // Intense rumble before burst
    setTimeout(() => {
        setRumble(false);
        setOpening(true);
        setShowEffects(true);
        if (onOpenStart) onOpenStart();
        onOpenComplete();
    }, 850);
  };

  useFrame((state, delta) => {
    // Pulse Gem
    if (gemRef.current) {
        const pulse = (Math.sin(state.clock.elapsedTime * 6) + 1) / 2;
        (gemRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + pulse * 2.5;
    }

    // Centering & Layout: Lifted significantly as requested
    const baseY = 0.4;

    // Rumble / Idle
    if (rumble && group.current) {
        // High-fidelity structured rumble (3-sine noise)
        const t = state.clock.elapsedTime;
        const rumbleX = (Math.sin(t * 80) + Math.sin(t * 113) + Math.sin(t * 157)) * 0.04;
        const rumbleZ = (Math.cos(t * 73) + Math.cos(t * 127) + Math.cos(t * 149)) * 0.04;
        const rumbleRot = (Math.sin(t * 97) + Math.sin(t * 131)) * 0.07;
        
        group.current.position.x = rumbleX;
        group.current.position.z = rumbleZ;
        group.current.rotation.z = rumbleRot;
        group.current.position.y = baseY + (Math.sin(t * 100) * 0.02);
    } else if (group.current && !opening && !opened) {
        floatOffset.current += delta;
        group.current.position.y = baseY + Math.sin(floatOffset.current * 1.5) * 0.08;
        group.current.position.x = 0;
        group.current.position.z = 0;
        group.current.rotation.z = 0;
    } else if (group.current) {
        group.current.position.y = baseY; 
        group.current.position.x = 0;
        group.current.position.z = 0;
        group.current.rotation.z = 0;
    }

    // Lid Spring Physics
    if (opening && lidRef.current) {
        const target = -Math.PI * 0.68; // Slightly further for impact
        const stiffness = 130; // Snappier
        const damping = 14;

        const force = stiffness * (target - lidProgress.current);
        lidVelocity.current += (force - damping * lidVelocity.current) * delta;
        lidProgress.current += lidVelocity.current * delta;

        lidRef.current.rotation.x = lidProgress.current;
        
        // Squash & Stretch effect during pop
        if (group.current) {
            const stretch = Math.max(0, -lidVelocity.current * 0.05);
            group.current.scale.y = 0.7 + stretch;
            group.current.scale.x = 0.7 - stretch * 0.5;
            group.current.scale.z = 0.7 - stretch * 0.5;
        }

        if (latchRef.current) {
            latchRef.current.rotation.x = lidProgress.current * 0.5;
        }

        if (Math.abs(lidVelocity.current) < 0.01 && Math.abs(target - lidProgress.current) < 0.01) {
            setOpened(true);
            setOpening(false);
            if (group.current) {
                group.current.scale.set(0.5, 0.5, 0.5);
            }
        }
    }
  });

  const handleOpenPress = () => {
    handlePress();
  };

  // Materials - Enhanced
  const woodMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
      color: '#795548', // Richer Brown
      roughness: 0.4,
      metalness: 0.0 
  }), []);
  const woodDarkMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
      color: '#3E2723', 
      roughness: 0.5 
  }), []);
  const goldMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
      color: '#FFD700', 
      roughness: 0.15, // Smoother
      metalness: 1.0,  // More metallic
      emissive: '#FFB300',
      emissiveIntensity: 0.1
  }), []);
  const steelMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
      color: '#607D8B', 
      roughness: 0.3, 
      metalness: 0.8 
  }), []);
  const gemMaterial = useMemo(() => new THREE.MeshStandardMaterial({
      color: rarityColor,
      emissive: rarityColor,
      emissiveIntensity: 1,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.9
  }), [rarityColor]);

  return (
    <group ref={group} scale={[0.5, 0.5, 0.5]} onClick={handlePress}> 
      {/* --- BASE --- */}
      <group position={[0, -0.4, 0]}>
        {/* Main Body - Planks */}
        <mesh position={[0, 0, 0]} material={woodMaterial}>
          <boxGeometry args={[1.7, 0.75, 1.1]} />
        </mesh>
        
        {/* Vertical Corner Reinforcements (Gold) */}
        <mesh position={[-0.86, 0, 0.56]} material={goldMaterial}><boxGeometry args={[0.15, 0.8, 0.15]} /></mesh>
        <mesh position={[0.86, 0, 0.56]} material={goldMaterial}><boxGeometry args={[0.15, 0.8, 0.15]} /></mesh>
        <mesh position={[-0.86, 0, -0.56]} material={goldMaterial}><boxGeometry args={[0.15, 0.8, 0.15]} /></mesh>
        <mesh position={[0.86, 0, -0.56]} material={goldMaterial}><boxGeometry args={[0.15, 0.8, 0.15]} /></mesh>

        {/* Horizontal Dark Bands - slightly wider and protruding */}
        <mesh position={[0, -0.2, 0]} material={woodDarkMaterial}><boxGeometry args={[1.75, 0.12, 1.15]} /></mesh>
        <mesh position={[0, 0.2, 0]} material={woodDarkMaterial}><boxGeometry args={[1.75, 0.12, 1.15]} /></mesh>
        
        {/* Base Trim (Steel) */}
        <mesh position={[0, -0.4, 0]} material={steelMaterial}><boxGeometry args={[1.8, 0.08, 1.2]} /></mesh>

        {/* --- HANDLES --- */}
        <group position={[0.9, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
             {/* Ring */}
             <mesh material={steelMaterial}>
                 <torusGeometry args={[0.15, 0.04, 16, 32]} />
             </mesh>
             {/* Mount */}
             <mesh position={[0, 0.15, 0]} material={goldMaterial}>
                 <boxGeometry args={[0.1, 0.1, 0.2]} />
             </mesh>
        </group>
        <group position={[-0.9, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
             <mesh material={steelMaterial}>
                 <torusGeometry args={[0.15, 0.04, 16, 32]} />
             </mesh>
             <mesh position={[0, -0.15, 0]} material={goldMaterial}>
                 <boxGeometry args={[0.1, 0.1, 0.2]} />
             </mesh>
        </group>

        {/* --- INTERNAL LIGHT EFFECTS (Inside Base) --- */}
        <group position={[0, 0.1, 0]}>
             {/* GodRays and InternalGlow removed per user request */}
        </group>
      </group>

      {/* --- LID --- */}
      {/* Pivot at back top edge: y=0, z=-0.55 */}
      <group ref={lidRef} position={[0, 0, -0.55]}> 
        <group position={[0, 0, 0.55]}>
             {/* Base Rim of Lid */}
            <mesh position={[0, 0.05, 0]} material={woodMaterial}>
                 <boxGeometry args={[1.7, 0.1, 1.1]} />
            </mesh>
            
            {/* Curved Top (Half Cylinder) */}
            <mesh position={[0, 0.05, 0]} rotation={[0, 0, Math.PI/2]} material={woodMaterial}>
                 <cylinderGeometry args={[0.55, 0.55, 1.7, 32, 1, false, 0, Math.PI]} /> 
            </mesh>
            
            {/* Gold Bands on Lid */}
            <mesh position={[-0.7, 0.06, 0]} rotation={[0, 0, Math.PI/2]} material={goldMaterial}>
                 <cylinderGeometry args={[0.6, 0.6, 0.15, 32, 1, false, 0, Math.PI]} />
            </mesh>
             <mesh position={[0.7, 0.06, 0]} rotation={[0, 0, Math.PI/2]} material={goldMaterial}>
                 <cylinderGeometry args={[0.6, 0.6, 0.15, 32, 1, false, 0, Math.PI]} />
            </mesh>
             <mesh position={[0, 0.06, 0]} rotation={[0, 0, Math.PI/2]} material={woodDarkMaterial}>
                 <cylinderGeometry args={[0.58, 0.58, 0.12, 32, 1, false, 0, Math.PI]} />
            </mesh>
        </group>
      </group>
      
      {/* --- LOCK MECHANISM (With Gem) --- */}
      <group position={[0, -0.05, 0.56]}>
           {/* Main Plate */}
           <mesh position={[0, 0, 0]} material={steelMaterial}>
              <boxGeometry args={[0.3, 0.4, 0.05]} />
           </mesh>
           
           {/* Animated Latch Hinge */}
           <group ref={latchRef} position={[0, 0.15, 0.05]}>
                {/* Latch Arm */}
               <mesh position={[0, -0.15, 0]} material={goldMaterial}>
                  <boxGeometry args={[0.1, 0.3, 0.02]} />
               </mesh>
               {/* Padlock Body (Visual only) */}
               <mesh position={[0, -0.3, 0.02]} rotation={[0,0,Math.PI/2]} material={goldMaterial}>
                   <cylinderGeometry args={[0.08, 0.08, 0.15, 16]} />
               </mesh>
               {/* Gemstone */}
               <mesh ref={gemRef} position={[0, -0.15, 0.02]} rotation={[0,0,Math.PI/4]} material={gemMaterial}>
                    <boxGeometry args={[0.08, 0.08, 0.02]} />
               </mesh>
           </group>
      </group>
      
      {/* Dynamic Particle Burst (Attached to Chest Floor) */}
      <ParticleBurst active={showEffects} color={particleColor} />
      
      {/* 3D Reward Card Reveal */}
      <RewardCard3D 
        active={showEffects} 
        image={rewardImage} 
        rarityColor={rarityColor} 
        isSuccess={isSuccess} 
        onComplete={onCardComplete}
      />
    </group>
  );
};

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
