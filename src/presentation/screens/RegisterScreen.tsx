import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  Keyboard,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../navigation/types';
import { useUserStore } from '../../shared/stores/userStore';
import { useTranslation } from '../../shared/utils/translations';
import { Mail, Lock, User, UserPlus, ArrowLeft, Globe } from 'lucide-react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { InfoModal, ModalType } from '../components/InfoModal';

const { width, height } = Dimensions.get('window');

export const RegisterScreen = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { register, setLanguage } = useUserStore();
  const { t, language } = useTranslation();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Custom Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    type: ModalType;
    title: string;
    message: string;
    onClose?: () => void;
  }>({
    type: 'info',
    title: '',
    message: '',
  });

  const showInfo = (type: ModalType, title: string, message: string, onClose?: () => void) => {
    setModalConfig({ type, title, message, onClose });
    setModalVisible(true);
  };

  const handleRegister = async () => {
    Keyboard.dismiss();
    
    if (!name || !email || !password || !confirmPassword) {
      showInfo('error', t('error'), t('please_fill_all_fields'));
      return;
    }

    if (password !== confirmPassword) {
      showInfo('error', t('error'), t('passwords_do_not_match'));
      return;
    }

    if (password.length < 6) {
      showInfo('error', t('error'), t('password_too_short'));
      return;
    }

    setLoading(true);
    try {
      const success = await register(name, email, password);
      if (success) {
        showInfo('success', t('success'), t('registration_success'), () => {
          navigation.navigate('Login');
        });
      } else {
        showInfo('error', t('error'), t('registration_failed'));
      }
    } catch (error) {
      showInfo('error', t('error'), t('something_went_wrong'));
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'vi' : 'en';
    setLanguage(newLang);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#ee1515" translucent />
      
      {/* Static Background */}
      {/* Static Background */}
      <View style={{ position: 'absolute', top: 0, left: 0, width: width, height: height + 50 }}>
        <LinearGradient
          colors={['#ee1515', '#b91c1c']}
          style={styles.gradient}
        >
          <View style={styles.pokeDecorationTop} />
          <View style={styles.pokeDecorationBottom} />
        </LinearGradient>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.topControls}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.langToggle} onPress={toggleLanguage}>
            <Globe size={18} color="#ffffff" />
            <Text style={styles.langText}>{language.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerContainer}>
            <View style={styles.logoBadge}>
               <View style={styles.logoInner} />
            </View>
            <Text style={styles.title}>{t('register')}</Text>
            <Text style={styles.subtitle}>{t('register_subtitle')}</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <User size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('full_name')}
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
                returnKeyType="next"
                textContentType="name"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Mail size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('email')}
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Lock size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('password')}
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                returnKeyType="next"
                textContentType="newPassword"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Lock size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('confirm_password')}
                placeholderTextColor="#94a3b8"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                textContentType="newPassword"
                onSubmitEditing={handleRegister}
              />
            </View>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={loading}
            >
              <LinearGradient
                colors={['#3b82f6', '#1d4ed8']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Text style={styles.registerButtonText}>{t('create_account')}</Text>
                    <UserPlus size={20} color="#ffffff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>{t('already_have_account')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>{t('login')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <InfoModal
        visible={modalVisible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={() => {
          setModalVisible(false);
          if (modalConfig.onClose) modalConfig.onClose();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ee1515',
  },
  gradient: {
    flex: 1,
  },
  pokeDecorationTop: {
    position: 'absolute',
    top: -100,
    right: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  pokeDecorationBottom: {
    position: 'absolute',
    top: height - 180, // Anchored to top
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 44 : 20,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  langToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  langText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 6,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  logoBadge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 5,
    borderColor: '#222222',
  },
  logoInner: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 3,
    borderColor: '#222222',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    fontWeight: '600',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 30,
    padding: 24,
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 15,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#1e293b',
    fontSize: 16,
    fontWeight: '500',
  },
  registerButton: {
    height: 56,
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 8,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 24,
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  loginLink: {
    color: '#ee1515',
    fontSize: 14,
    fontWeight: '800',
  },
});
