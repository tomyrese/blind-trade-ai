import React, { useRef, useState, useEffect, useMemo, Suspense } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, ContactShadows, Float, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardRarity, RARITY_COLORS, RARITY_CONFIGS, RARITY_RANKS } from '../../../../shared/utils/cardData';
import { formatCurrency } from '../../../../shared/utils/currency';
import { useTranslation } from '../../../../shared/utils/translations';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  runOnJS,
  FadeIn,
  ZoomIn
} from 'react-native-reanimated';
import { Text as RNText, Image } from 'react-native'; 
import { Asset } from 'expo-asset';
const { width, height } = Dimensions.get('window');

// --- 3D Chest Component ---
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
    
    // Resolve asset safely
    const texture = useTexture(image ? Asset.fromModule(image).uri : '');
    
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
                map={texture} 
                transparent 
                side={THREE.DoubleSide} 
                emissive={rarityColor}
                opacity={opacity.current}
                emissiveIntensity={texture ? (isSuccess ? 0.6 : 0.2) : 1.0}
                color={texture ? '#ffffff' : rarityColor}
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
  reward: Card | null;
  onClose: () => void;
  currency: string;
  highestSelectedRarity: CardRarity;
}

export const Lootbox3D: React.FC<Lootbox3DProps> = ({ isOpen, reward, onClose, currency, highestSelectedRarity }) => {
  const [showReward, setShowReward] = useState(false);
  const { t } = useTranslation();

  const [flashIntensity, setFlashIntensity] = useState(0);

  useEffect(() => {
    if (!isOpen) {
        setShowReward(false);
        setFlashIntensity(0);
    }
  }, [isOpen]);

  const handleOpenStart = () => {
    setFlashIntensity(5.0);
    // Flash decay
    const timer = setInterval(() => {
        setFlashIntensity(prev => Math.max(0, prev - 0.2));
    }, 50);
    setTimeout(() => clearInterval(timer), 1500);
  };

  const handleOpenComplete = () => {
    // setShowReward is now triggered by onCardComplete at the animation apex for precision
    setTimeout(() => {
        onClose();
    }, 6000); // 6s to allow seeing the final result
  };

  if (!isOpen) return null;

  const rarityColor = reward ? (RARITY_COLORS[reward.rarity] || '#3b82f6') : '#3b82f6';
  const rarityConfig = reward ? RARITY_CONFIGS[reward.rarity] : null;
  const particleColor = rarityConfig?.color || rarityColor; // Use primary color for better saturation

  const isSuccess = useMemo(() => {
    if (!reward) return false;
    const rewardRank = RARITY_RANKS[reward.rarity] || 0;
    const targetRank = RARITY_RANKS[highestSelectedRarity] || 0;
    return rewardRank > targetRank;
  }, [reward, highestSelectedRarity]);

  return (
    <View style={styles.container}>
      {/* 3D Scene Layer */}
      <View style={styles.sceneContainer}>
        <Canvas camera={{ position: [0, 1.2, 4.5], fov: 42 }}>
          <Suspense fallback={null}>
            {/* Enhanced Lighting for Vibrant Colors */}
            <ambientLight intensity={0.8 + flashIntensity} /> 
            <directionalLight position={[5, 8, 5]} intensity={1.5 + flashIntensity * 0.5} castShadow />
            <spotLight position={[-5, 5, 5]} angle={0.5} penumbra={1} intensity={2.0 + flashIntensity} color="#FFD54F" />
            <pointLight position={[0, 0, 2]} intensity={1.0 + flashIntensity * 2} color={rarityColor} distance={5} />
              
            <Chest 
              onOpenComplete={handleOpenComplete} 
              onOpenStart={handleOpenStart}
              onCardComplete={() => setShowReward(true)}
              rarityColor={rarityColor} 
              particleColor={particleColor} 
              rewardImage={reward?.image}
              isSuccess={isSuccess}
            />
            
            <ContactShadows position={[0, -1.8, 0]} opacity={0.6} scale={10} blur={2.0} far={4} color="#000000" />
          </Suspense>
        </Canvas>
      </View>

      {/* 2D Overlay Layer */}
      <View style={styles.overlayContainer} pointerEvents="box-none">
         {!showReward && (
             <Animated.View exiting={FadeIn.duration(500)} entering={FadeIn.duration(500)} style={styles.instructionContainer}>
                 <RNText style={styles.instructionText}>TAP TO OPEN</RNText>
             </Animated.View>
         )}

         {showReward && reward && (
            <Animated.View 
                entering={ZoomIn.duration(600).springify()} 
                style={styles.rewardCardContainer}
            >
                {/* Glow Effect */}
                <View style={[styles.glow, { shadowColor: rarityColor, backgroundColor: rarityColor }]} />
                
                {/* Custom Card Reveal - Image & Border Only */}
                <View style={[
                  styles.rewardImageContainer, 
                  { 
                      borderColor: rarityConfig?.borderColor || rarityColor, 
                      shadowColor: rarityColor,
                  }
                ]}>
                    {reward.image ? (
                        <Image 
                            source={reward.image} 
                            style={styles.rewardImage} 
                            resizeMode="contain" 
                        />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <RNText style={[styles.placeholderLetter, { color: rarityColor }]}>
                                {reward.name.charAt(0)}
                            </RNText>
                        </View>
                    )}
                </View>
                
                <View style={styles.congratsContainer}>
                    <RNText style={styles.congratsText}>
                        {isSuccess ? t('fusion_success') : t('fusion_failed')}
                    </RNText>
                </View>
            </Animated.View>
         )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.9)',
    zIndex: 1000,
  },
  sceneContainer: {
    flex: 1,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  instructionContainer: {
      position: 'absolute',
      bottom: 180,
  },
  instructionText: {
      color: '#fff',
      fontSize: 24,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 2,
  },
  rewardCardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardImageContainer: {
    width: 260,
    aspectRatio: 0.72,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 6,
    padding: 12,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 25,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  rewardImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderLetter: {
    fontSize: 120,
    fontWeight: '900',
    opacity: 0.8,
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 400,
    borderRadius: 50,
    opacity: 0.2, // Reduced opacity for cleaner look
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 60,
    elevation: 30,
  },
  congratsContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  congratsText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  itemName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
});
