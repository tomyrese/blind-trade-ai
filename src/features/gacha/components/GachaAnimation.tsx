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

import { Pokeball3D } from '../../../shared/components/3d/Pokeball3D';

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
    skipContainer: { position: 'absolute', top: 10, right: 0, width: '100%', alignItems: 'flex-end', zIndex: 10000, padding: 10 },
    skipButton: { paddingVertical: 8, paddingHorizontal: 16 },
    skipText: { color: 'rgba(255,255,255,0.8)', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 }
});
