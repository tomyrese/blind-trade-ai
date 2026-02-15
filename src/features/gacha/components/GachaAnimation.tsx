import React, { useRef, useState, useEffect, useMemo, useLayoutEffect } from 'react';
import { View, StyleSheet, Text, Dimensions, TouchableWithoutFeedback, Modal, TouchableOpacity, SafeAreaView } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';

const { width } = Dimensions.get('window');

interface GachaAnimationProps {
    tierColor: string;
    isMulti: boolean;
    onFinish: () => void;
}

const MasterBallSpots = ({ material }: { material: THREE.Material }) => {
    const spot1Ref = useRef<THREE.Mesh>(null);
    const spot2Ref = useRef<THREE.Mesh>(null);

    useLayoutEffect(() => {
        // Increased offset to 1.03 to ensure no clipping/z-fighting
        const scalar = 1.03;

        if (spot1Ref.current) {
            // Position 1: Top Rightish
            const vec1 = new THREE.Vector3(0.7, 0.6, 0.5).normalize().multiplyScalar(scalar);
            spot1Ref.current.position.copy(vec1);
            spot1Ref.current.lookAt(vec1.clone().multiplyScalar(2)); // Look perfectly outward
        }
        if (spot2Ref.current) {
            // Position 2: Top Leftish
            const vec2 = new THREE.Vector3(-0.7, 0.6, 0.5).normalize().multiplyScalar(scalar);
            spot2Ref.current.position.copy(vec2);
            spot2Ref.current.lookAt(vec2.clone().multiplyScalar(2));
        }
    }, []);

    return (
        <>
            <mesh ref={spot1Ref}>
                <circleGeometry args={[0.22, 32]} />
                <primitive object={material} attach="material" />
            </mesh>
            <mesh ref={spot2Ref}>
                <circleGeometry args={[0.22, 32]} />
                <primitive object={material} attach="material" />
            </mesh>
        </>
    );
};

