import { create } from 'zustand';

export type NotificationType = 'success' | 'error' | 'info' | 'warning' | 'favorite' | 'cart';

interface NotificationState {
    visible: boolean;
    message: string;
    type: NotificationType;
    duration?: number;
}

interface UIStore {
    notification: NotificationState;
    showNotification: (message: string, type?: NotificationType, duration?: number) => void;
    hideNotification: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
    notification: {
        visible: false,
        message: '',
        type: 'info',
        duration: 3000,
    },
    showNotification: (message, type = 'info', duration = 3000) => {
        set({
            notification: {
                visible: true,
                message,
                type,
                duration,
            },
        });

        // Auto-hide
        if (duration > 0) {
            setTimeout(() => {
                set((state) => ({
                    notification: { ...state.notification, visible: false }
                }));
            }, duration);
        }
    },
    hideNotification: () => {
        set((state) => ({
            notification: { ...state.notification, visible: false }
        }));
    },
}));
