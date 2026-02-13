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
import { Mail, Lock, User, UserPlus, ArrowLeft, Globe, Phone } from 'lucide-react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { InfoModal, ModalType } from '../components/InfoModal';

const { width, height } = Dimensions.get('window');

const registerSchema = z.object({
  name: z.string()
    .min(1, 'full_name_required')
    .regex(/^[^0-9]*$/, 'name_no_numbers'),
  email: z.string().email('invalid_email_format').min(1, 'email_required'),
  phone: z.string()
    .min(10, 'phone_min_10')
    .regex(/^[0-9]+$/, 'phone_digits_only'),
  password: z.string()
    .min(8, 'password_min_8')
    .regex(/[A-Z]/, 'password_need_upper')
    .regex(/[a-z]/, 'password_need_lower')
    .regex(/[0-9]/, 'password_need_number')
    .regex(/[^A-Za-z0-9]/, 'password_need_special'),
  confirmPassword: z.string().min(1, 'confirm_password_required'),
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
      <View style={styles.requirementList}>
        {requirements.map((req, index) => (
          <View key={index} style={styles.requirementItem}>
            <View style={[styles.requirementDot, { backgroundColor: req.met ? '#22c55e' : '#94a3b8' }]} />
            <Text style={[styles.requirementText, { color: req.met ? '#166534' : '#64748b' }]}>
              {req.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export const RegisterScreen = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { register, setLanguage } = useUserStore();
  const { t, language } = useTranslation();
  
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  const { control, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password');
  
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

  const handleRegister = async (data: RegisterForm) => {
    Keyboard.dismiss();
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
            {/* Full Name */}
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputGroup}>
                  <View style={[styles.inputWrapper, errors.name && styles.inputErrorBorder]}>
                    <User size={20} color={errors.name ? '#ef4444' : '#64748b'} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder={t('full_name')}
                      placeholderTextColor="#94a3b8"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      returnKeyType="next"
                      textContentType="name"
                    />
                  </View>
                  {errors.name && <Text style={styles.errorText}>{t(errors.name.message as any)}</Text>}
                </View>
              )}
            />

            {/* Email */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputGroup}>
                  <View style={[styles.inputWrapper, errors.email && styles.inputErrorBorder]}>
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

            {/* Phone Number */}
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputGroup}>
                  <View style={[styles.inputWrapper, errors.phone && styles.inputErrorBorder]}>
                    <Phone size={20} color={errors.phone ? '#ef4444' : '#64748b'} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder={t('phone_number')}
                      placeholderTextColor="#94a3b8"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      keyboardType="phone-pad"
                      returnKeyType="next"
                    />
                  </View>
                  {errors.phone && <Text style={styles.errorText}>{t(errors.phone.message as any)}</Text>}
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
                    <Lock size={20} color={errors.password ? '#ef4444' : '#64748b'} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder={t('password')}
                      placeholderTextColor="#94a3b8"
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => {
                        onBlur();
                        setPasswordFocused(false);
                      }}
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry
                      autoCapitalize="none"
                      returnKeyType="next"
                      textContentType="newPassword"
                    />
                  </View>
                  <PasswordRequirements password={value} visible={passwordFocused} />
                  {errors.password && <Text style={styles.errorText}>{t(errors.password.message as any)}</Text>}
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
                    <Lock size={20} color={errors.confirmPassword ? '#ef4444' : '#64748b'} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder={t('confirm_password')}
                      placeholderTextColor="#94a3b8"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry
                      autoCapitalize="none"
                      textContentType="newPassword"
                      onSubmitEditing={handleSubmit(handleRegister)}
                    />
                  </View>
                  {errors.confirmPassword && <Text style={styles.errorText}>{t(errors.confirmPassword.message as any)}</Text>}
                </View>
              )}
            />

            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleSubmit(handleRegister)}
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
  requirementContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginTop: -8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  requirementTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  requirementList: {
    gap: 6,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  requirementText: {
    fontSize: 12,
    fontWeight: '500',
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
