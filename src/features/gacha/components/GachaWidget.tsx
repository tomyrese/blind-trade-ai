import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal,
  Dimensions, Image, ScrollView,
} from 'react-native';
import { Gift, X, Sparkles, Check, RotateCcw, Coins } from 'lucide-react-native';

// Import Component & Data
import { mockCards, Card } from '../../../shared/utils/cardData';
import { useUserStore } from '../../../shared/stores/userStore';
import { useTranslation } from '../../../shared/utils/translations';
import { formatCurrency } from '../../../shared/utils/currency';
import { usePortfolioStore } from '../../../shared/stores/portfolioStore';
import Animated, { 
  FadeIn, 
  FadeOut, 
  ZoomIn, 
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const PRICE_1 = 200000;
const PRICE_10 = 1600000;

// --- 1. HÀM QUY ĐỔI MÀU (CHỈ 3 MÀU: VÀNG - TÍM - XANH) ---
const getTierColor = (rarity: string) => {
  const r = rarity.toLowerCase();
  if (['rare_secret', 'rare_rainbow', 'rare_holo_v', 'rare_holo_gx', 'rare_holo_ex', 'promo'].includes(r)) {
    return '#FFD700'; // GOLD
  }
  if (['rare', 'rare_holo'].includes(r)) {
    return '#C084FC'; // PURPLE
  }
  return '#3B82F6'; // BLUE
};

// --- 2. COMPONENT THẺ BÀI CON (PUBG Style 3D Flip) ---
const GachaCardItem = ({ item, index, revealed, onFlip, sizeMode }: {
    item: Card, index: number, revealed: boolean, onFlip: () => void, sizeMode: 'big' | 'small'
}) => {
    const tierColor = getTierColor(item.rarity);
    const isGoldTier = tierColor === '#FFD700';
    
    const entryDelay = index * 100;
    const rotate = useSharedValue(0);

    useEffect(() => {
        if (revealed) {
            rotate.value = withTiming(180, { duration: 600 });
        } else {
            rotate.value = 0;
        }
    }, [revealed]);

    const frontAnimatedStyle = useAnimatedStyle(() => {
        const spin = interpolate(rotate.value, [0, 180], [180, 360]);
        return {
            transform: [{ perspective: 1000 }, { rotateY: `${spin}deg` }],
        };
    });

    const backAnimatedStyle = useAnimatedStyle(() => {
        const spin = interpolate(rotate.value, [0, 180], [0, 180]);
        return {
            transform: [{ perspective: 1000 }, { rotateY: `${spin}deg` }],
        };
    });

    return (
        <Animated.View 
            entering={FadeInDown.delay(entryDelay).duration(500)}
            style={sizeMode === 'big' ? styles.bigCardSpace : styles.cardSpace2Col}
        >
            <TouchableOpacity activeOpacity={0.9} onPress={onFlip} style={{ flex: 1 }}>
                <View style={[
                  styles.cardBaseContainer,
                  {
                    borderColor: revealed ? tierColor : '#334155',
                    borderWidth: isGoldTier && revealed ? 4 : 2,
                  }
                ]}>
                    <Animated.View style={[styles.cardFace, styles.cardFront, frontAnimatedStyle]}>
                        <Image source={item.image} style={styles.cardImg} resizeMode="cover" />
                        <View style={[
                            styles.glowBehind,
                            { backgroundColor: tierColor, opacity: 0.35 }
                        ]} />
                        <View style={styles.cardOverlay}>
                            <Text style={[styles.cardNameText, { color: tierColor }]}>{item.name}</Text>
                        </View>
                    </Animated.View>

                    <Animated.View style={[styles.cardFace, styles.cardBack, backAnimatedStyle]}>
                        <Sparkles color={tierColor} size={28} opacity={0.4} />
                        <Text style={styles.rarityHintText}>{item.rarity.replace(/_/g, ' ').toUpperCase()}</Text>
                    </Animated.View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

// --- 3. WIDGET CHÍNH ---
const GachaWidget = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [phase, setPhase] = useState<'IDLE' | 'RESULT'>('IDLE');

  const [currentViewCards, setCurrentViewCards] = useState<Card[]>([]);
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const [isRollMulti, setIsRollMulti] = useState(false);
  const [showInsufficentUI, setShowInsufficentUI] = useState(false);

  const spend = useUserStore(state => state.spend);
  const userBalance = useUserStore(state => state.profile?.balance || 0);
  const userCurrency = useUserStore(state => state.profile?.currency || 'VND');
  const addItems = usePortfolioStore(state => state.addItems);
  const { t } = useTranslation();

  const isAllRevealed = revealed.length > 0 && revealed.every(v => v);

  const generateRandomCards = (count: number): any[] => {
      const results: any[] = [];
      for(let i=0; i<count; i++) {
          const rand = Math.random();
          let pool: Card[] = [];

          if (rand < 0.05) { 
             pool = mockCards.filter(c => ['rare_secret', 'rare_rainbow', 'rare_holo_v'].includes(c.rarity));
          } else if (rand < 0.30) { 
             pool = mockCards.filter(c => ['rare_holo', 'rare'].includes(c.rarity));
          } else { 
             pool = mockCards.filter(c => ['common', 'uncommon'].includes(c.rarity));
          }

          if (pool.length === 0) pool = mockCards;

          const baseCard = pool[Math.floor(Math.random() * pool.length)];
          // Quan trọng: Lưu baseId để làm symbol chính xác
          results.push({ 
            ...baseCard, 
            id: `${baseCard.id}-${Date.now()}-${i}`,
            baseId: baseCard.id 
          });
      }
      return results;
  };

  const startSummon = (isMulti: boolean) => {
    const cost = isMulti ? PRICE_10 : PRICE_1;
    const isSuccess = spend(cost);

    if (!isSuccess) {
      setShowInsufficentUI(true);
      return;
    }

    setIsRollMulti(isMulti);
    const count = isMulti ? 10 : 1;
    const newResults = generateRandomCards(count);

    // Sync to Inventory correctly
    const assetsToAdd = newResults.map(card => ({
      id: card.id,
      name: card.name,
      // Đảm bảo symbol khớp với portfolioStore (PKM-ID)
      symbol: card.symbol || `PKM-${card.baseId.padStart(3, '0')}`,
      rarity: card.rarity,
      amount: 1,
      value: card.value,
      purchasePrice: card.value,
      image: card.image,
    }));
    addItems(assetsToAdd);

    setCurrentViewCards(newResults);
    setRevealed(new Array(count).fill(false));
    setPhase('RESULT'); 
  };

  const resetGacha = () => {
    setPhase('IDLE');
    setCurrentViewCards([]);
    setRevealed([]);
  };

  const closeGacha = () => {
    resetGacha();
    setModalVisible(false);
  };

  const flipCard = (idx: number) => {
    if (revealed[idx]) return;
    const nextStates = [...revealed];
    nextStates[idx] = true;
    setRevealed(nextStates);
  };

  const openAllCurrent = () => setRevealed(new Array(currentViewCards.length).fill(true));

  return (
    <>
      <TouchableOpacity style={styles.floatingTrigger} onPress={() => setModalVisible(true)}>
        <Gift color="white" size={32} />
        <Text style={styles.triggerText}>GACHA</Text>
      </TouchableOpacity>

      <Modal transparent visible={modalVisible} animationType="fade" onRequestClose={resetGacha}>

        {phase === 'IDLE' && (
          <View style={styles.menuOverlay}>
            <Animated.View entering={ZoomIn.duration(600)} style={styles.menuContainer}>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}><X color="#333" /></TouchableOpacity>
              <Text style={styles.menuTitle}>{t('gacha_title')}</Text>

              <View style={styles.balanceTag}>
                 <Sparkles color="#eab308" size={20} />
                 <Text style={styles.balanceAmt}>{formatCurrency(userBalance, userCurrency)}</Text>
              </View>

              <View style={styles.priceSection}>
                <TouchableOpacity style={styles.priceRow} onPress={() => startSummon(false)}>
                   <View style={styles.sumBtn}>
                      <Text style={styles.btnTitle}>{t('gacha_roll_x1')}</Text>
                      <Text style={styles.btnPrice}>{formatCurrency(PRICE_1, userCurrency)}</Text>
                   </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.priceRow} onPress={() => startSummon(true)}>
                   <View style={styles.sumBtn}>
                      <Text style={styles.btnTitle}>{t('gacha_roll_x10')}</Text>
                      <Text style={styles.btnPrice}>{formatCurrency(PRICE_10, userCurrency)}</Text>
                   </View>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        )}

        {phase === 'RESULT' && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.resultContainer}>
            <View style={styles.headerResult}>
              <Text style={styles.headerTitle}>{t('gacha_result_title')}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
              {isRollMulti ? (
                <View style={styles.columnsContainer}>
                  <View style={styles.column}>
                    {currentViewCards.slice(0, 5).map((card, idx) => (
                      <GachaCardItem
                        key={card.id}
                        item={card}
                        index={idx}
                        revealed={revealed[idx]}
                        onFlip={() => flipCard(idx)}
                        sizeMode="small"
                      />
                    ))}
                  </View>
                  <View style={styles.column}>
                    {currentViewCards.slice(5, 10).map((card, idx) => (
                      <GachaCardItem
                        key={card.id}
                        item={card}
                        index={idx + 5}
                        revealed={revealed[idx + 5]}
                        onFlip={() => flipCard(idx + 5)}
                        sizeMode="small"
                      />
                    ))}
                  </View>
                </View>
              ) : (
                <View style={styles.singleCardContainer}>
                  <GachaCardItem
                    item={currentViewCards[0]}
                    index={0}
                    revealed={revealed[0]}
                    onFlip={() => flipCard(0)}
                    sizeMode="big"
                  />
                </View>
              )}
              <View style={{ height: 150 }} />
            </ScrollView>

            <Animated.View entering={FadeIn.delay(200)} style={styles.footer}>
              {isAllRevealed ? (
                <TouchableOpacity style={[styles.footerBtn, { backgroundColor: '#3b82f6' }]} onPress={closeGacha}>
                  <X color="white" size={20} style={{ marginRight: 8 }} />
                  <Text style={[styles.footerBtnText, { color: 'white' }]}>{t('close')}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.footerBtn} onPress={openAllCurrent}>
                  <Sparkles color="#111" size={20} style={{ marginRight: 8 }} />
                  <Text style={styles.footerBtnText}>{t('gacha_flip_all') || 'REVEAL ALL'}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={[styles.footerBtn, { marginTop: 12, backgroundColor: '#334155' }]} onPress={() => startSummon(isRollMulti)}>
                <RotateCcw color="white" size={20} style={{ marginRight: 8 }} />
                <Text style={[styles.footerBtnText, { color: 'white' }]}>{t('gacha_roll_again')}</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        )}

        <Modal transparent visible={showInsufficentUI} animationType="fade">
           <View style={styles.balanceOverlay}>
              <Animated.View entering={ZoomIn.springify()} style={styles.balanceCard}>
                 <View style={styles.balanceIconBg}>
                    <Coins color="#eab308" size={60} />
                 </View>
                 <Text style={styles.balanceTitle}>{t('gacha_insufficient_balance')}</Text>
                 <Text style={styles.balanceDesc}>{t('gacha_topup_hint') || 'Please top up your balance to continue summon.'}</Text>
                 
                 <TouchableOpacity 
                    style={styles.balanceCloseBtn} 
                    onPress={() => setShowInsufficentUI(false)}
                 >
                    <Text style={styles.balanceCloseText}>{t('close')}</Text>
                 </TouchableOpacity>
              </Animated.View>
           </View>
        </Modal>
      </Modal>
    </>
  );
};

