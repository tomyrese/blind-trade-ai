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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, User, UserPlus, ArrowLeft, Globe, Phone, Check } from 'lucide-react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { InfoModal, ModalType } from '../components/InfoModal';
import { supabase } from '../../api/supabase';

const { width, height } = Dimensions.get('window');

const registerSchema = z.object({
  name: z.string().min(1, 'full_name_required'),
  email: z.string().email('invalid_email_format').min(1, 'email_required'),
  phone: z.string().min(10, 'phone_min_10').regex(/^[0-9]+$/, 'phone_digits_only'),
  password: z.string().min(8, 'password_min_8'),
  confirmPassword: z.string().min(1, 'confirm_password_required'),
  otp: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'passwords_do_not_match',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

const PasswordRequirements = ({ password, visible }: { password: string; visible: boolean }) => {
  const { t } = useTranslation();
  if (!visible) return null;

  const requirements = [
    { label: t('password_min_8'), met: password.length >= 8 },
    { label: t('password_need_upper'), met: /[A-Z]/.test(password) },
    { label: t('password_need_lower'), met: /[a-z]/.test(password) },
    { label: t('password_need_number'), met: /[0-9]/.test(password) },
    { label: t('password_need_special'), met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <View style={styles.requirementContainer}>
      <Text style={styles.requirementTitle}>{t('password_rules_title')}</Text>
      {requirements.map((req, index) => (
        <View key={index} style={styles.requirementItem}>
          <View style={[styles.requirementDot, { backgroundColor: req.met ? '#22c55e' : '#94a3b8' }]} />
          <Text style={[styles.requirementText, { color: req.met ? '#166534' : '#64748b' }]}>
            {req.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

export const RegisterScreen = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { register, setLanguage } = useUserStore();
  const { t, language } = useTranslation();
  
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  const { control, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '', otp: '' },
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    type: ModalType;
    title: string;
    message: string;
    onClose?: () => void;
  }>({ type: 'info', title: '', message: '' });

  const showInfo = (type: ModalType, title: string, message: string, onClose?: () => void) => {
    setModalConfig({ type, title, message, onClose });
    setModalVisible(true);
  };

  const handleSendOTP = async () => {
    const email = watch('email');
    if (!email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) === false) {
      showInfo('error', t('error'), t('invalid_email_format'));
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      setOtpSent(true);
      showInfo('success', 'OTP Sent', 'Vui lòng kiểm tra email của bạn.');
    } catch (error: any) {
      showInfo('error', t('error'), error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const email = watch('email');
    const otp = watch('otp');
    if (!otp || otp.length !== 6) {
      showInfo('error', t('error'), 'Vui lòng nhập mã OTP 6 số.');
      return;
    }

    setVerifying(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });
      if (error) throw error;
      if (data.session || data.user) {
        setOtpVerified(true);
        showInfo('success', 'Verified', 'Email đã được xác thực thành công!');
      }
    } catch (error: any) {
      showInfo('error', t('error'), error.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleRegister = async (data: RegisterForm) => {
    Keyboard.dismiss();
    if (!otpVerified) {
      showInfo('error', t('error'), 'Vui lòng xác thực email trước.');
      return;
    }

    setLoading(true);
    try {
      const success = await register(data.name, data.email, data.password, data.phone);
      if (success) {
        showInfo('success', t('success'), t('registration_success'), () => {
          navigation.navigate('Login');
        });
      } else {
        showInfo('error', t('error'), t('registration_failed'));
      }
    } catch (error: any) {
      showInfo('error', t('error'), t('something_went_wrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#ee1515" translucent />
      
      <View style={styles.staticBackground}>
        <LinearGradient colors={['#ee1515', '#b91c1c']} style={styles.gradient}>
          <View style={styles.pokeDecorationTop} />
          <View style={styles.pokeDecorationBottom} />
        </LinearGradient>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.topControls}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.langToggle} onPress={() => setLanguage(language === 'en' ? 'vi' : 'en')}>
            <Globe size={18} color="#ffffff" />
            <Text style={styles.langText}>{language.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.headerContainer}>
            <View style={styles.logoBadge}><View style={styles.logoInner} /></View>
            <Text style={styles.title}>{t('register')}</Text>
            <Text style={styles.subtitle}>{t('register_subtitle')}</Text>
          </View>

          <View style={styles.formContainer}>
            {/* Full Name */}
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputGroup}>
                  <View style={[styles.inputWrapper, errors.name && styles.inputErrorBorder]}>
                    <User size={20} color={errors.name ? '#ef4444' : '#64748b'} style={styles.inputIcon} />
                    <TextInput style={styles.input} placeholder={t('full_name')} placeholderTextColor="#94a3b8" onBlur={onBlur} onChangeText={onChange} value={value} />
                  </View>
                </View>
              )}
            />

            {/* Email Row */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputGroup}>
                  <View style={styles.row}>
                    <View style={[styles.inputWrapper, { flex: 1 }, errors.email && styles.inputErrorBorder]}>
                      <Mail size={20} color={errors.email ? '#ef4444' : '#64748b'} style={styles.inputIcon} />
                      <TextInput style={styles.input} placeholder={t('email')} placeholderTextColor="#94a3b8" onBlur={onBlur} onChangeText={onChange} value={value} keyboardType="email-address" autoCapitalize="none" editable={!otpVerified} />
                    </View>
                    <TouchableOpacity style={[styles.sideButton, (loading || otpVerified) && styles.disabledButton]} onPress={handleSendOTP} disabled={loading || otpVerified}>
                      <Text style={styles.sideButtonText}>{otpSent ? 'Resend' : 'Send OTP'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />

            {/* OTP Row */}
            <Controller
              control={control}
              name="otp"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputGroup}>
                  <View style={styles.row}>
                    <View style={[styles.inputWrapper, { flex: 1 }]}>
                      <Lock size={20} color="#64748b" style={styles.inputIcon} />
                      <TextInput 
                        style={styles.input} 
                        placeholder="OTP Code" 
                        placeholderTextColor="#94a3b8" 
                        onBlur={onBlur} 
                        onChangeText={(text) => onChange(text.replace(/[^0-9]/g, '').slice(0, 6))}
                        value={value} 
                        keyboardType="number-pad" 
                        maxLength={6} 
                        editable={otpSent && !otpVerified && !verifying} 
                      />
                    </View>
                    <TouchableOpacity style={[styles.sideButton, (verifying || !otpSent || otpVerified) && styles.disabledButton]} onPress={handleVerifyOTP} disabled={verifying || !otpSent || otpVerified}>
                      {verifying ? <ActivityIndicator size="small" color="#fff" /> : (otpVerified ? <Check size={20} color="#fff" /> : <Text style={styles.sideButtonText}>Verify</Text>)}
                    </TouchableOpacity>
                  </View>
                  {otpVerified && <Text style={styles.successText}>✓ Email Verified</Text>}
                </View>
              )}
            />

            {/* Phone */}
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputGroup}>
                  <View style={[styles.inputWrapper, errors.phone && styles.inputErrorBorder]}>
                    <Phone size={20} color="#64748b" style={styles.inputIcon} />
                    <TextInput style={styles.input} placeholder={t('phone_number')} placeholderTextColor="#94a3b8" onBlur={onBlur} onChangeText={onChange} value={value} keyboardType="phone-pad" />
                  </View>
                </View>
              )}
            />

            {/* Password */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputGroup}>
                  <View style={[styles.inputWrapper, errors.password && styles.inputErrorBorder]}>
                    <Lock size={20} color="#64748b" style={styles.inputIcon} />
                    <TextInput style={styles.input} placeholder={t('password')} placeholderTextColor="#94a3b8" onFocus={() => setPasswordFocused(true)} onBlur={() => setPasswordFocused(false)} onChangeText={onChange} value={value} secureTextEntry />
                  </View>
                  <PasswordRequirements password={value} visible={passwordFocused} />
                </View>
              )}
            />

            {/* Confirm Password */}
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputGroup}>
                  <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputErrorBorder]}>
                    <Lock size={20} color="#64748b" style={styles.inputIcon} />
                    <TextInput style={styles.input} placeholder={t('confirm_password')} placeholderTextColor="#94a3b8" onBlur={onBlur} onChangeText={onChange} value={value} secureTextEntry />
                  </View>
                </View>
              )}
            />

            {/* Register Button */}
            <TouchableOpacity 
              style={[styles.registerButton, !otpVerified && styles.disabledButton]} 
              onPress={handleSubmit(handleRegister)} 
              disabled={loading || !otpVerified}
            >
              <LinearGradient colors={otpVerified ? ['#3b82f6', '#1d4ed8'] : ['#94a3b8', '#64748b']} style={styles.buttonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {loading ? <ActivityIndicator color="#ffffff" /> : (
                  <View style={styles.row}>
                    <Text style={styles.registerButtonText}>{t('create_account')}</Text>
                    <UserPlus size={20} color="#ffffff" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>{t('already_have_account')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}><Text style={styles.loginLink}>{t('login')}</Text></TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <InfoModal visible={modalVisible} type={modalConfig.type} title={modalConfig.title} message={modalConfig.message} onClose={() => setModalVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ee1515' },
  staticBackground: { position: 'absolute', top: 0, left: 0, width, height: height + 50 },
  gradient: { flex: 1 },
  pokeDecorationTop: { position: 'absolute', top: -100, right: -50, width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  pokeDecorationBottom: { position: 'absolute', top: height - 180, left: -80, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(0, 0, 0, 0.05)' },
  topControls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Platform.OS === 'ios' ? 44 : 40, paddingHorizontal: 20, zIndex: 10 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  langToggle: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  langText: { color: '#ffffff', fontSize: 12, fontWeight: '800', marginLeft: 6 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingBottom: 40, paddingHorizontal: 24 },
  headerContainer: { alignItems: 'center', marginBottom: 24, marginTop: 20 },
  logoBadge: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 5, borderColor: '#222222' },
  logoInner: { width: 26, height: 26, borderRadius: 13, borderWidth: 3, borderColor: '#222222' },
  title: { fontSize: 32, fontWeight: '900', color: '#ffffff' },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 4, fontWeight: '600' },
  formContainer: { backgroundColor: '#ffffff', borderRadius: 30, padding: 24, elevation: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, width: '100%', maxWidth: 480, alignSelf: 'center' },
  inputGroup: { marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 15, paddingHorizontal: 16, height: 56, borderWidth: 1.5, borderColor: '#e2e8f0' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: '#1e293b', fontSize: 16, fontWeight: '500' },
  inputErrorBorder: { borderColor: '#ef4444' },
  sideButton: { backgroundColor: '#3b82f6', borderRadius: 12, paddingHorizontal: 16, height: 56, justifyContent: 'center', alignItems: 'center', minWidth: 90 },
  sideButtonText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  registerButton: { height: 56, borderRadius: 15, overflow: 'hidden', marginTop: 8 },
  buttonGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  registerButtonText: { color: '#ffffff', fontSize: 18, fontWeight: '800' },
  disabledButton: { opacity: 0.5 },
  requirementContainer: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, marginTop: -8, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  requirementTitle: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8 },
  requirementItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  requirementDot: { width: 6, height: 6, borderRadius: 3 },
  requirementText: { fontSize: 12, fontWeight: '500' },
  successText: { color: '#22c55e', fontSize: 13, fontWeight: '700', marginTop: 6, marginLeft: 4 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 24 },
  footerText: { color: '#64748b', fontSize: 14, fontWeight: '500' },
  loginLink: { color: '#ee1515', fontSize: 14, fontWeight: '800' },
});
