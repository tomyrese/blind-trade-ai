import React, { useRef, useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions, Text as RNText, Image } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber/native'; // Dùng /native cho mobile
import { ContactShadows } from '@react-three/drei/native';
import * as THREE from 'three';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { Asset } from 'expo-asset';

// Import Data
import {
  Card,
  CardRarity,
  RARITY_RANKS,
} from '../../../shared/utils/cardData';
import { useTranslation } from '../../../shared/utils/translations';

const { width, height } = Dimensions.get('window');

// --- HÀM CHỌN MÀU THEO PHẨM CHẤT (Chỉ 3 màu) ---
const getChestColor = (rarity: string | undefined) => {
  if (!rarity) return '#3B82F6'; // Mặc định Xanh
  const r = rarity.toLowerCase();

  // 1. VÀNG (Hàng Vip) -> Ánh sáng Vàng
  if (['rare_secret', 'rare_rainbow', 'rare_holo_v', 'rare_holo_gx', 'rare_holo_ex', 'promo'].includes(r)) {
    return '#FFD700';
  }

  // 2. TÍM (Hàng Hiếm) -> Ánh sáng Tím
  if (['rare', 'rare_holo'].includes(r)) {
    return '#C084FC';
  }

  // 3. XANH (Hàng Thường) -> Ánh sáng Xanh
  return '#3B82F6';
};

