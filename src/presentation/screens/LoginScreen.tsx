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
import { Mail, Lock, LogIn, Globe, KeyRound } from 'lucide-react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { useUIStore } from '../../shared/stores/uiStore';

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
  const { login, loginAsGuest, setLanguage, resetPassword, registeredUsers } = useUserStore();
  const { seedPortfolio } = usePortfolioStore();
  const { t, language } = useTranslation();
  const showNotification = useUIStore((state) => state.showNotification);
  
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [isForgotModalVisible, setIsForgotModalVisible] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<'email' | 'otp' | 'password'>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [recoveryOtp, setRecoveryOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const { control, handleSubmit, watch, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const handleLogin = async (data: LoginForm) => {
    Keyboard.dismiss();
    setLoading(true);
    try {
      const success = await login(data.email, data.password);
      if (!success) {
        showNotification(t('invalid_credentials'), 'error');
      }
    } catch (error) {
      showNotification(t('something_went_wrong'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setRecoveryStep('email');
    setForgotEmail('');
    setRecoveryOtp('');
    setNewPassword('');
    setIsForgotModalVisible(true);
  };

  const onConfirmEmail = async () => {
    if (!forgotEmail || !z.string().email().safeParse(forgotEmail).success) {
      showNotification(t('invalid_email_format'), 'warning');
      return;
    }

    const userExists = registeredUsers.some(u => u.email.toLowerCase() === forgotEmail.toLowerCase());
    if (!userExists) {
      showNotification(t('email_not_found'), 'error');
      return;
    }

    setResetLoading(true);
    try {
      const result = await useUserStore.getState().resetPassword(forgotEmail);
      if (result.success) {
        showNotification(t('reset_password_sent'), 'success');
        setRecoveryStep('otp');
      } else {
        showNotification(result.message || t('something_went_wrong'), 'error');
      }
    } catch (error) {
      showNotification(t('something_went_wrong'), 'error');
    } finally {
      setResetLoading(false);
    }
  };

  const onConfirmOTP = async () => {
    if (recoveryOtp.length < 6) {
      showNotification(t('enter_otp_6'), 'warning');
      return;
    }

    setResetLoading(true);
    try {
      const result = await useUserStore.getState().verifyRecoveryOTP(forgotEmail, recoveryOtp);
      if (result.success) {
        showNotification(t('otp_verified'), 'success');
        setRecoveryStep('password');
      } else {
        showNotification(result.message || t('invalid_otp'), 'error');
      }
    } catch (error) {
      showNotification(t('something_went_wrong'), 'error');
    } finally {
      setResetLoading(false);
    }
  };

  const onConfirmNewPassword = async () => {
    if (newPassword.length < 6) {
      showNotification(t('password_too_short' as any) || 'Mật khẩu quá ngắn', 'warning');
      return;
    }

    setResetLoading(true);
    try {
      const result = await useUserStore.getState().updateUserPassword(newPassword);
      if (result.success) {
        showNotification(t('password_reset_success'), 'success');
        setIsForgotModalVisible(false);
      } else {
        showNotification(result.message || t('something_went_wrong'), 'error');
      }
    } catch (error) {
      showNotification(t('something_went_wrong'), 'error');
    } finally {
      setResetLoading(false);
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
              style={styles.forgotPasswordBtn} 
              onPress={handleForgotPassword}
            >
                <KeyRound size={16} color="#ee1515" style={{ marginRight: 6 }} />
                <Text style={styles.forgot_password_text}>{t('forgot_password')}</Text>
            </TouchableOpacity>

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

      {/* Forgot Password Modal (Wizard) */}
      <ForgotPasswordModal 
        visible={isForgotModalVisible}
        onClose={() => setIsForgotModalVisible(false)}
        step={recoveryStep}
        email={forgotEmail}
        setEmail={setForgotEmail}
        otp={recoveryOtp}
        setOtp={setRecoveryOtp}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        onConfirmEmail={onConfirmEmail}
        onConfirmOTP={onConfirmOTP}
        onConfirmNewPassword={onConfirmNewPassword}
        loading={resetLoading}
      />
    </View>
  );
};

// Internal component for the modal
const ForgotPasswordModal = ({ 
  visible, onClose, step, email, setEmail, otp, setOtp, 
  newPassword, setNewPassword, onConfirmEmail, onConfirmOTP, 
  onConfirmNewPassword, loading 
}: any) => {
  const { t } = useTranslation();
  
  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <TouchableOpacity 
        style={styles.modalOverlayBlur} 
        activeOpacity={1} 
        onPress={onClose} 
      />
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <View style={styles.iconCircle}>
            {step === 'email' ? <Mail size={24} color="#ee1515" /> : 
             step === 'otp' ? <KeyRound size={24} color="#ee1515" /> : 
             <Lock size={24} color="#ee1515" />}
          </View>
          <Text style={styles.modalTitle}>
            {step === 'email' ? t('forgot_password') : 
             step === 'otp' ? t('verifying_otp') : 
             t('new_password_placeholder')}
          </Text>
          <Text style={styles.modalSubtitle}>
            {step === 'email' ? t('forgot_password_desc') : 
             step === 'otp' ? t('enter_recovery_otp') : 
             t('new_password_placeholder')}
          </Text>
        </View>

        <View style={styles.modalInputGroup}>
          <View style={styles.modalInputWrapper}>
            {step === 'email' ? (
              <>
                <Mail size={20} color="#64748b" style={styles.modalInputIcon} />
                <TextInput
                  style={styles.modalInput}
                  placeholder={t('email')}
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </>
            ) : step === 'otp' ? (
              <>
                <KeyRound size={20} color="#64748b" style={styles.modalInputIcon} />
                <TextInput
                  style={styles.modalInput}
                  placeholder="000000"
                  placeholderTextColor="#94a3b8"
                  value={otp}
                  onChangeText={setOtp}
                  maxLength={6}
                  keyboardType="numeric"
                />
              </>
            ) : (
              <>
                <Lock size={20} color="#64748b" style={styles.modalInputIcon} />
                <TextInput
                  style={styles.modalInput}
                  placeholder={t('password_placeholder') as any}
                  placeholderTextColor="#94a3b8"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </>
            )}
          </View>
        </View>

        <View style={styles.modalActions}>
          <TouchableOpacity 
            style={styles.cancelLink} 
            onPress={onClose}
          >
            <Text style={styles.cancelText}>{t('cancel')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.confirmButton} 
            onPress={step === 'email' ? onConfirmEmail : step === 'otp' ? onConfirmOTP : onConfirmNewPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.confirmButtonText}>
                {t('confirm')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
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
  forgotPasswordBtn: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 20,
    marginTop: -4,
    padding: 4,
  },
  forgot_password_text: {
    color: '#ee1515',
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalOverlayBlur: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#ffffff',
    borderRadius: 25,
    padding: 24,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff1f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalInputGroup: {
    marginBottom: 24,
  },
  modalInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 15,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  modalInputIcon: {
    marginRight: 12,
  },
  modalInput: {
    flex: 1,
    color: '#1e293b',
    fontSize: 16,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelLink: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cancelText: {
    color: '#64748b',
    fontSize: 15,
    fontWeight: '700',
  },
  confirmButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#ee1515',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
