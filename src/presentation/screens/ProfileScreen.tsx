import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Modal, TextInput, Dimensions, TouchableOpacity, Switch, Image, NativeModules, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, Bell, Shield, HelpCircle, LogOut, ChevronRight, Award, Star, BookOpen, Edit2, Medal, Crown, Check, X, AlertTriangle, CheckCircle, Info, Lock, Image as ImageIcon, Camera, Wallet, CreditCard, Banknote, ShoppingCart, Clock, Trash2, Plus } from 'lucide-react-native';
import { useUserStore } from '../../shared/stores/userStore';
import { useUIStore } from '../../shared/stores/uiStore';
import { VipType, Title, AVAILABLE_TITLES } from '../../domain/models/User';
import { useTranslation } from '../../shared/utils/translations';
import { formatCurrency, formatCompactVND } from '../../shared/utils/currency';
import { PRESET_AVATARS } from '../../assets/images/avata';
import { launchImageLibrary } from 'react-native-image-picker';

// --- Sub-Components ---

const AvatarSelectionModal = ({ visible, onClose, onSelect }: { visible: boolean, onClose: () => void, onSelect: (id: string) => void }) => {
    const { t } = useTranslation();
    const showNotification = useUIStore((state) => state.showNotification);
    
    const handlePickFromGallery = async () => {
        // react-native-image-picker uses 'ImagePicker' as module name
        const legacyModule = NativeModules.ImagePicker;
        const isTurboEnabled = (globalThis as any).__turboModuleProxy != null;
        
        // The library itself will crash if its internal resolution returns null
        // We do a pre-check here to avoid the crash and show diagnostics
        if (typeof launchImageLibrary !== 'function' || (!legacyModule && !isTurboEnabled)) {
            showNotification(`Native Module 'ImagePicker' not found.`, 'error');
            return;
        }

        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 1,
        });

        if (result.didCancel) return;
        if (result.errorCode) {
            showNotification(t('gallery_permission_denied'), 'error');
            return;
        }

        if (result.assets && result.assets[0].uri) {
            onSelect(result.assets[0].uri);
            onClose();
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose} statusBarTranslucent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <ImageIcon size={24} color="#ef4444" style={{marginRight: 8}} />
                            <Text style={styles.modalTitle}>{t('change_avatar')}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}><X size={24} color="#64748b" /></TouchableOpacity>
                    </View>

                    <Text style={styles.sectionTitle}>{t('pick_from_gallery')}</Text>
                    <TouchableOpacity style={styles.galleryPicker} onPress={handlePickFromGallery}>
                        <View style={styles.galleryIconRow}>
                            <Camera size={24} color="#3b82f6" />
                            <Text style={styles.galleryPickerText}>{t('pick_from_gallery')}</Text>
                        </View>
                        <ChevronRight size={20} color="#cbd5e1" />
                    </TouchableOpacity>

                    <Text style={styles.sectionTitle}>{t('pick_preset')}</Text>
                    <View style={styles.presetGrid}>
                        {Object.entries(PRESET_AVATARS).map(([id, source]) => (
                            <TouchableOpacity key={id} style={styles.presetItem} onPress={() => { onSelect(id); onClose(); }}>
                                <Image source={source} style={styles.presetImage} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const TitlesModal = ({ visible, onClose, unlockedTitles = [], equippedTitle, onEquip }: { visible: boolean, onClose: () => void, unlockedTitles?: string[], equippedTitle: Title | null, onEquip: (id: string) => void }) => {
    const { t } = useTranslation();
    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose} statusBarTranslucent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Award size={24} color="#f59e0b" style={{marginRight: 8}} />
                            <Text style={styles.modalTitle}>{t('titles')}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}><X size={24} color="#64748b" /></TouchableOpacity>
                    </View>
                    <Text style={styles.modalSubtitle}>{t('titles_subtitle')}</Text>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 20}}>
                        {AVAILABLE_TITLES.map((title) => {
                            const isUnlocked = unlockedTitles?.includes(title.id);
                            const isEquipped = equippedTitle?.id === title.id;

                            return (
                                <View key={title.id} style={[styles.titleItem, isEquipped && styles.titleItemEquipped, !isUnlocked && styles.titleItemLocked]}>
                                    <View style={[styles.titleIcon, { backgroundColor: isUnlocked ? title.color : '#cbd5e1' }]}>
                                        {isUnlocked ? <Star size={16} color="#fff" fill="#fff" /> : <Lock size={16} color="#fff" />}
                                    </View>
                                    <View style={styles.titleInfo}>
                                        <Text style={[styles.titleName, !isUnlocked && { color: '#94a3b8' }]}>{t(title.name as any)}</Text>
                                        <Text style={styles.titleDesc}>{t(title.description as any)}</Text>
                                        {!isUnlocked && <Text style={styles.titleCondition}>{t('condition') || 'Yêu cầu'}: {t(title.condition as any)}</Text>}
                                    </View>
                                    {isUnlocked && (
                                        <TouchableOpacity 
                                            onPress={() => onEquip(title.id)} 
                                            style={[styles.equipBtn, isEquipped ? { backgroundColor: '#def7ec' } : { backgroundColor: '#eff6ff' }]}
                                            disabled={isEquipped}
                                        >
                                            <Text style={[styles.equipBtnText, isEquipped ? { color: '#059669' } : { color: '#3b82f6' }]}>
                                                {isEquipped ? t('equipped') : t('equip')}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            );
                        })}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const ConfirmationModal = ({ visible, title, message, onConfirm, onCancel, confirmText = 'Xác Nhận', cancelText = 'Hủy', type = 'info' }: { visible: boolean, title: string, message: string, onConfirm: () => void, onCancel: () => void, confirmText?: string, cancelText?: string, type?: 'info' | 'danger' }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
    <View style={styles.modalOverlay}>
      <View style={styles.confirmationContent}>
        <View style={[styles.iconContainer, type === 'danger' ? { backgroundColor: '#fef2f2' } : { backgroundColor: '#eff6ff' }]}>
            {type === 'danger' ? <AlertTriangle size={32} color="#ef4444" /> : <Shield size={32} color="#3b82f6" />}
        </View>
        <Text style={styles.confirmTitle}>{title}</Text>
        <Text style={styles.confirmMessage}>{message}</Text>
        <View style={styles.confirmActions}>
          <TouchableOpacity onPress={onCancel} style={styles.confirmBtnCancel} activeOpacity={0.8}>
            <Text style={styles.confirmBtnTextCancel}>{cancelText}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onConfirm} style={[styles.confirmBtnAction, type === 'danger' && { backgroundColor: '#ef4444' }]} activeOpacity={0.8}>
            <Text style={styles.confirmBtnTextAction}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const EditProfileModal = ({ visible, onClose, initialProfile, onSave }: any) => {
    const { t } = useTranslation();
    const [name, setName] = useState(initialProfile.name);
    const [email, setEmail] = useState(initialProfile.email);
    const [phone, setPhone] = useState(initialProfile.phone || '');
    const [address, setAddress] = useState(initialProfile.address || '');
    const [bio, setBio] = useState(initialProfile.bio || '');

    useEffect(() => {
        if (visible) {
            setName(initialProfile.name);
            setEmail(initialProfile.email);
            setPhone(initialProfile.phone || '');
            setAddress(initialProfile.address || '');
            setBio(initialProfile.bio || '');
        }
    }, [visible, initialProfile]);

    const handleSave = () => {
        onSave({ name, email, phone, address, bio });
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose} statusBarTranslucent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{t('edit_profile')}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}><X size={24} color="#64748b" /></TouchableOpacity>
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.inputLabel}>{t('trainer_name')}</Text>
                        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Tên trainer..." />
                        <Text style={styles.inputLabel}>Email</Text>
                        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email..." keyboardType="email-address" />
                        <Text style={styles.inputLabel}>{t('phone')}</Text>
                        <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Số điện thoại..." keyboardType="phone-pad" />
                        <Text style={styles.inputLabel}>{t('address')}</Text>
                        <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Địa chỉ..." />
                        <Text style={styles.inputLabel}>{t('bio')}</Text>
                        <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} value={bio} onChangeText={setBio} placeholder="Bio..." multiline />
                    </ScrollView>
                    <TouchableOpacity onPress={handleSave} style={styles.modalBtnSave} activeOpacity={0.8}>
                        <Text style={styles.modalBtnTextSave}>{t('save_changes')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const SettingsModal = ({ visible, onClose, profile, onUpdate }: any) => {
    const { t } = useTranslation();
    const showNotification = useUIStore((state) => state.showNotification);
    const [notifications, setNotifications] = useState(profile.notificationsEnabled);
    const [sound, setSound] = useState(profile.soundEnabled ?? true);
    const [vibration, setVibration] = useState(profile.vibrationEnabled ?? true);
    const [language, setLanguage] = useState(profile.language ?? 'vi');
    const [currency, setCurrency] = useState(profile.currency ?? 'VND');

    useEffect(() => {
        if (visible) {
            setNotifications(profile.notificationsEnabled);
            setSound(profile.soundEnabled ?? true);
            setVibration(profile.vibrationEnabled ?? true);
            setLanguage(profile.language ?? 'vi');
            setCurrency(profile.currency ?? 'VND');
        }
    }, [visible, profile]);

    const handleSave = () => {
        onUpdate({ 
            notificationsEnabled: notifications,
            soundEnabled: sound,
            vibrationEnabled: vibration,
            language,
            currency
        });
        onClose();
    };

    const SettingRow = ({ label, children }: any) => (
        <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>{label}</Text>
            {children}
        </View>
    );

    const OptionButton = ({ label, selected, onPress }: any) => (
        <TouchableOpacity onPress={onPress} style={[styles.optionBtn, selected && styles.optionBtnSelected]} activeOpacity={0.8}>
            <Text style={[styles.optionBtnText, selected && { color: '#fff' }]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose} statusBarTranslucent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Settings size={24} color="#64748b" style={{marginRight: 8}} />
                            <Text style={styles.modalTitle}>{t('settings_title')}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}><X size={24} color="#64748b" /></TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.sectionTitle}>{t('general')}</Text>
                        <SettingRow label={t('notifications')}>
                            <Switch 
                                value={notifications} 
                                onValueChange={setNotifications} 
                                trackColor={{ false: '#e2e8f0', true: '#bbf7d0' }}
                                thumbColor={notifications ? '#10b981' : '#f1f5f9'}
                            />
                        </SettingRow>
                        <SettingRow label={t('sound')}>
                            <Switch 
                                value={sound} 
                                onValueChange={setSound} 
                                trackColor={{ false: '#e2e8f0', true: '#bfdbfe' }}
                                thumbColor={sound ? '#3b82f6' : '#f1f5f9'}
                            />
                        </SettingRow>
                        <SettingRow label={t('vibration')}>
                            <Switch 
                                value={vibration} 
                                onValueChange={setVibration} 
                                trackColor={{ false: '#e2e8f0', true: '#bfdbfe' }}
                                thumbColor={vibration ? '#3b82f6' : '#f1f5f9'}
                            />
                        </SettingRow>

                        <Text style={styles.sectionTitle}>{t('options')}</Text>
                        <SettingRow label={t('language')}>
                            <View style={{flexDirection: 'row', gap: 8}}>
                                <OptionButton label="Tiếng Việt" selected={language === 'vi'} onPress={() => setLanguage('vi')} />
                                <OptionButton label="English" selected={language === 'en'} onPress={() => setLanguage('en')} />
                            </View>
                        </SettingRow>
                        <SettingRow label={t('currency')}>
                            <View style={{flexDirection: 'row', gap: 8}}>
                                <OptionButton label="VND" selected={currency === 'VND'} onPress={() => setCurrency('VND')} />
                                <OptionButton label="USD" selected={currency === 'USD'} onPress={() => setCurrency('USD')} />
                            </View>
                        </SettingRow>

                        <Text style={styles.sectionTitle}>{t('data')}</Text>
                        <TouchableOpacity style={styles.actionRow} onPress={() => showNotification(t('cache_cleared' as any), 'success')}>
                            <Text style={styles.actionRowText}>{t('clear_cache')}</Text>
                            <ChevronRight size={20} color="#cbd5e1" />
                        </TouchableOpacity>
                        
                    </ScrollView>

                    <TouchableOpacity onPress={handleSave} style={styles.modalBtnSave} activeOpacity={0.8}>
                        <Text style={styles.modalBtnTextSave}>{t('save_settings')}</Text>
                    </TouchableOpacity>
                    
                    <Text style={[styles.versionText, { marginTop: 16 }]}>v3.1.0 build 20240520</Text>
                </View>
            </View>
        </Modal>
    );
};


