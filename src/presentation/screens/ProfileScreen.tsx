import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Modal, TextInput, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, Bell, Shield, HelpCircle, LogOut, ChevronRight, Award, Star, BookOpen, Edit2, Medal, Crown, Check, X, AlertTriangle, CheckCircle, Info } from 'lucide-react-native';
import { useUserStore } from '../../shared/stores/userStore';
import { VipType } from '../../domain/models/User';

// --- Local Toast Component ---
const LocalToast = ({ visible, message, type, onHide }: { visible: boolean, message: string, type: 'success' | 'error' | 'info', onHide: () => void }) => {
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.sequence([
                Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.delay(2500),
                Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
            ]).start(() => onHide());
        }
    }, [visible]);

    if (!visible) return null;

    const bgColors = { success: '#10b981', error: '#ef4444', info: '#3b82f6' };
    const icons = { 
        success: <CheckCircle size={20} color="#fff" />, 
        error: <AlertTriangle size={20} color="#fff" />, 
        info: <Info size={20} color="#fff" /> 
    };

    return (
        <Animated.View style={[styles.toastContainer, { opacity, backgroundColor: bgColors[type] || bgColors.info }]}>
            {icons[type] || icons.info}
            <Text style={styles.toastText}>{message}</Text>
        </Animated.View>
    );
};

// --- Sub-Components ---

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
                        <Text style={styles.modalTitle}>Sửa Hồ Sơ</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}><X size={24} color="#64748b" /></TouchableOpacity>
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.inputLabel}>Tên Trainer</Text>
                        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Tên trainer..." />
                        <Text style={styles.inputLabel}>Email</Text>
                        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email..." keyboardType="email-address" />
                        <Text style={styles.inputLabel}>Số Điện Thoại</Text>
                        <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Số điện thoại..." keyboardType="phone-pad" />
                        <Text style={styles.inputLabel}>Địa Chỉ</Text>
                        <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Địa chỉ..." />
                        <Text style={styles.inputLabel}>Giới Thiệu</Text>
                        <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} value={bio} onChangeText={setBio} placeholder="Bio..." multiline />
                    </ScrollView>
                    <TouchableOpacity onPress={handleSave} style={styles.modalBtnSave} activeOpacity={0.8}>
                        <Text style={styles.modalBtnTextSave}>Lưu Thay Đổi</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const VipUpgradeModal = ({ visible, onClose, onUpgrade }: any) => {
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

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose} statusBarTranslucent>
            <View style={styles.modalOverlay}>
                <View style={styles.vipModelContent}>
                    <TouchableOpacity onPress={onClose} style={styles.closeVipBtn}><X size={24} color="#64748b" /></TouchableOpacity>
                    <View style={styles.vipHeaderTitle}>
                        <Crown size={32} color="#fcd34d" fill="#fcd34d" />
                        <Text style={styles.vipTitle}>Nâng Cấp VIP</Text>
                    </View>
                    <Text style={styles.vipSubtitle}>Mở khóa đặc quyền tối thượng!</Text>

                    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                        {/* Packages */}
                        <VipPackageCard title="Gói Tháng" price="59.000 đ" duration="Tháng" features={['Khung Avatar Vàng', '+10% EXP']} selected={selected === 'monthly'} onPress={() => setSelected('monthly')} />
                        <VipPackageCard title="Gói Năm" price="599.000 đ" duration="Năm" features={['Tất cả quyền lợi tháng', 'Khung Bạch Kim', '+20% EXP']} selected={selected === 'yearly'} onPress={() => setSelected('yearly')} badge="TIẾT KIỆM 15%" popular />
                        <VipPackageCard title="Trọn Đời" price="1.999.000 đ" duration="Vĩnh viễn" features={['Không hết hạn', 'Badge Legend', '+50% EXP']} selected={selected === 'lifetime'} onPress={() => setSelected('lifetime')} badge="ƯU ĐÃI GIỚI HẠN" premium />
                    </ScrollView>

                    <View style={styles.confirmButtonContainer}>
                         <TouchableOpacity onPress={handlePreConfirm} disabled={!selected} style={[styles.confirmButton, !selected && styles.confirmButtonDisabled]} activeOpacity={0.8}>
                            <Text style={styles.confirmButtonText}>{selected ? 'Xác Nhận Nâng Cấp' : 'Chọn Gói Để Tiếp Tục'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            
            {/* Nested Confirmation for Purchase */}
            <ConfirmationModal 
                visible={confirmVisible} 
                title="Xác Nhận Thanh Toán" 
                message={`Bạn chắc chắn muốn nâng cấp gói ${selected === 'lifetime' ? 'Trọn Đời' : selected === 'yearly' ? 'Năm' : 'Tháng'}?`}
                onConfirm={handlePurchase} 
                onCancel={() => setConfirmVisible(false)} 
                confirmText="Thanh Toán Ngay"
                type="info"
            />
        </Modal>
    );
};

