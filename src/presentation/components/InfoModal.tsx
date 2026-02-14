import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react-native';
import { useTranslation } from '../../shared/utils/translations';

const { width } = Dimensions.get('window');

export type ModalType = 'success' | 'error' | 'info';

interface InfoModalProps {
  visible: boolean;
  type: ModalType;
  title: string;
  message: string;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({
  visible,
  type,
  title,
  message,
  onClose,
}) => {
  const { t } = useTranslation();
  const colors = {
    success: ['#22c55e', '#16a34a'],
    error: ['#ef4444', '#dc2626'],
    info: ['#3b82f6', '#2563eb'],
  };

  const icons = {
    success: <CheckCircle2 size={32} color="#ffffff" />,
    error: <AlertCircle size={32} color="#ffffff" />,
    info: <Info size={32} color="#ffffff" />,
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={colors[type]}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.iconWrapper}>{icons[type]}</View>
          </LinearGradient>
          
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            
            <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.8}>
              <LinearGradient
                colors={colors[type]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>{t('confirm')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  header: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 6,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  button: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
