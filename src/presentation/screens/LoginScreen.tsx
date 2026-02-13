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
  Keyboard,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../navigation/types';
import { useUserStore } from '../../shared/stores/userStore';
import { usePortfolioStore } from '../../shared/stores/portfolioStore';
import { useTranslation } from '../../shared/utils/translations';
import { Mail, Lock, LogIn, Globe } from 'lucide-react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { InfoModal, ModalType } from '../components/InfoModal';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const { width, height } = Dimensions.get('window');

const loginSchema = z.object({
  email: z.string().email('invalid_email_format').min(1, 'email_required'),
  password: z.string().min(1, 'password_required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export const LoginScreen = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { login, loginAsGuest, setLanguage } = useUserStore();
  const { seedPortfolio } = usePortfolioStore();
  const { t, language } = useTranslation();
  
  const [loading, setLoading] = useState(false);
  
  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  // Custom Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    type: ModalType;
    title: string;
    message: string;
  }>({
    type: 'info',
    title: '',
    message: '',
  });

  const showInfo = (type: ModalType, title: string, message: string) => {
    setModalConfig({ type, title, message });
    setModalVisible(true);
  };

  const handleLogin = async (data: LoginForm) => {
    Keyboard.dismiss();
    setLoading(true);
    try {
      const success = await login(data.email, data.password);
      if (!success) {
        showInfo('error', t('error'), t('invalid_credentials'));
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
      
      {/* Static Background Layer */}
      <View style={{ position: 'absolute', top: 0, left: 0, width: width, height: height + 50 }}>
        <LinearGradient
          colors={['#ee1515', '#b91c1c']} 
          style={{ flex: 1 }}
        >
          <View style={styles.pokeDecorationTop} />
          <View style={styles.pokeDecorationBottom} />
        </LinearGradient>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity style={styles.langToggle} onPress={toggleLanguage}>
            <Globe size={18} color="#ffffff" />
            <Text style={styles.langText}>{language.toUpperCase()}</Text>
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <View style={styles.logoBadge}>
              <View style={styles.logoInner} />
            </View>
            <Text style={styles.title}>Poké-Market</Text>
            <Text style={styles.subtitle}>{t('login_subtitle')}</Text>
          </View>

          <View style={styles.formContainer}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.inputGroup, errors.email && styles.inputErrorBorder]}>
                  <View style={styles.inputWrapper}>
                    <Mail size={20} color={errors.email ? '#ef4444' : '#64748b'} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder={t('email')}
                      placeholderTextColor="#94a3b8"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      returnKeyType="next"
                    />
                  </View>
                  {errors.email && <Text style={styles.errorText}>{t(errors.email.message as any)}</Text>}
                </View>
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.inputGroup, errors.password && styles.inputErrorBorder]}>
                  <View style={styles.inputWrapper}>
                    <Lock size={20} color={errors.password ? '#ef4444' : '#64748b'} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder={t('password')}
                      placeholderTextColor="#94a3b8"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry
                      autoCapitalize="none"
                      textContentType="password"
                      onSubmitEditing={handleSubmit(handleLogin)}
                    />
                  </View>
                  {errors.password && <Text style={styles.errorText}>{t(errors.password.message as any)}</Text>}
                </View>
              )}
            />

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleSubmit(handleLogin)}
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
                    <Text style={styles.loginButtonText}>{t('login')}</Text>
                    <LogIn size={20} color="#ffffff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('or')}</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.demoButton}
              onPress={() => { 
                Keyboard.dismiss(); 
                loginAsGuest();
                seedPortfolio(); // Ensure demo cards are available
              }}
            >
              <Text style={styles.demoButtonText}>{t('login_demo')}</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>{t('no_account')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>{t('register_now')}</Text>
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
        onClose={() => setModalVisible(false)}
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
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#ee1515',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
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
    bottom: -120,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  langToggle: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 24,
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
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 6,
    borderColor: '#222222',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  logoInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 4,
    borderColor: '#222222',
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
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
  inputGroup: {
    marginBottom: 16,
  },
  inputErrorBorder: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 15,
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
  loginButton: {
    height: 56,
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 8,
    elevation: 4,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    color: '#94a3b8',
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: '700',
  },
  demoButton: {
    alignItems: 'center',
    padding: 14,
    borderRadius: 15,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  demoButtonText: {
    color: '#64748b',
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  registerLink: {
    color: '#ee1515',
    fontSize: 14,
    fontWeight: '800',
  },
});
