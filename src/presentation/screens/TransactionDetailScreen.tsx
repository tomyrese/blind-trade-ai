import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    ChevronLeft, 
    Calendar, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    AlertCircle, 
    ArrowUpRight, 
    ArrowDownLeft, 
    Receipt, 
    Download, 
    Share2, 
    Package,
    ShieldCheck
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTransactionHistoryStore } from '../../shared/stores/transactionHistoryStore';
import { formatCurrency } from '../../shared/utils/currency';
import { useTranslation } from '../../shared/utils/translations';

export const TransactionDetailScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { t } = useTranslation();
    const { transactionId } = route.params;
    
    const transactions = useTransactionHistoryStore((state) => state.transactions);
    const transaction = transactions.find(t => t.id === transactionId);

    if (!transaction) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <AlertCircle size={48} color="#ef4444" />
                    <Text style={styles.errorText}>Giao dịch không tồn tại</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnError}>
                        <Text style={styles.backBtnText}>Quay lại</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const date = new Date(transaction.date);
    const dateString = date.toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' });
    const timeString = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const isBuy = transaction.type === 'buy';
    const isDeposit = transaction.type === 'deposit';
    
    const handleShare = async () => {
        try {
            await Share.share({
                message: `Hóa đơn giao dịch Poké-Market\nMã: ${transaction.id}\nSố tiền: ${formatCurrency(transaction.amount, transaction.currency as any)}\nNgày: ${dateString}`,
            });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <SafeAreaView edges={['top']} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <ChevronLeft size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('transaction_details' as any) || 'Chi tiết giao dịch'}</Text>
                <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
                    <Share2 size={20} color="#0f172a" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Status Card */}
                <View style={styles.statusCard}>
                    <View style={[styles.statusIconBox, transaction.status === 'success' ? { backgroundColor: '#f0fdf4' } : { backgroundColor: '#fef2f2' }]}>
                        {transaction.status === 'success' ? (
                            <CheckCircle2 size={40} color="#10b981" />
                        ) : (
                            <XCircle size={40} color="#ef4444" />
                        )}
                    </View>
                    <Text style={styles.amountText}>
                        {isBuy ? '-' : '+'}{formatCurrency(transaction.amount, transaction.currency as any)}
                    </Text>
                    <Text style={[styles.statusText, transaction.status === 'success' ? { color: '#10b981' } : { color: '#ef4444' }]}>
                        {transaction.status === 'success' ? 'Giao dịch thành công' : 'Giao dịch thất bại'}
                    </Text>
                    <Text style={styles.idLabel}>ID: {transaction.id}</Text>
                </View>

                {/* Info Section */}
                <View style={styles.section}>
                    <View style={styles.infoRow}>
                        <View style={styles.infoIconBox}><Calendar size={18} color="#64748b" /></View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>{t('transaction_date' as any) || 'Ngày giao dịch'}</Text>
                            <Text style={styles.infoValue}>{dateString}</Text>
                        </View>
                        <View style={styles.infoContentRight}>
                            <Text style={styles.infoLabel}>{t('time' as any) || 'Giờ'}</Text>
                            <Text style={styles.infoValue}>{timeString}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <View style={styles.infoIconBox}><Receipt size={18} color="#64748b" /></View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>{t('transaction_type' as any) || 'Loại giao dịch'}</Text>
                            <Text style={styles.infoValue}>
                                {isBuy ? 'Mua thẻ Pokémon' : isDeposit ? 'Nạp tiền vào tài khoản' : 'Giao dịch khác'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Items Section */}
                {transaction.items && transaction.items.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Package size={18} color="#0f172a" />
                            <Text style={styles.sectionTitle}>
                                {t('items_count' as any) || 'Danh sách vật phẩm'} ({transaction.items.length})
                            </Text>
                        </View>
                        
                        {transaction.items.map((item, idx) => (
                            <TouchableOpacity 
                                key={idx} 
                                style={styles.itemRow}
                                onPress={() => {
                                    // Extract symbol if available or use ID
                                    const symbol = (item as any).symbol || item.id;
                                    navigation.navigate('CardDetail', { symbol });
                                }}
                            >
                                <View style={styles.itemImageContainer}>
                                    {item.image ? (
                                        <Image source={item.image} style={styles.itemImage} resizeMode="contain" />
                                    ) : (
                                        <View style={styles.itemPlaceholder}><Text style={styles.placeholderChar}>{item.name.charAt(0)}</Text></View>
                                    )}
                                </View>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                                    <Text style={styles.itemQty}>x{item.quantity}</Text>
                                </View>
                                <Text style={styles.itemPrice}>{formatCurrency(item.price * item.quantity, transaction.currency as any)}</Text>
                            </TouchableOpacity>
                        ))}

                        <View style={styles.priceBreakdown}>
                            <View style={styles.breakdownRow}>
                                <Text style={styles.breakdownLabel}>{t('subtotal') || 'Tạm tính'}</Text>
                                <Text style={styles.breakdownValue}>{formatCurrency(transaction.amount * 0.9, transaction.currency as any)}</Text>
                            </View>
                            <View style={styles.breakdownRow}>
                                <Text style={styles.breakdownLabel}>{t('tax') || 'Thuế VAT (10%)'}</Text>
                                <Text style={styles.breakdownValue}>{formatCurrency(transaction.amount * 0.1, transaction.currency as any)}</Text>
                            </View>
                            <View style={[styles.breakdownRow, { marginTop: 8 }]}>
                                <Text style={styles.totalLabel}>{t('total') || 'Tổng số tiền'}</Text>
                                <Text style={styles.totalValue}>{formatCurrency(transaction.amount, transaction.currency as any)}</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Security Box */}
                <View style={styles.securityBox}>
                    <ShieldCheck size={20} color="#16a34a" />
                    <Text style={styles.securityText}>
                        Giao dịch này được bảo mật bởi hệ thống Poké-Shield™
                    </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.downloadBtn} activeOpacity={0.8}>
                        <Download size={20} color="#ffffff" />
                        <Text style={styles.downloadBtnText}>Tải hóa đơn (PDF)</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.helpBtn} 
                        onPress={() => navigation.navigate('MainTabs', { screen: 'AIChat' })}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.helpBtnText}>Cần hỗ trợ về giao dịch này?</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
    scrollContent: { padding: 20, paddingBottom: 40 },
    
    statusCard: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        marginBottom: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05, shadowRadius: 12,
    },
    statusIconBox: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    amountText: { fontSize: 32, fontWeight: '900', color: '#0f172a', marginBottom: 8 },
    statusText: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
    idLabel: { fontSize: 13, color: '#94a3b8', fontWeight: '500' },
    
    section: { backgroundColor: '#ffffff', borderRadius: 20, padding: 20, marginBottom: 20 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
    
    infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
    infoIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    infoContent: { flex: 1 },
    infoContentRight: { alignItems: 'flex-end' },
    infoLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '600', marginBottom: 2 },
    infoValue: { fontSize: 15, color: '#1e293b', fontWeight: '700' },
    divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 10 },
    
    itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    itemImageContainer: { width: 48, height: 68, borderRadius: 8, backgroundColor: '#f1f5f9', marginRight: 12, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    itemImage: { width: '100%', height: '100%' },
    itemPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e2e8f0' },
    placeholderChar: { fontSize: 20, fontWeight: '800', color: '#94a3b8' },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 2 },
    itemQty: { fontSize: 13, color: '#64748b', fontWeight: '600' },
    itemPrice: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
    
    priceBreakdown: { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#f1f5f9', borderStyle: 'dashed' },
    breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    breakdownLabel: { fontSize: 14, color: '#64748b', fontWeight: '600' },
    breakdownValue: { fontSize: 14, color: '#1e293b', fontWeight: '700' },
    totalLabel: { fontSize: 16, color: '#0f172a', fontWeight: '900' },
    totalValue: { fontSize: 20, color: '#ef4444', fontWeight: '900' },
    
    securityBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#f0fdf4', padding: 16, borderRadius: 16, marginBottom: 30 },
    securityText: { fontSize: 13, color: '#166534', fontWeight: '600', textAlign: 'center' },
    
    actions: { gap: 12 },
    downloadBtn: { backgroundColor: '#0f172a', height: 60, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    downloadBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
    helpBtn: { height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    helpBtnText: { color: '#3b82f6', fontSize: 14, fontWeight: '700' },
    
    errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
    errorText: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginTop: 16, marginBottom: 24 },
    backBtnError: { backgroundColor: '#0f172a', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 12 },
    backBtnText: { color: '#ffffff', fontWeight: '700' },
});