const VipUpgradeModal = ({ visible, onClose, onUpgrade, currentVipType }: { visible: boolean, onClose: () => void, onUpgrade: (type: VipType) => void, currentVipType: VipType }) => {
    const { t } = useTranslation();
    const currency = useUserStore((state) => state.profile?.currency || 'VND');
    const [selected, setSelected] = useState<VipType | null>(null);
    const [confirmVisible, setConfirmVisible] = useState(false);

    const handlePreConfirm = () => {
        if (selected) setConfirmVisible(true);
    };

    const handlePurchase = () => {
        if (selected) {
            onUpgrade(selected);
            setConfirmVisible(false);
            onClose();
            setSelected(null);
        }
    };

    const isLifetime = currentVipType === 'lifetime';

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose} statusBarTranslucent>
            <View style={styles.modalOverlay}>
                <View style={[styles.vipModelContent, isLifetime && { justifyContent: 'center', alignItems: 'center' }]}>
                    <TouchableOpacity onPress={onClose} style={styles.closeVipBtn}><X size={24} color="#64748b" /></TouchableOpacity>
                    
                    {isLifetime ? (
                        <View style={{ alignItems: 'center', padding: 20 }}>
                            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#fef3c7', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                                <Crown size={48} color="#f59e0b" fill="#f59e0b" />
                            </View>
                            <Text style={[styles.vipTitle, { textAlign: 'center', fontSize: 24, marginBottom: 10 }]}>{t('vip_member_forever')}</Text>
                            <Text style={[styles.vipSubtitle, { fontSize: 16, lineHeight: 24 }]}>
                                {t('vip_forever_desc')}
                            </Text>
                            <View style={{ marginTop: 20, padding: 16, backgroundColor: '#f0fdf4', borderRadius: 16, flexDirection: 'row', alignItems: 'center' }}>
                                <CheckCircle size={24} color="#16a34a" />
                                <Text style={{ marginLeft: 10, color: '#16a34a', fontWeight: '700', fontSize: 16 }}>{t('vip_activated')}</Text>
                            </View>
                        </View>
                    ) : (
                        <>
                            <View style={styles.vipHeaderTitle}>
                                <Crown size={32} color="#fcd34d" fill="#fcd34d" />
                                <Text style={styles.vipTitle}>{t('upgrade_vip')}</Text>
                            </View>
                            <Text style={styles.vipSubtitle}>{t('vip_benefits')}</Text>

                            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                                <VipPackageCard 
                                    title={t('vip_month')} 
                                    price={formatCurrency(59000, currency)} 
                                    duration={t('vip_month')} 
                                    features={['Khung Avatar Vàng', '+10% EXP']} 
                                    selected={selected === 'monthly'} 
                                    onPress={() => setSelected('monthly')}
                                    disabled={currentVipType === 'monthly'}
                                />
                                <VipPackageCard 
                                    title={t('vip_year')} 
                                    price={formatCurrency(599000, currency)} 
                                    duration={t('vip_year')} 
                                    features={['Tất cả quyền lợi tháng', 'Khung Bạch Kim', '+20% EXP']} 
                                    selected={selected === 'yearly'} 
                                    onPress={() => setSelected('yearly')} 
                                    badge="TIẾT KIỆM 15%" 
                                    popular 
                                    disabled={currentVipType === 'yearly'}
                                />
                                <VipPackageCard 
                                    title={t('vip_lifetime')} 
                                    price={formatCurrency(1999000, currency)} 
                                    duration={t('vip_lifetime')} 
                                    features={['Không hết hạn', 'Badge Legend', '+50% EXP']} 
                                    selected={selected === 'lifetime'} 
                                    onPress={() => setSelected('lifetime')} 
                                    badge="ƯU ĐÃI GIỚI HẠN" 
                                    premium 
                                />
                            </ScrollView>

                            <View style={styles.confirmButtonContainer}>
                                <TouchableOpacity onPress={handlePreConfirm} disabled={!selected} style={[styles.confirmButton, !selected && styles.confirmButtonDisabled]} activeOpacity={0.8}>
                                    <Text style={styles.confirmButtonText}>{selected ? t('confirm_upgrade') : t('select_package')}</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </View>
            
            <ConfirmationModal 
                visible={confirmVisible} 
                title={t('vip_confirm_title')} 
                message={`${t('vip_confirm_message')} ${selected === 'lifetime' ? t('vip_lifetime') : selected === 'yearly' ? t('vip_year') : t('vip_month')}?`}
                onConfirm={handlePurchase} 
                onCancel={() => setConfirmVisible(false)} 
                confirmText={t('pay_now')}
                type="info"
            />
        </Modal>
    );
};