const VipPackageCard = ({ title, price, duration, features, selected, onPress, badge, popular, premium }: any) => (
    <TouchableOpacity onPress={onPress} style={[styles.vipPackage, selected && styles.vipPackageSelected, popular && styles.vipPackagePopular, premium && styles.vipPackagePremium, selected && premium && styles.vipPackagePremiumSelected]} activeOpacity={0.9}>
        {badge && <View style={[styles.popularBadge, premium && { backgroundColor: '#ec4899' }]}><Text style={styles.popularText}>{badge}</Text></View>}
        <View style={styles.vipPackageHeader}>
            <View>
                <Text style={[styles.vipPackageTitle, premium && { color: '#fff' }]}>{title}</Text>
                <Text style={[styles.vipDuration, premium && { color: 'rgba(255,255,255,0.7)' }]}>/ {duration}</Text>
            </View>
            <Text style={[styles.vipPrice, premium && { color: '#fff' }]}>{price}</Text>
        </View>
        <View style={[styles.vipDivider, premium && { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
        <View style={styles.vipFeatures}>{features.map((f: string, i: number) => (
            <View key={i} style={styles.vipFeatureRow}><Check size={16} color={premium ? '#ec4899' : '#10b981'} /><Text style={[styles.vipFeature, premium && { color: '#fff' }]}>{f}</Text></View>
        ))}</View>
    </TouchableOpacity>
);

// --- Main Screen ---

export const ProfileScreen: React.FC = () => {
    const profile = useUserStore((state) => state.profile);
    const updateProfile = useUserStore((state) => state.updateProfile);
    const upgradeToVip = useUserStore((state) => state.upgradeToVip);
    const setAvatar = useUserStore((state) => state.setAvatar);
    
    // Safety check
    if (!profile) return <View style={styles.container} />;

    // Local Toast State
    const [toast, setToast] = useState<{ visible: boolean, message: string, type: 'success' | 'error' | 'info' }>({ visible: false, message: '', type: 'info' });

    const showLocalToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({ visible: true, message, type });
    };

    // Modal States
    const [editVisible, setEditVisible] = useState(false);
    const [vipVisible, setVipVisible] = useState(false);
    
    // Confirmation States
    const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
    const [avatarConfirmVisible, setAvatarConfirmVisible] = useState(false);

    const handleUpdateProfile = (data: any) => {
        updateProfile(data);
        showLocalToast('Cập nhật hồ sơ thành công!', 'success');
    };

    const handleUpgradeVip = (type: VipType) => {
        upgradeToVip(type);
        showLocalToast('Nâng cấp VIP thành công!', 'success');
    };

    const handleAvatarChange = () => {
        const mockImages = ['default_red', 'blue', 'leaf', 'ethan', 'lyra'];
        const randomImage = mockImages[Math.floor(Math.random() * mockImages.length)];
        setAvatar(randomImage);
        showLocalToast('Đã cập nhật Avatar mới!', 'success');
        setAvatarConfirmVisible(false);
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
                                   <User size={48} color={profile.isVip ? '#fcd34d' : '#ffffff'} />
                               </View>
                               <TouchableOpacity onPress={() => setAvatarConfirmVisible(true)} style={[styles.editAvatarBtn, profile.isVip && { backgroundColor: '#fcd34d', borderColor: '#78350f' }]} activeOpacity={0.8}>
                                   <Edit2 size={16} color={profile.isVip ? '#78350f' : '#ffffff'} />
                               </TouchableOpacity>
                           </View>
                           <Text style={styles.userName}>{profile.name}</Text>
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
                                   <Text style={styles.headerUpgradeText}>Nâng Cấp VIP</Text>
                                   <ChevronRight size={16} color="#fff" />
                               </TouchableOpacity>
                           )}
                       </View>
                    </View>

                    {/* Stats */}
                    <View style={styles.statsContainer}>
                        <StatItem label="Sưu Tập" value={profile.collectionCount.toString()} icon={BookOpen} color="#3b82f6" />
                        <StatItem label="Dex" value={`${profile.pokedexProgress}%`} icon={Medal} color="#ef4444" />
                        <StatItem label="Hạng" value={profile.rank.replace('VIP ', '')} icon={Star} color="#f59e0b" />
                    </View>

                    {/* Menu */}
                    <View style={styles.menuContainer}>
                        <Text style={styles.menuTitle}>Cài Đặt</Text>
                        <MenuItem icon={Edit2} label="Sửa Hồ Sơ" color="#ef4444" onPress={() => setEditVisible(true)} />
                        <MenuItem icon={Award} label="Danh Hiệu" color="#f59e0b" onPress={() => showLocalToast('Đang phát triển', 'info')} />
                        <MenuItem icon={Settings} label="Hệ Thống" color="#64748b" onPress={() => showLocalToast('Đang phát triển', 'info')} />
                        <MenuItem icon={Bell} label="Thông Báo" color="#3b82f6" onPress={() => showLocalToast('Đang phát triển', 'info')} />
                        <MenuItem icon={Crown} label="Gói VIP" color="#8b5cf6" onPress={() => setVipVisible(true)} />
                        <MenuItem icon={Shield} label="Bảo Mật" color="#10b981" onPress={() => showLocalToast('Đang phát triển', 'info')} />
                        <MenuItem icon={HelpCircle} label="Hỗ Trợ" color="#64748b" onPress={() => showLocalToast('Đang phát triển', 'info')} />
                    </View>

                    <TouchableOpacity onPress={() => setLogoutConfirmVisible(true)} style={styles.logoutButton} activeOpacity={0.7}>
                        <LogOut size={20} color="#ef4444" />
                        <Text style={styles.logoutText}>Đăng Xuất</Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.versionText}>v3.1.0 (VIP Edition)</Text>
                </ScrollView>
            </SafeAreaView>

            {/* Modals */}
            <EditProfileModal visible={editVisible} onClose={() => setEditVisible(false)} initialProfile={profile} onSave={handleUpdateProfile} />
            <VipUpgradeModal visible={vipVisible} onClose={() => setVipVisible(false)} onUpgrade={handleUpgradeVip} />
            
            <ConfirmationModal 
                visible={logoutConfirmVisible} 
                title="Đăng Xuất" 
                message="Bạn có chắc chắn muốn rời khỏi Poké-Market?" 
                onConfirm={() => { setLogoutConfirmVisible(false); showLocalToast('Đăng xuất thành công', 'info'); }} 
                onCancel={() => setLogoutConfirmVisible(false)} 
                confirmText="Đăng Xuất" 
                type="danger" 
            />
             <ConfirmationModal 
                visible={avatarConfirmVisible} 
                title="Đổi Avatar" 
                message="Chọn avatar ngẫu nhiên mới?" 
                onConfirm={handleAvatarChange} 
                onCancel={() => setAvatarConfirmVisible(false)} 
                confirmText="Đổi Ngay" 
            />
            
            {/* Local Toast Render */}
            <LocalToast 
                visible={toast.visible} 
                message={toast.message} 
                type={toast.type} 
                onHide={() => setToast(prev => ({ ...prev, visible: false }))} 
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
    avatar: { width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#fff' },
    editAvatarBtn: { position: 'absolute', bottom: 0, right: 0, width: 34, height: 34, borderRadius: 17, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
    userName: { fontSize: 26, fontWeight: '900', color: '#fff' },
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
    statValue: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
    statLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '700' },
    
    menuContainer: { paddingHorizontal: 20, marginBottom: 20 },
    menuTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 12, marginLeft: 4 },
    menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, backgroundColor: '#fff', borderRadius: 16, marginBottom: 8, borderWidth: 1, borderColor: '#f1f5f9' },
    menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
    menuIconContainer: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    menuLabel: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
    
    logoutButton: { marginHorizontal: 20, padding: 16, backgroundColor: '#fef2f2', borderRadius: 16, borderWidth: 1, borderColor: '#fee2e2', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    logoutText: { color: '#ef4444', fontWeight: '800', fontSize: 15, marginLeft: 8 },
    versionText: { textAlign: 'center', color: '#cbd5e1', fontSize: 10, fontWeight: '700' },

    // Modal Common
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 24, padding: 20, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
    closeBtn: { padding: 4 },
    inputLabel: { fontSize: 13, fontWeight: '700', color: '#64748b', marginBottom: 6, marginTop: 12 },
    input: { backgroundColor: '#f8fafc', padding: 14, borderRadius: 12, fontSize: 15, color: '#0f172a', fontWeight: '600' },
    modalBtnSave: { backgroundColor: '#ef4444', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 24 },
    modalBtnTextSave: { color: '#fff', fontWeight: '800', fontSize: 16 },

    // Confirmation Modal
    confirmationContent: { backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center' },
    iconContainer: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    confirmTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a', marginBottom: 8 },
    confirmMessage: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
    confirmActions: { flexDirection: 'row', width: '100%' },
    confirmBtnCancel: { flex: 1, padding: 14, borderRadius: 14, backgroundColor: '#f1f5f9', alignItems: 'center', marginRight: 12 },
    confirmBtnAction: { flex: 1, padding: 14, borderRadius: 14, backgroundColor: '#3b82f6', alignItems: 'center' },
    confirmBtnTextCancel: { fontWeight: '700', color: '#64748b' },
    confirmBtnTextAction: { fontWeight: '700', color: '#fff' },

    // VIP Specific
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

    // Local Toast Styles
    toastContainer: {
        position: 'absolute', top: 60, left: 20, right: 20,
        backgroundColor: '#10b981', padding: 16, borderRadius: 16,
        flexDirection: 'row', alignItems: 'center',
        shadowColor: '#000', shadowOpacity: 0.15, shadowOffset: { width: 0, height: 8 }, shadowRadius: 10, elevation: 6,
        zIndex: 9999
    },
    toastText: { color: '#fff', fontSize: 14, fontWeight: '700', marginLeft: 12 },
});

