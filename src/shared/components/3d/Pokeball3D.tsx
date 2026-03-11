import React, { useRef, useState, useEffect, useMemo, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';

const MasterBallSpots = ({ material }: { material: THREE.Material }) => {
    const spot1Ref = useRef<THREE.Mesh>(null);
    const spot2Ref = useRef<THREE.Mesh>(null);

    useLayoutEffect(() => {
        const scalar = 1.03;

        if (spot1Ref.current) {
            const vec1 = new THREE.Vector3(0.7, 0.6, 0.5).normalize().multiplyScalar(scalar);
            spot1Ref.current.position.copy(vec1);
            spot1Ref.current.lookAt(vec1.clone().multiplyScalar(2));
        }
        if (spot2Ref.current) {
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

export const Pokeball3D = ({ tierColor, isMulti, onFinish, started, onStart }: { tierColor: string, isMulti: boolean, onFinish: () => void, started: boolean, onStart: () => void }) => {
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

                        {/* "M" LOGO */}
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