export default GachaWidget;

const styles = StyleSheet.create({
  floatingTrigger: { position: 'absolute', right: 20, bottom: 40, backgroundColor: '#ef4444', width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', elevation: 8, zIndex: 9999, borderWidth: 3, borderColor: 'white' },
  triggerText: { color: 'white', fontSize: 10, fontWeight: 'bold', marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  menuContainer: { width: '90%', backgroundColor: 'white', borderRadius: 24, padding: 25, alignItems: 'center' },
  closeBtn: { alignSelf: 'flex-end', padding: 5 },
  menuTitle: { fontSize: 24, fontWeight: '900', marginBottom: 15, color: '#111' },
  balanceTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginBottom: 20 },
  balanceAmt: { fontSize: 18, fontWeight: 'bold', marginLeft: 6, color: '#111' },

  priceSection: { width: '100%', gap: 12 },
  priceRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fafafa', borderRadius: 20, borderWidth: 1, borderColor: '#eee' },
  sumBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingHorizontal: 25 },
  btnTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  btnPrice: { fontSize: 18, fontWeight: '900', color: '#ef4444' },

  resultContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.98)', paddingTop: 60 },
  headerResult: { paddingHorizontal: 25, marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: 'white', letterSpacing: 2 },
  
  scrollContainer: { paddingHorizontal: 20, alignItems: 'center' },
  singleCardContainer: { paddingTop: 40 },
  columnsContainer: { flexDirection: 'row', justifyContent: 'center', gap: 15, paddingBottom: 20 },
  column: { flexDirection: 'column', gap: 15 },
  cardSpace2Col: { width: width * 0.40, aspectRatio: 0.72 },
  bigCardSpace: { width: width * 0.6, aspectRatio: 0.72 },

  glowBehind: { position: 'absolute', width: '100%', height: '100%', borderRadius: 12 },
  cardBaseContainer: { flex: 1, backgroundColor: '#1e293b', borderRadius: 12, overflow: 'hidden' },
  cardFace: { ...StyleSheet.absoluteFillObject, borderRadius: 12, backfaceVisibility: 'hidden', justifyContent: 'center', alignItems: 'center' },
  cardFront: { backgroundColor: '#0f172a' },
  cardBack: { backgroundColor: '#1e293b' },
  cardImg: { width: '100%', height: '100%' },
  cardOverlay: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'rgba(0,0,0,0.7)', padding: 8, alignItems: 'center' },
  cardNameText: { fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
  
  rarityHintText: { color: 'white', fontSize: 10, fontWeight: 'bold', position: 'absolute', bottom: 10, opacity: 0.6 },

  footer: { position: 'absolute', bottom: 40, width: '100%', alignItems: 'center' },
  footerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 30, elevation: 4, minWidth: 220 },
  footerBtnText: { fontSize: 16, fontWeight: '900', color: '#111', letterSpacing: 1 },

  balanceOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  balanceCard: { width: '90%', backgroundColor: '#1e293b', borderRadius: 32, padding: 30, alignItems: 'center', borderWidth: 2, borderColor: '#334155' },
  balanceIconBg: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(234,179,8,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  balanceTitle: { color: 'white', fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 12 },
  balanceDesc: { color: '#94a3b8', fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 30 },
  balanceCloseBtn: { width: '100%', backgroundColor: '#eab308', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  balanceCloseText: { color: 'black', fontSize: 18, fontWeight: '900', textTransform: 'uppercase' },
});