const Pokeball3D = ({ tierColor, isMulti, onFinish, started, onStart }: { tierColor: string, isMulti: boolean, onFinish: () => void, started: boolean, onStart: () => void }) => {
    const groupRef = useRef<THREE.Group>(null);
    const topRef = useRef<THREE.Group>(null);
    const lightRef = useRef<THREE.PointLight>(null);
    const [startTime, setStartTime] = useState(0);
    const [opened, setOpened] = useState(false);

    // Materials
    const redMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.2, metalness: 0.1 }), []);
    const purpleMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#a855f7', roughness: 0.2, metalness: 0.1 }), []);
    const pinkMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ec4899', roughness: 0.2, metalness: 0.1, side: THREE.DoubleSide }), []);
    const whiteMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.2, metalness: 0.1 }), []);
    const innerWhiteMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.8, metalness: 0.0, side: THREE.BackSide }), []);
    const blackMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.5, metalness: 0.5 }), []);
    // Transparent Gold for Rim (matches Ultra Ball sides but fainter)
    const goldMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#facc15',
        transparent: true,
        opacity: 0.6,
        roughness: 0.3,
        metalness: 0.5
    }), []);

    const dynamicButtonMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.2, metalness: 0.1, toneMapped: false }), []);

    const topShellMaterial = isMulti ? purpleMaterial : redMaterial;

    useFrame((state) => {
        if (!groupRef.current) return;

        const globalTime = state.clock.getElapsedTime();

        if (!started) {
            groupRef.current.position.y = Math.sin(globalTime * 2) * 0.1;
            groupRef.current.rotation.z = Math.sin(globalTime) * 0.05;
            if (topRef.current) topRef.current.rotation.x = 0;

            if (lightRef.current) {
                lightRef.current.intensity = 0.5;
                lightRef.current.distance = 2;
            }

            const breath = Math.sin(globalTime * 3) * 0.2 + 0.3;
            dynamicButtonMat.color.setHex(0xffffff);
            dynamicButtonMat.emissive.setHex(0xffffff);
            dynamicButtonMat.emissiveIntensity = breath;

            return;
        }

        if (startTime === 0) {
            setStartTime(globalTime);
            return;
        }

        const time = globalTime - startTime;

        let shakeZ = 0;
        let isShaking = false;

        if (time > 0.5 && time < 1.0) {
            shakeZ = Math.sin((time - 0.5) * 20) * 0.25;
            isShaking = true;
        } else if (time > 1.5 && time < 2.0) {
            shakeZ = Math.sin((time - 1.5) * 20) * 0.25;
            isShaking = true;
        } else if (time > 2.5 && time < 3.0) {
            shakeZ = Math.sin((time - 2.5) * 20) * 0.25;
            isShaking = true;
        }

        groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, shakeZ, 0.2);
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, 0.1);

        if (time > 3.2) {
            groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 0.1);
            if (!opened) setOpened(true);
        }

        if (opened && topRef.current) {
            topRef.current.rotation.x = THREE.MathUtils.lerp(topRef.current.rotation.x, -1.7, 0.08);
        }

        if (lightRef.current) {
            if (opened) {
                lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, 100, 0.1);
                lightRef.current.distance = THREE.MathUtils.lerp(lightRef.current.distance, 50, 0.1);
            } else {
                lightRef.current.intensity = Math.sin(time * 10) * 0.5 + 1.0;
            }
        }

        if (opened || isShaking) {
            dynamicButtonMat.color.set(tierColor);
            dynamicButtonMat.emissive.set(tierColor);
            dynamicButtonMat.emissiveIntensity = 3;
        } else {
            dynamicButtonMat.color.setHex(0xffffff);
            dynamicButtonMat.emissive.setHex(0x000000);
            dynamicButtonMat.emissiveIntensity = 0;
        }
    });

    useEffect(() => {
        if (started) {
            const timer = setTimeout(() => {
                onFinish();
            }, 3800);
            return () => clearTimeout(timer);
        }
    }, [started, onFinish]);

    const notchGap = 0.42;
    const torusArc = (Math.PI * 2) - notchGap;
    const torusRotationOffset = Math.PI / 2 + (notchGap / 2);

    return (
        <group
            ref={groupRef}
            scale={[1.4, 1.4, 1.4]}
            onClick={(e) => {
                e.stopPropagation();
                onStart();
            }}
        >
            <pointLight ref={lightRef} position={[0, 0, 0]} color={tierColor} intensity={0} distance={2} decay={1} />

            <group ref={topRef}>
                <mesh position={[0, 0.05, 0]}>
                    <sphereGeometry args={[1.0, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
                    <primitive object={topShellMaterial} attach="material" />
                </mesh>

                {/* RIM THICKNESS for Top Shell */}
                <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.92, 1.0, 64]} />
                    <primitive object={blackMaterial} attach="material" />
                </mesh>

                {/* MASTER BALL DETAILS */}
                {isMulti && (
                    <>
                        <MasterBallSpots material={pinkMaterial} />

                        {/* "M" LOGO - Moved further out to avoid clipping (Rad ~1.08) */}
                        <group position={[0, 0.65, 0.86]} rotation={[-Math.PI / 3.5, 0, 0]} scale={[0.15, 0.15, 0.15]}>
                            <mesh position={[-0.8, 0, 0]}>
                                <boxGeometry args={[0.3, 2.0, 0.05]} />
                                <primitive object={whiteMaterial} attach="material" />
                            </mesh>
                            <mesh position={[0.8, 0, 0]}>
                                <boxGeometry args={[0.3, 2.0, 0.05]} />
                                <primitive object={whiteMaterial} attach="material" />
                            </mesh>
                            <mesh position={[-0.4, 0.1, 0]} rotation={[0, 0, -0.7]}>
                                <boxGeometry args={[0.3, 1.8, 0.05]} />
                                <primitive object={whiteMaterial} attach="material" />
                            </mesh>
                            <mesh position={[0.4, 0.1, 0]} rotation={[0, 0, 0.7]}>
                                <boxGeometry args={[0.3, 1.8, 0.05]} />
                                <primitive object={whiteMaterial} attach="material" />
                            </mesh>
                        </group>
                    </>
                )}

                <mesh position={[0, 0.05, 0]} scale={[0.98, 0.98, 0.98]}>
                    <sphereGeometry args={[1.0, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
                    <primitive object={innerWhiteMaterial} attach="material" />
                </mesh>

                <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, torusRotationOffset]}>
                    <torusGeometry args={[1.0, 0.08, 16, 64, torusArc]} />
                    <primitive object={blackMaterial} attach="material" />
                </mesh>
            </group>

            <mesh rotation={[Math.PI, 0, 0]} position={[0, -0.05, 0]}>
                <sphereGeometry args={[1.0, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <primitive object={whiteMaterial} attach="material" />
            </mesh>

            <mesh rotation={[Math.PI, 0, 0]} position={[0, -0.05, 0]} scale={[0.98, 0.98, 0.98]}>
                <sphereGeometry args={[1.0, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <primitive object={innerWhiteMaterial} attach="material" />
            </mesh>

            <mesh position={[0, -0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[1.0, 0.08, 16, 64]} />
                <primitive object={blackMaterial} attach="material" />
            </mesh>

            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 1.05]} scale={[0.27, 0.27, 0.2]}>
                <cylinderGeometry args={[1, 1, 1, 64]} />
                <primitive object={blackMaterial} attach="material" />
            </mesh>

            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 1.18]} scale={[0.16, 0.16, 0.16]}>
                <cylinderGeometry args={[1, 1, 1, 64]} />
                <primitive object={dynamicButtonMat} attach="material" />
            </mesh>
        </group>
    );
};

export const GachaAnimation: React.FC<GachaAnimationProps> = ({ tierColor, isMulti, onFinish }) => {
    const [started, setStarted] = useState(false);

    return (
        <Modal visible={true} transparent={true} animationType="fade" onRequestClose={onFinish}>
            <View style={styles.animContainer}>
                <View style={styles.overlay} />

                {/* SKIP BUTTON */}
                <SafeAreaView style={styles.skipContainer}>
                    <TouchableOpacity onPress={onFinish} style={styles.skipButton}>
                        <Text style={styles.skipText}>SKIP {'>>'}</Text>
                    </TouchableOpacity>
                </SafeAreaView>

                <TouchableWithoutFeedback onPress={() => !started && setStarted(true)}>
                    <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ width: width, height: width }}>
                            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                                <ambientLight intensity={0.8} />
                                <directionalLight position={[5, 10, 5]} intensity={1.5} />
                                <pointLight position={[-5, -5, 5]} intensity={0.5} />

                                <Pokeball3D
                                    tierColor={tierColor}
                                    isMulti={isMulti}
                                    onFinish={onFinish}
                                    started={started}
                                    onStart={() => setStarted(true)}
                                />
                            </Canvas>
                        </View>

                        <Text style={styles.summoningText}>
                            {started ? "SUMMONING..." : "TAP TO OPEN"}
                        </Text>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    animContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.95)' },
    summoningText: { color: 'white', fontSize: 24, fontWeight: '900', marginTop: 40, letterSpacing: 4 },
    skipContainer: { position: 'absolute', top: 0, right: 0, width: '100%', alignItems: 'flex-end', zIndex: 10000, padding: 20 },
    skipButton: { paddingVertical: 8, paddingHorizontal: 16 },
    skipText: { color: 'rgba(255,255,255,0.8)', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 }
});
