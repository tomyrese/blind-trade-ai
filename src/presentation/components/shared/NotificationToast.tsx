import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring, 
    withTiming, 
    runOnJS 
} from 'react-native-reanimated';
import { 
    CheckCircle2, 
    XCircle, 
    AlertCircle, 
    Info, 
    X,
    Heart,
    ShoppingCart
} from 'lucide-react-native';
import { useUIStore } from '../../../shared/stores/uiStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export const NotificationToast: React.FC = () => {
    const { notification, hideNotification } = useUIStore();
    const insets = useSafeAreaInsets();
    const translateY = useSharedValue(-100);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (notification.visible) {
            translateY.value = withSpring(insets.top + 10, {
                damping: 15,
                stiffness: 120,
            });
            opacity.value = withTiming(1, { duration: 300 });
        } else {
            translateY.value = withSpring(-100, {
                damping: 15,
                stiffness: 120,
            });
            opacity.value = withTiming(0, { duration: 300 });
        }
    }, [notification.visible, insets.top]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    const getColors = () => {
        switch (notification.type) {
            case 'success':
                return { 
                    bg: '#f0fdf4', 
                    border: '#bbf7d0', 
                    icon: '#16a34a', 
                    text: '#166534',
                    Icon: CheckCircle2 
                };
            case 'error':
                return { 
                    bg: '#fef2f2', 
                    border: '#fecaca', 
                    icon: '#dc2626', 
                    text: '#991b1b',
                    Icon: XCircle 
                };
            case 'warning':
                return { 
                    bg: '#fffbeb', 
                    border: '#fef3c7', 
                    icon: '#d97706', 
                    text: '#92400e',
                    Icon: AlertCircle 
                };
            case 'favorite':
                return { 
                    bg: '#fff1f2', 
                    border: '#fecdd3', 
                    icon: '#e11d48', 
                    text: '#881337',
                    Icon: Heart 
                };
            case 'cart':
                return { 
                    bg: '#f0f9ff', 
                    border: '#bae6fd', 
                    icon: '#0284c7', 
                    text: '#075985',
                    Icon: ShoppingCart 
                };
            default:
                return { 
                    bg: '#eff6ff', 
                    border: '#dbeafe', 
                    icon: '#2563eb', 
                    text: '#1e40af',
                    Icon: Info 
                };
        }
    };

    const { bg, border, icon, text, Icon } = getColors();

    return (
        <Animated.View 
            pointerEvents={notification.visible ? 'auto' : 'none'}
            style={[styles.container, animatedStyle, { backgroundColor: bg, borderColor: border }]}
        >
            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: `${icon}15` }]}>
                    <Icon size={20} color={icon} fill={notification.type === 'favorite' ? icon : 'transparent'} />
                </View>
                <Text style={[styles.message, { color: text }]}>{notification.message}</Text>
                <Pressable onPress={hideNotification} style={styles.closeBtn}>
                    <X size={16} color="#94a3b8" />
                </Pressable>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 16,
        right: 16,
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
        zIndex: 10000,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    message: {
        flex: 1,
        fontSize: 14,
        fontWeight: '700',
        lineHeight: 20,
    },
    closeBtn: {
        padding: 4,
        marginLeft: 8,
    },
});