// --- COMPONENT HẠT NỔ (ParticleBurst) ---
const ParticleBurst = ({ active, color }: { active: boolean, color: string }) => {
    const count = 300;
    const mesh = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            temp.push({
                pos: new THREE.Vector3(0, 0, 0),
                vel: new THREE.Vector3(0, 0, 0),
                scale: 0, life: 0, decay: 0,
                rot: new THREE.Vector3(Math.random(), Math.random(), Math.random())
            });
        }
        return temp;
    }, []);

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
                    Math.cos(phi) * speed + 3,
                    Math.sin(phi) * Math.sin(theta) * speed
                );
                p.life = 1.0;
                p.decay = 0.005 + Math.random() * 0.015;
            });
        } else if (!active) {
            hasTriggered.current = false;
        }
    }, [active]);

    useFrame((state, delta) => {
        if (!mesh.current || !active) return;
        particles.forEach((p, i) => {
            if (p.life > 0) {
                p.pos.add(p.vel.clone().multiplyScalar(delta * 2));
                p.vel.y -= 9.8 * delta * 0.6;
                p.vel.multiplyScalar(0.98);
                p.life -= p.decay;
                p.scale = Math.max(0, p.life);

                dummy.position.copy(p.pos);
                dummy.scale.setScalar(p.scale * 0.12);
                dummy.rotation.set(state.clock.elapsedTime * p.rot.x * 5, state.clock.elapsedTime * p.rot.y * 5, state.clock.elapsedTime * p.rot.z * 5);
                dummy.updateMatrix();
                mesh.current!.setMatrixAt(i, dummy.matrix);
            } else {
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
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} transparent opacity={0.9} />
        </instancedMesh>
    );
};

// --- COMPONENT RƯƠNG (Chest) ---
const Chest = ({ onOpenComplete, onOpenStart, rarityColor }: any) => {
  const group = useRef<THREE.Group>(null);
  const lidRef = useRef<THREE.Group>(null);
  const latchRef = useRef<THREE.Group>(null);
  const gemRef = useRef<THREE.Mesh>(null);

  const [opening, setOpening] = useState(false);
  const [rumble, setRumble] = useState(false);
  const [showEffects, setShowEffects] = useState(false);

  const lidProgress = useRef(0);
  const lidVelocity = useRef(0);
  const floatOffset = useRef(0);

  const handlePress = () => {
    if (opening || rumble) return;
    setRumble(true);
    setTimeout(() => {
        setRumble(false);
        setOpening(true);
        setShowEffects(true);
        if (onOpenStart) onOpenStart();
        // Đóng rương sau 2s để chuyển màn hình
        setTimeout(onOpenComplete, 2000);
    }, 850);
  };

  useFrame((state, delta) => {
    // Hiệu ứng viên ngọc
    if (gemRef.current) {
        const pulse = (Math.sin(state.clock.elapsedTime * 6) + 1) / 2;
        (gemRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5 + pulse * 2.5;
    }

    const baseY = 0.4;

    // Hiệu ứng rung lắc
    if (rumble && group.current) {
        const t = state.clock.elapsedTime;
        const rumbleX = (Math.sin(t * 80) + Math.sin(t * 113)) * 0.04;
        const rumbleZ = (Math.cos(t * 73) + Math.cos(t * 127)) * 0.04;
        group.current.position.set(rumbleX, baseY + (Math.sin(t * 100) * 0.02), rumbleZ);
        group.current.rotation.z = (Math.sin(t * 97)) * 0.07;
    } else if (group.current && !opening) {
        floatOffset.current += delta;
        group.current.position.y = baseY + Math.sin(floatOffset.current * 1.5) * 0.08;
    }

    // Hiệu ứng mở nắp (Lid Physics)
    if (opening && lidRef.current) {
        const target = -Math.PI * 0.68;
        const stiffness = 130;
        const damping = 14;
        const force = stiffness * (target - lidProgress.current);
        lidVelocity.current += (force - damping * lidVelocity.current) * delta;
        lidProgress.current += lidVelocity.current * delta;
        lidRef.current.rotation.x = lidProgress.current;

        if (latchRef.current) latchRef.current.rotation.x = lidProgress.current * 0.5;
    }
  });

  // Vật liệu
  const woodMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#795548', roughness: 0.4 }), []);
  const goldMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#FFD700', roughness: 0.15, metalness: 1.0, emissive: '#FFB300', emissiveIntensity: 0.1 }), []);
  const steelMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#607D8B', roughness: 0.3, metalness: 0.8 }), []);
  const woodDarkMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#3E2723', roughness: 0.5 }), []);

  // Viên ngọc sẽ theo màu rarity
  const gemMat = useMemo(() => new THREE.MeshStandardMaterial({
      color: rarityColor,
      emissive: rarityColor,
      emissiveIntensity: 1,
      transparent: true,
      opacity: 0.9
  }), [rarityColor]);

  return (
    <group ref={group} scale={[0.5, 0.5, 0.5]} onClick={handlePress}>
      {/* BASE */}
      <group position={[0, -0.4, 0]}>
        <mesh material={woodMat}><boxGeometry args={[1.7, 0.75, 1.1]} /></mesh>
        <mesh position={[0, -0.2, 0]} material={woodDarkMat}><boxGeometry args={[1.75, 0.12, 1.15]} /></mesh>
        <mesh position={[0, 0.2, 0]} material={woodDarkMat}><boxGeometry args={[1.75, 0.12, 1.15]} /></mesh>
        <mesh position={[0, -0.4, 0]} material={steelMat}><boxGeometry args={[1.8, 0.08, 1.2]} /></mesh>
        {/* Góc vàng */}
        <mesh position={[-0.86, 0, 0.56]} material={goldMat}><boxGeometry args={[0.15, 0.8, 0.15]} /></mesh>
        <mesh position={[0.86, 0, 0.56]} material={goldMat}><boxGeometry args={[0.15, 0.8, 0.15]} /></mesh>
        <mesh position={[-0.86, 0, -0.56]} material={goldMat}><boxGeometry args={[0.15, 0.8, 0.15]} /></mesh>
        <mesh position={[0.86, 0, -0.56]} material={goldMat}><boxGeometry args={[0.15, 0.8, 0.15]} /></mesh>
      </group>

      {/* LID */}
      <group ref={lidRef} position={[0, 0, -0.55]}>
        <group position={[0, 0, 0.55]}>
            <mesh position={[0, 0.05, 0]} material={woodMat}><boxGeometry args={[1.7, 0.1, 1.1]} /></mesh>
            <mesh position={[0, 0.05, 0]} rotation={[0, 0, Math.PI/2]} material={woodMat}><cylinderGeometry args={[0.55, 0.55, 1.7, 32, 1, false, 0, Math.PI]} /></mesh>
            <mesh position={[0, 0.06, 0]} rotation={[0, 0, Math.PI/2]} material={woodDarkMat}><cylinderGeometry args={[0.58, 0.58, 0.12, 32, 1, false, 0, Math.PI]} /></mesh>
            <mesh position={[-0.7, 0.06, 0]} rotation={[0, 0, Math.PI/2]} material={goldMat}><cylinderGeometry args={[0.6, 0.6, 0.15, 32, 1, false, 0, Math.PI]} /></mesh>
            <mesh position={[0.7, 0.06, 0]} rotation={[0, 0, Math.PI/2]} material={goldMat}><cylinderGeometry args={[0.6, 0.6, 0.15, 32, 1, false, 0, Math.PI]} /></mesh>
        </group>
      </group>

      {/* LOCK & GEM */}
      <group position={[0, -0.05, 0.56]}>
           <mesh material={steelMat}><boxGeometry args={[0.3, 0.4, 0.05]} /></mesh>
           <group ref={latchRef} position={[0, 0.15, 0.05]}>
               <mesh position={[0, -0.15, 0]} material={goldMat}><boxGeometry args={[0.1, 0.3, 0.02]} /></mesh>
               <mesh ref={gemRef} position={[0, -0.15, 0.02]} rotation={[0,0,Math.PI/4]} material={gemMat}><boxGeometry args={[0.08, 0.08, 0.02]} /></mesh>
           </group>
      </group>

      {/* Hiệu ứng nổ cũng theo màu rarity */}
      <ParticleBurst active={showEffects} color={rarityColor} />
    </group>
  );
};

// --- MAIN EXPORT ---
interface GachaLootboxProps {
  isOpen: boolean;
  reward: Card | null;
  onClose: () => void;
  currency?: string;
  highestSelectedRarity?: CardRarity;
}

export const GachaLootbox: React.FC<GachaLootboxProps> = ({ isOpen, reward, onClose }) => {
  const [flashIntensity, setFlashIntensity] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    if (!isOpen) setFlashIntensity(0);
  }, [isOpen]);

  const handleOpenStart = () => {
    setFlashIntensity(5.0);
    const timer = setInterval(() => {
        setFlashIntensity(prev => Math.max(0, prev - 0.2));
    }, 50);
    setTimeout(() => clearInterval(timer), 1500);
  };

  if (!isOpen) return null;

  // ✅ ĐÂY LÀ ĐOẠN QUAN TRỌNG: CHỌN MÀU THEO HỆ 3 MÀU
  // GachaWidget đã truyền thẻ xịn nhất vào biến `reward` rồi.
  const rarityColor = getChestColor(reward?.rarity);

  return (
    <View style={styles.container}>
      <View style={styles.sceneContainer}>
        <Canvas camera={{ position: [0, 1.2, 4.5], fov: 42 }}>
          <ambientLight intensity={0.8 + flashIntensity} />
          <directionalLight position={[5, 8, 5]} intensity={1.5 + flashIntensity * 0.5} castShadow />
          <spotLight position={[-5, 5, 5]} angle={0.5} penumbra={1} intensity={2.0 + flashIntensity} color="#FFD54F" />

          {/* Đèn chiếu sáng theo màu Rarity */}
          <pointLight position={[0, 0, 2]} intensity={2.0 + flashIntensity * 2} color={rarityColor} distance={6} />

          <Chest
            onOpenComplete={onClose}
            onOpenStart={handleOpenStart}
            rarityColor={rarityColor} // Truyền màu đã chuẩn hóa (Vàng/Tím/Xanh)
          />
          <ContactShadows position={[0, -1.8, 0]} opacity={0.6} scale={10} blur={2.0} far={4} color="#000000" />
        </Canvas>
      </View>

      <View style={styles.overlayContainer} pointerEvents="box-none">
         <Animated.View entering={FadeIn.duration(500)} style={styles.instructionContainer}>
             <RNText style={styles.instructionText}>{t('gacha_tap_chest')}</RNText>
         </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 1000 },
  sceneContainer: { flex: 1 },
  overlayContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 1001 },
  instructionContainer: { position: 'absolute', bottom: 150 },
  instructionText: { color: '#fff', fontSize: 24, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2 },
});