const PaymentMethodsModal = ({ visible, onClose, paymentMethods, onAdd, onRemove, onSetDefault }: any) => {
    const { t } = useTranslation();
    const [showAdd, setShowAdd] = useState(false);
    const [newCard, setNewCard] = useState({ provider: 'Visa', lastFour: '', expiryDate: '', isDefault: false });

    const handleAdd = () => {
        if (newCard.lastFour.length === 4 && newCard.expiryDate.length === 5) {
            onAdd({
                type: 'card',
                provider: newCard.provider,
                lastFour: newCard.lastFour,
                expiryDate: newCard.expiryDate,
                isDefault: newCard.isDefault
            });
            setShowAdd(false);
            setNewCard({ provider: 'Visa', lastFour: '', expiryDate: '', isDefault: false });
        }
    };

    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{showAdd ? t('add_payment_method') : t('payment_method')}</Text>
                        <TouchableOpacity onPress={() => showAdd ? setShowAdd(false) : onClose()} style={styles.closeBtn}>
                            <X size={24} color="#0f172a" />
                        </TouchableOpacity>
                    </View>

                    {showAdd ? (
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.inputLabel}>{t('card_number')}</Text>
                            <TextInput 
                                style={styles.input} 
                                placeholder="**** **** **** 1234" 
                                maxLength={4} 
                                keyboardType="numeric"
                                value={newCard.lastFour}
                                onChangeText={(val) => setNewCard({...newCard, lastFour: val})}
                            />
                            <Text style={styles.inputLabel}>{t('expiry_date')}</Text>
                            <TextInput 
                                style={styles.input} 
                                placeholder="MM/YY" 
                                maxLength={5}
                                value={newCard.expiryDate}
                                onChangeText={(val) => setNewCard({...newCard, expiryDate: val})}
                            />
                            <TouchableOpacity style={styles.modalBtnSave} onPress={handleAdd}>
                                <Text style={styles.modalBtnTextSave}>{t('confirm')}</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    ) : (
                        <>
                            <FlatList
                                data={paymentMethods}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <View style={[styles.pmItem, item.isDefault && styles.pmItemDefault]}>
                                        <View style={styles.pmInfo}>
                                            <CreditCard size={20} color={item.isDefault ? '#3b82f6' : '#64748b'} />
                                            <View style={{ marginLeft: 12 }}>
                                                <Text style={styles.pmProvider}>{item.provider} **** {item.lastFour}</Text>
                                                <Text style={styles.pmExpiry}>{t('expiry_date')}: {item.expiryDate}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.pmActions}>
                                            {!item.isDefault && (
                                                <TouchableOpacity onPress={() => onSetDefault(item.id)} style={styles.pmActionBtn}>
                                                    <Star size={16} color="#94a3b8" />
                                                </TouchableOpacity>
                                            )}
                                            <TouchableOpacity onPress={() => onRemove(item.id)} style={styles.pmActionBtn}>
                                                <Trash2 size={16} color="#ef4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                                ListEmptyComponent={<Text style={styles.emptyText}>{t('no_results_found')}</Text>}
                            />
                            <TouchableOpacity style={styles.addPmBtn} onPress={() => setShowAdd(true)}>
                                <Plus size={20} color="#3b82f6" />
                                <Text style={styles.addPmText}>{t('add_payment_method')}</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const DepositModal = ({ visible, onClose, type, onDeposit }: { visible: boolean, onClose: () => void, type: 'bank' | 'scratch' | 'virtual', onDeposit: (amount: number) => void }) => {
    const { t } = useTranslation();
    const [amount, setAmount] = useState('100000');
    const [code, setCode] = useState('');
    const [cardType, setCardType] = useState<'viettel' | 'mobifone' | 'vinaphone' | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleConfirm = () => {
        if (type === 'scratch') {
            if (!cardType) {
                setError(t('please_select_card_type' as any));
                return;
            }
            if (!code) {
                setError(t('please_enter_card_code' as any));
                return;
            }
            if (code.length < 12) {
                setError(t('invalid_card_code' as any));
                return;
            }
        }

        const numAmount = parseInt(amount);
        if (!isNaN(numAmount) && numAmount > 0) {
            onDeposit(numAmount);
            onClose();
            // Reset state
            setCode('');
            setCardType(null);
            setError(null);
        }
    };

    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { maxHeight: '80%' }]}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{type === 'bank' ? t('bank_transfer') : type === 'scratch' ? t('scratch_card') : t('deposit')}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}><X size={24} color="#0f172a" /></TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {type === 'scratch' && (
                            <>
                                <Text style={styles.inputLabel}>{t('card_type' as any)}</Text>
                                <View style={styles.providerGrid}>
                                    {['viettel', 'mobifone', 'vinaphone'].map((p) => (
                                        <TouchableOpacity 
                                            key={p} 
                                            style={[styles.providerBtn, cardType === p && styles.providerBtnSelected]}
                                            onPress={() => { setCardType(p as any); setError(null); }}
                                        >
                                            <Text style={[styles.providerText, cardType === p && styles.providerTextSelected]}>{t(p as any)}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </>
                        )}

                        <Text style={styles.inputLabel}>{type === 'scratch' ? t('card_value' as any) : t('total_price')}</Text>
                        <View style={styles.amountPresets}>
                            {['10000', '20000', '50000', '100000', '200000', '500000'].map((a) => (
                                <TouchableOpacity 
                                    key={a} 
                                    style={[styles.presetAmount, amount === a && styles.presetAmountSelected]}
                                    onPress={() => setAmount(a)}
                                >
                                    <Text style={[styles.presetAmountText, amount === a && styles.presetAmountTextSelected]}>{parseInt(a)/1000}k</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        
                        {type === 'scratch' && (
                            <>
                                <Text style={styles.inputLabel}>{t('enter_card_code' as any)}</Text>
                                <TextInput 
                                    style={[styles.input, error && { borderColor: '#ef4444', borderWidth: 1 }]} 
                                    placeholder="---- ---- ----" 
                                    value={code}
                                    onChangeText={(val) => { setCode(val.replace(/[^0-9]/g, '').slice(0, 12)); setError(null); }}
                                    keyboardType="numeric"
                                    maxLength={12}
                                />
                                {error && <Text style={styles.errorLabel}>{error}</Text>}
                            </>
                        )}

                        {type === 'bank' && (
                            <View style={styles.bankInfo}>
                                <Text style={styles.bankText}>{t('bank_transfer_desc')}:</Text>
                                <Text style={styles.bankDetails}>{t('account_number' as any)}: 1234567890</Text>
                                <Text style={styles.bankDetails}>{t('bank_name' as any)}: Poké-Bank</Text>
                                <Text style={styles.bankDetails}>{t('account_holder' as any)}: ADMIN</Text>
                            </View>
                        )}

                        <TouchableOpacity style={styles.modalBtnSave} onPress={handleConfirm}>
                            <Text style={styles.modalBtnTextSave}>{t('confirm')}</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const VipPackageCard = ({ title, price, duration, features, selected, onPress, badge, popular, premium, disabled }: any) => {
    const { t } = useTranslation();
    return (
    <TouchableOpacity 
        onPress={onPress} 
        disabled={disabled}
        style={[
            styles.vipPackage, 
            selected && styles.vipPackageSelected, 
            popular && styles.vipPackagePopular, 
            premium && styles.vipPackagePremium, 
            selected && premium && styles.vipPackagePremiumSelected,
            disabled && { opacity: 0.5, backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' }
        ]} 
        activeOpacity={0.9}
    >
        {badge && <View style={[styles.popularBadge, premium && { backgroundColor: '#ec4899' }]}><Text style={styles.popularText}>{badge}</Text></View>}
        <View style={styles.vipPackageHeader}>
            <View>
                <Text style={[styles.vipPackageTitle, premium && { color: '#fff' }, disabled && { color: '#94a3b8' }]}>{title}</Text>
                <Text style={[styles.vipDuration, premium && { color: 'rgba(255,255,255,0.7)' }, disabled && { color: '#94a3b8' }]}>/ {duration}</Text>
            </View>
            <Text style={[styles.vipPrice, premium && { color: '#fff' }, disabled && { color: '#94a3b8' }]}>{disabled ? t('vip_owned') : price}</Text>
        </View>
        <View style={[styles.vipDivider, premium && { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
        <View style={styles.vipFeatures}>{features.map((f: string, i: number) => (
            <View key={i} style={styles.vipFeatureRow}>
                <Check size={16} color={disabled ? '#cbd5e1' : (premium ? '#ec4899' : '#10b981')} />
                <Text style={[styles.vipFeature, premium && { color: '#fff' }, disabled && { color: '#94a3b8' }]}>{f}</Text>
            </View>
        ))}</View>
    </TouchableOpacity>
    );
};

// --- Main Screen ---

import { useNavigation } from '@react-navigation/native';

// ...

export const ProfileScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const { t, language } = useTranslation();
    const profile = useUserStore((state) => state.profile);
    const updateProfile = useUserStore((state) => state.updateProfile);
    const upgradeToVip = useUserStore((state) => state.upgradeToVip);
    const setAvatar = useUserStore((state) => state.setAvatar);
    const equipTitle = useUserStore((state) => state.equipTitle);
    const showNotification = useUIStore((state) => state.showNotification);
    const addPaymentMethod = useUserStore((state) => state.addPaymentMethod);
    const removePaymentMethod = useUserStore((state) => state.removePaymentMethod);
    const setDefaultPM = useUserStore((state) => state.setDefaultPaymentMethod);
    const updateBalance = useUserStore((state) => state.updateBalance);
    const logout = useUserStore((state) => state.logout);
    
    if (!profile) return <View style={styles.container} />;

    const [editVisible, setEditVisible] = useState(false);
    const [vipVisible, setVipVisible] = useState(false);
    const [titlesVisible, setTitlesVisible] = useState(false);
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [avatarSelectionVisible, setAvatarSelectionVisible] = useState(false);
    const [pmVisible, setPmVisible] = useState(false);
    const [depositVisible, setDepositVisible] = useState(false);
    const [depositType, setDepositType] = useState<'bank' | 'scratch' | 'virtual'>('virtual');

    const handleEquipTitle = (id: string) => {
        equipTitle(id);
        showNotification(t('equip_success'), 'success');
    };
    
    const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);

    const handleUpdateProfile = (data: any) => {
        updateProfile(data);
        showNotification(t('update_success'), 'success');
    };

    const handleUpgradeVip = (type: VipType) => {
        upgradeToVip(type);
        showNotification(t('vip_success'), 'success');
    };

    const handleAvatarChange = (avatarId: string) => {
        setAvatar(avatarId);
        showNotification(t('avatar_success'), 'success');
    };

    const renderAvatarView = () => {
        if (!profile.avatar) {
            return <User size={48} color={profile.isVip ? '#fcd34d' : '#ffffff'} />;
        }

        const preset = (PRESET_AVATARS as any)[profile.avatar];
        if (preset) {
            return <Image source={preset} style={styles.fullAvatar} />;
        }

        return <Image source={{ uri: profile.avatar }} style={styles.fullAvatar} />;
    };

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                    {/* Header */}
                    <View style={[styles.profileHeader, profile.isVip && styles.vipHeader]}>
                       <View style={styles.avatarContainer}>
                           <View style={[styles.avatarWrapper, profile.isVip && styles.vipAvatarWrapper]}>
                               <View style={[styles.avatar, profile.isVip && { borderColor: '#fcd34d' }]}>
                                   {renderAvatarView()}
                               </View>
                               <TouchableOpacity onPress={() => setAvatarSelectionVisible(true)} style={[styles.editAvatarBtn, profile.isVip && { backgroundColor: '#fcd34d', borderColor: '#78350f' }]} activeOpacity={0.8}>
                                   <Edit2 size={16} color={profile.isVip ? '#78350f' : '#ffffff'} />
                               </TouchableOpacity>
                           </View>
                           <Text style={styles.userName}>{profile.name}</Text>
                           {profile.equippedTitle && (
                               <View style={[styles.equippedTitleBadge, { borderColor: profile.equippedTitle.color, backgroundColor: 'rgba(0,0,0,0.25)', shadowColor: profile.equippedTitle.color, elevation: 5 }]}>
                                   <Star size={12} color={profile.equippedTitle.color} fill={profile.equippedTitle.color} />
                                   <Text style={[styles.equippedTitleText, { color: profile.equippedTitle.color }]}>{t(profile.equippedTitle.name as any)}</Text>
                               </View>
                           )}
                           <Text style={styles.userEmail}>{profile.email}</Text>
                           <View style={styles.levelContainer}>
                               <View style={styles.levelBadge}><Text style={styles.levelText}>Lv. {profile.level}</Text></View>
                               <View style={{ width: 12 }} /> 
                               <View style={styles.expInfo}>
                                   <View style={styles.expBar}><View style={[styles.expFill, { width: `${(profile.currentExp / profile.nextLevelExp) * 100}%` }]} /></View>
                                   <Text style={styles.expText}>{profile.currentExp} / {profile.nextLevelExp} XP</Text>
                               </View>
                           </View>

                           {!profile.isVip && (
                               <TouchableOpacity onPress={() => setVipVisible(true)} style={styles.headerUpgradeBtn} activeOpacity={0.8}>
                                   <Crown size={20} color="#fff" fill="#fcd34d" />
                                   <Text style={styles.headerUpgradeText}>{t('upgrade_vip')}</Text>
                                   <ChevronRight size={16} color="#fff" />
                               </TouchableOpacity>
                           )}
                       </View>
                    </View>

                    {/* Stats */}
                    <View style={styles.statsContainer}>
                        <StatItem label={t('balance')} value={profile.currency === 'VND' ? formatCompactVND(profile.balance || 0) : formatCurrency(profile.balance || 0, 'USD')} icon={Wallet} color="#10b981" />
                        <StatItem label={t('my_collection')} value={profile.collectionCount.toString()} icon={BookOpen} color="#3b82f6" />
                        <StatItem label={t('rank')} value={profile.rank.replace('VIP ', '')} icon={Star} color="#f59e0b" />
                    </View>


                    {/* Shopping & Finance */}
                    <View style={styles.menuContainer}>
                        <Text style={styles.menuTitle}>{t('finance_shopping' as any) || 'Mua sắm & Giao dịch'}</Text>
                        <MenuItem 
                            icon={ShoppingCart} 
                            label={t('nav_cart')} 
                            color="#f59e0b" 
                            onPress={() => navigation.navigate('Cart')} 
                        />
                        <MenuItem 
                            icon={CreditCard} 
                            label={t('payment_method' as any) || 'Thanh toán'} 
                            color="#10b981" 
                            onPress={() => setPmVisible(true)} 
                        />
                        <MenuItem 
                            icon={Clock} 
                            label={t('purchase_history' as any) || 'Lịch sử mua hàng'} 
                            color="#3b82f6" 
                            onPress={() => navigation.navigate('PurchaseHistory')} 
                        />
                    </View>

                    {/* Deposit Section */}
                    <View style={styles.menuContainer}>
                        <Text style={styles.menuTitle}>{t('deposit')}</Text>
                        <View style={styles.depositRow}>
                            <TouchableOpacity 
                                style={styles.depositItem} 
                                onPress={() => { setDepositType('scratch'); setDepositVisible(true); }}
                            >
                                <View style={[styles.depositIcon, { backgroundColor: '#fef3c7' }]}><CreditCard size={20} color="#f59e0b" /></View>
                                <Text style={styles.depositLabel}>{t('scratch_card')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.depositItem} 
                                onPress={() => { setDepositType('bank'); setDepositVisible(true); }}
                            >
                                <View style={[styles.depositIcon, { backgroundColor: '#eff6ff' }]}><Banknote size={20} color="#3b82f6" /></View>
                                <Text style={styles.depositLabel}>{t('bank_transfer')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.depositItem, { backgroundColor: '#f0fdf4' }]} 
                                onPress={() => {
                                    updateBalance(500000);
                                    showNotification(t('deposit_success'), 'success');
                                }}
                            >
                                <View style={[styles.depositIcon, { backgroundColor: '#dcfce7' }]}><Wallet size={20} color="#10b981" /></View>
                                <Text style={[styles.depositLabel, { color: '#16a34a' }]}>{t('deposit_virtual')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Menu */}
                    <View style={styles.menuContainer}>
                        <Text style={styles.menuTitle}>{t('settings_title')}</Text>
                        <MenuItem icon={Edit2} label={t('edit_profile')} color="#ef4444" onPress={() => setEditVisible(true)} />
                        <MenuItem icon={Award} label={t('titles')} color="#f59e0b" onPress={() => setTitlesVisible(true)} />
                        <MenuItem icon={Settings} label={t('system_settings')} color="#64748b" onPress={() => setSettingsVisible(true)} />
                        <MenuItem icon={Bell} label={t('notifications')} color="#3b82f6" onPress={() => showNotification(t('coming_soon'), 'info')} />
                        <MenuItem icon={Crown} label={t('vip_packages')} color="#8b5cf6" onPress={() => setVipVisible(true)} />
                        <MenuItem icon={Shield} label={t('security')} color="#10b981" onPress={() => showNotification(t('coming_soon'), 'info')} />
                        <MenuItem icon={HelpCircle} label={t('support')} color="#64748b" onPress={() => showNotification(t('coming_soon'), 'info')} />
                    </View>

                    <TouchableOpacity onPress={() => setLogoutConfirmVisible(true)} style={styles.logoutButton} activeOpacity={0.7}>
                        <LogOut size={20} color="#ef4444" />
                        <Text style={styles.logoutText}>{t('logout')}</Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.versionText}>v3.1.0 (VIP Edition)</Text>
                </ScrollView>
            </SafeAreaView>

            {/* Modals */}
            <AvatarSelectionModal visible={avatarSelectionVisible} onClose={() => setAvatarSelectionVisible(false)} onSelect={handleAvatarChange} />
            <TitlesModal
                visible={titlesVisible}
                onClose={() => setTitlesVisible(false)}
                unlockedTitles={profile.unlockedTitles || []}
                equippedTitle={profile.equippedTitle}
                onEquip={handleEquipTitle}
            />
            <EditProfileModal visible={editVisible} onClose={() => setEditVisible(false)} initialProfile={profile} onSave={handleUpdateProfile} />
            <SettingsModal 
                visible={settingsVisible} 
                onClose={() => setSettingsVisible(false)} 
                profile={profile} 
                onUpdate={handleUpdateProfile} 
            />
            <VipUpgradeModal 
                visible={vipVisible} 
                onClose={() => setVipVisible(false)} 
                onUpgrade={handleUpgradeVip} 
                currentVipType={profile.vipType}
            />

            <PaymentMethodsModal 
                visible={pmVisible} 
                onClose={() => setPmVisible(false)} 
                paymentMethods={profile.paymentMethods || []}
                onAdd={addPaymentMethod}
                onRemove={removePaymentMethod}
                onSetDefault={setDefaultPM}
            />

            <DepositModal 
                visible={depositVisible} 
                onClose={() => setDepositVisible(false)} 
                type={depositType}
                onDeposit={(amount) => {
                    updateBalance(amount);
                    showNotification(t('deposit_success'), 'success');
                }}
            />
            <ConfirmationModal 
                visible={logoutConfirmVisible} 
                title={t('logout_confirm_title')} 
                message={t('logout_confirm_message')} 
                onConfirm={() => { setLogoutConfirmVisible(false); logout(); }} 
                onCancel={() => setLogoutConfirmVisible(false)} 
                confirmText={t('logout')} 
                type="danger" 
            />
        </View>
    );
};

// --- Helpers ---

const StatItem = ({ label, value, icon: Icon, color }: any) => (
    <View style={styles.statBox}>
        <View style={[styles.statIconCircle, { backgroundColor: `${color}15` }]}><Icon size={20} color={color} /></View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const MenuItem = ({ icon: Icon, label, color, onPress }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.menuItemLeft}>
            <View style={[styles.menuIconContainer, { backgroundColor: `${color}10` }]}><Icon size={20} color={color} /></View>
            <Text style={styles.menuLabel}>{label}</Text>
        </View>
        <ChevronRight size={20} color="#cbd5e1" />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    profileHeader: {
        paddingHorizontal: 16, paddingTop: 30, paddingBottom: 60,
        backgroundColor: '#ef4444', borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
        alignItems: 'center', zIndex: 1, position: 'relative',
    },
    vipHeader: { backgroundColor: '#1e293b' },
    avatarContainer: { alignItems: 'center', width: '100%' },
    avatarWrapper: { marginBottom: 16, position: 'relative' },
    vipAvatarWrapper: { elevation: 10, shadowColor: '#fcd34d', shadowRadius: 20 },
    avatar: { width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#fff', overflow: 'hidden' },
    fullAvatar: { width: '100%', height: '100%', resizeMode: 'cover' },
    editAvatarBtn: { position: 'absolute', bottom: 0, right: 0, width: 34, height: 34, borderRadius: 17, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
    userName: { fontSize: 24, fontWeight: '900', color: '#fff' },
    userEmail: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
    levelContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16, width: '80%' },
    levelBadge: { backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    levelText: { color: '#ef4444', fontWeight: '800', fontSize: 13 },
    expInfo: { flex: 1 },
    expBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, marginBottom: 4 },
    expFill: { height: '100%', backgroundColor: '#fff', borderRadius: 3 },
    expText: { color: 'rgba(255,255,255,0.9)', fontSize: 10, fontWeight: '700', alignSelf: 'flex-end' },
    headerUpgradeBtn: { marginTop: 20, backgroundColor: 'rgba(255,255,255,0.15)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
    headerUpgradeText: { color: '#fff', fontWeight: '700', fontSize: 13, marginHorizontal: 8 },
    
    statsContainer: { flexDirection: 'row', marginHorizontal: 20, marginTop: -30, marginBottom: 24, zIndex: 2 },
    statBox: { flex: 1, backgroundColor: '#fff', borderRadius: 20, padding: 12, marginHorizontal: 4, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
    statIconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    statValue: { fontSize: 16, fontWeight: '900', color: '#0f172a' },
    statLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '700' },
    
    menuContainer: { paddingHorizontal: 20, marginBottom: 20 },
    menuTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 12, marginLeft: 4 },
    menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, backgroundColor: '#fff', borderRadius: 16, marginBottom: 8, borderWidth: 1, borderColor: '#f1f5f9' },
    menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
    menuIconContainer: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    menuLabel: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
    
    depositRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
    depositItem: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
    depositIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    depositLabel: { fontSize: 11, fontWeight: '700', color: '#64748b', textAlign: 'center' },
    
    logoutButton: { marginHorizontal: 20, padding: 16, backgroundColor: '#fef2f2', borderRadius: 16, borderWidth: 1, borderColor: '#fee2e2', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    logoutText: { color: '#ef4444', fontWeight: '800', fontSize: 15, marginLeft: 8 },
    versionText: { textAlign: 'center', color: '#cbd5e1', fontSize: 10, fontWeight: '700' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 24, padding: 20, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
    closeBtn: { padding: 4 },
    inputLabel: { fontSize: 13, fontWeight: '700', color: '#64748b', marginBottom: 6, marginTop: 12 },
    input: { backgroundColor: '#f8fafc', padding: 14, borderRadius: 12, fontSize: 15, color: '#0f172a', fontWeight: '600' },
    modalBtnSave: { backgroundColor: '#ef4444', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 24 },
    modalBtnTextSave: { color: '#fff', fontWeight: '800', fontSize: 16 },

    confirmationContent: { backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center' },
    iconContainer: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    confirmTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a', marginBottom: 8 },
    confirmMessage: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
    confirmActions: { flexDirection: 'row', width: '100%' },
    confirmBtnCancel: { flex: 1, padding: 14, borderRadius: 14, backgroundColor: '#f1f5f9', alignItems: 'center', marginRight: 12 },
    confirmBtnAction: { flex: 1, padding: 14, borderRadius: 14, backgroundColor: '#3b82f6', alignItems: 'center' },
    confirmBtnTextCancel: { fontWeight: '700', color: '#64748b' },
    confirmBtnTextAction: { fontWeight: '700', color: '#fff' },

    vipModelContent: { backgroundColor: '#fff', borderRadius: 32, padding: 20, height: '85%', width: '100%' },
    closeVipBtn: { position: 'absolute', top: 20, right: 20, zIndex: 10, backgroundColor: '#f1f5f9', padding: 8, borderRadius: 20 },
    vipHeaderTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
    vipTitle: { fontSize: 22, fontWeight: '900', color: '#0f172a', marginLeft: 8 },
    vipSubtitle: { textAlign: 'center', color: '#64748b', marginBottom: 20 },
    vipPackage: { padding: 16, borderRadius: 20, backgroundColor: '#f8fafc', borderWidth: 2, borderColor: '#e2e8f0', marginBottom: 12 },
    vipPackageSelected: { borderColor: '#ef4444', backgroundColor: '#fef2f2' },
    vipPackagePopular: { marginTop: 8 },
    vipPackagePremium: { backgroundColor: '#0f172a', borderColor: '#0f172a' },
    vipPackagePremiumSelected: { borderColor: '#fcd34d' },
    popularBadge: { position: 'absolute', top: -10, right: 16, backgroundColor: '#fcd34d', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, zIndex: 5 },
    popularText: { fontSize: 10, fontWeight: '800', color: '#fff' },
    vipPackageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    vipPackageTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
    vipPrice: { fontSize: 18, fontWeight: '900', color: '#ef4444' },
    vipDuration: { fontSize: 12, color: '#94a3b8' },
    vipDivider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 10 },
    vipFeatures: { },
    vipFeatureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    vipFeature: { fontSize: 12, color: '#475569', fontWeight: '600', marginLeft: 8 },
    confirmButtonContainer: { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16 },
    confirmButton: { backgroundColor: '#ef4444', padding: 16, borderRadius: 16, alignItems: 'center' },
    confirmButtonDisabled: { backgroundColor: '#cbd5e1' },
    confirmButtonText: { color: '#fff', fontWeight: '800', fontSize: 16 },

    toastContainer: {
        position: 'absolute', top: 60, left: 20, right: 20,
        backgroundColor: '#10b981', padding: 16, borderRadius: 16,
        flexDirection: 'row', alignItems: 'center',
        shadowColor: '#000', shadowOpacity: 0.15, shadowOffset: { width: 0, height: 8 }, shadowRadius: 10, elevation: 6,
        zIndex: 9999
    },
    toastText: { color: '#fff', fontSize: 14, fontWeight: '700', marginLeft: 12 },

    equippedTitleBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, marginTop: 8, marginBottom: 4 },
    equippedTitleText: { fontSize: 12, fontWeight: '800', marginLeft: 6, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
    
    modalSubtitle: { fontSize: 14, color: '#64748b', marginBottom: 16 },
    titleItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, backgroundColor: '#f8fafc', marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
    titleItemEquipped: { borderColor: '#10b981', backgroundColor: '#f0fdf4' },
    titleItemLocked: { opacity: 0.7, backgroundColor: '#f1f5f9' },
    titleIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    titleInfo: { flex: 1 },
    titleName: { fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 2 },
    titleDesc: { fontSize: 12, color: '#64748b' },
    titleCondition: { fontSize: 10, color: '#ef4444', marginTop: 2, fontWeight: '600' },
    equipBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    equipBtnText: { fontSize: 12, fontWeight: '700' },

    sectionTitle: { fontSize: 14, fontWeight: '700', color: '#94a3b8', marginTop: 20, marginBottom: 12, textTransform: 'uppercase' },
    settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    settingLabel: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
    optionBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
    optionBtnSelected: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
    optionBtnText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    actionRowText: { fontSize: 16, fontWeight: '600', color: '#ef4444' },

    // Avatar Selection Styles
    galleryPicker: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#f8fafc', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
    galleryIconRow: { flexDirection: 'row', alignItems: 'center' },
    galleryPickerText: { marginLeft: 12, fontSize: 15, fontWeight: '700', color: '#1e293b' },
    presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingBottom: 20 },
    presetItem: { width: (Dimensions.get('window').width - 80) / 4, height: (Dimensions.get('window').width - 80) / 4, borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: '#f1f5f9' },
    presetImage: { width: '100%', height: '100%', resizeMode: 'cover' },

    // Finance Styles
    pmItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#f8fafc', borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
    pmItemDefault: { borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
    pmInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    pmProvider: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
    pmExpiry: { fontSize: 12, color: '#64748b', marginTop: 2 },
    pmActions: { flexDirection: 'row', gap: 8 },
    pmActionBtn: { padding: 8, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#f1f5f9' },
    addPmBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderStyle: 'dashed', borderWidth: 2, borderColor: '#3b82f6', borderRadius: 16, marginTop: 12, gap: 10 },
    addPmText: { color: '#3b82f6', fontWeight: '800', fontSize: 15 },
    emptyText: { textAlign: 'center', color: '#94a3b8', marginVertical: 20, fontWeight: '600' },
    amountPresets: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
    presetAmount: { flex: 1, minWidth: '22%', paddingVertical: 12, backgroundColor: '#f1f5f9', borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
    presetAmountSelected: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
    presetAmountText: { fontWeight: '700', color: '#64748b' },
    presetAmountTextSelected: { color: '#fff' },
    bankInfo: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 16, marginTop: 12, borderWidth: 1, borderColor: '#f1f5f9' },
    bankText: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginBottom: 8 },
    bankDetails: { fontSize: 14, color: '#64748b', fontWeight: '600', marginBottom: 4 },
    providerGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    providerBtn: { flex: 1, paddingVertical: 12, backgroundColor: '#f8fafc', borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
    providerBtnSelected: { backgroundColor: '#0f172a', borderColor: '#0f172a' },
    providerText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
    providerTextSelected: { color: '#fff' },
    errorLabel: { color: '#ef4444', fontSize: 12, fontWeight: '600', marginTop: 4, marginLeft: 4 },
});
