import React, { createContext, useContext, ReactNode } from 'react';
import { useUIStore, NotificationType } from '../stores/uiStore';
import { NotificationToast } from '../../presentation/components/shared/NotificationToast';

interface ToastContextType {
  showToast: (message: string, type: NotificationType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const showNotification = useUIStore((state) => state.showNotification);

  const showToast = (msg: string, toastType: NotificationType = 'success') => {
    showNotification(msg, toastType);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <NotificationToast />
    </ToastContext.Provider>
  );
};
