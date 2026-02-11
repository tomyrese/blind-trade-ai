import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ShoppingBag, Calendar, Clock, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTransactionHistoryStore, Transaction } from '../../shared/stores/transactionHistoryStore';
import { useUserStore } from '../../shared/stores/userStore';
import { formatCurrency } from '../../shared/utils/currency';
import { useTranslation } from '../../shared/utils/translations';

export const PurchaseHistoryScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const { t } = useTranslation();
    const transactions = useTransactionHistoryStore((state) => state.transactions);
    const currency = useUserStore((state) => state.profile?.currency || 'VND');
    
    // Sort by date desc
    const sortedTransactions = useMemo(() => {
        return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions]);

    const renderItem = ({ item }: { item: Transaction }) => {
        const date = new Date(item.date);
        const dateString = date.toLocaleDateString('vi-VN');
        const timeString = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

        return (
            <TouchableOpacity 
                style={styles.card}
                onPress={() => navigation.navigate('TransactionDetail', { transactionId: item.id })}
                activeOpacity={0.7}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.typeContainer}>
                        <View style={[styles.iconBox, item.type === 'buy' ? { backgroundColor: '#eff6ff' } : { backgroundColor: '#f0fdf4' }]}>
                            {item.type === 'buy' ? <ArrowDownLeft size={20} color="#3b82f6" /> : <ArrowUpRight size={20} color="#16a34a" />}
                        </View>
                        <View>
                            <Text style={styles.typeName}>{item.type === 'buy' ? t('purchase_success') || 'Mua hàng' : t('deposit_success') || 'Nạp tiền'}</Text>
                            <Text style={styles.dateText}>{dateString} • {timeString}</Text>
                        </View>
                    </View>
                    <Text style={[styles.amount, item.type === 'buy' ? { color: '#ef4444' } : { color: '#16a34a' }]}>
                        {item.type === 'buy' ? '-' : '+'}{formatCurrency(item.amount, item.currency as 'VND' | 'USD')}
                    </Text>
                </View>
                
                {item.items && item.items.length > 0 && (
                    <View style={styles.itemsContainer}>
                        {item.items.map((prod, idx) => (
                            <View key={idx} style={styles.productRow}>
                                {prod.image ? (
                                    <Image 
                                        source={typeof prod.image === 'string' ? { uri: prod.image } : prod.image} 
                                        style={styles.prodImage} 
                                        resizeMode="contain" 
                                    />
                                ) : (
                                    <View style={styles.prodPlaceholder}><Text style={styles.placeholderText}>{prod.name.charAt(0)}</Text></View>
                                )}
                                <View style={{flex: 1}}>
                                    <Text style={styles.prodName} numberOfLines={1}>{prod.name}</Text>
                                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                        <Text style={styles.prodQty}>x{prod.quantity}</Text>
                                        <Text style={styles.prodPrice}>{formatCurrency(prod.price, item.currency as 'VND' | 'USD')}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
                
                <View style={styles.footer}>
                   <Text style={[styles.status, item.status === 'success' ? { color: '#16a34a' } : { color: '#ef4444' }]}>
                       {item.status === 'success' ? (t('success') || 'Thành công') : (t('failed' as any) || 'Thất bại')}
                   </Text>
                   <Text style={styles.transId}>ID: {item.id.slice(0, 8)}...</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView edges={['top']} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('purchase_history' as any) || 'Lịch sử giao dịch'}</Text>
                <View style={{width: 40}} />
            </View>

            <FlatList
                data={sortedTransactions}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIcon}><ShoppingBag size={48} color="#cbd5e1" /></View>
                        <Text style={styles.emptyTitle}>{t('no_results_found')}</Text>
                        <Text style={styles.emptyDesc}>Bạn chưa thực hiện giao dịch nào.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
    listContent: { padding: 20, paddingBottom: 40 },
    card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    typeContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    typeName: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
    dateText: { fontSize: 12, color: '#64748b', marginTop: 2 },
    amount: { fontSize: 16, fontWeight: '800' },
    itemsContainer: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, marginBottom: 16 },
    productRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    prodImage: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#fff' },
    prodPlaceholder: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
    placeholderText: { fontSize: 16, fontWeight: '700', color: '#64748b' },
    prodName: { fontSize: 14, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
    prodQty: { fontSize: 12, color: '#64748b' },
    prodPrice: { fontSize: 12, fontWeight: '700', color: '#0f172a' },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    status: { fontSize: 13, fontWeight: '700' },
    transId: { fontSize: 12, color: '#94a3b8' },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
    emptyIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 8 },
    emptyDesc: { fontSize: 14, color: '#64748b', textAlign: 'center' },
});
