import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal,
  Dimensions, Image, ScrollView, TouchableWithoutFeedback, Alert, Animated
} from 'react-native';
import { Gift, X, Sparkles, Check, RotateCcw } from 'lucide-react-native';

// Import Component & Data
import { GachaLootbox } from './GachaLootbox';
import { mockCards, Card, RARITY_RANKS } from '../../../shared/utils/cardData';
import { useUserStore } from '../../../shared/stores/userStore';

const { width, height } = Dimensions.get('window');

const PRICE_1 = 200000;
const PRICE_10 = 1600000;

// --- 1. HÀM QUY ĐỔI MÀU (CHỈ 3 MÀU: VÀNG - TÍM - XANH) ---
const getTierColor = (rarity: string) => {
  const r = rarity.toLowerCase();

  // Nhóm VÀNG: Các thẻ Siêu Hiếm (Secret, Rainbow, V, GX, EX...)
  if (['rare_secret', 'rare_rainbow', 'rare_holo_v', 'rare_holo_gx', 'rare_holo_ex', 'promo'].includes(r)) {
    return '#FFD700'; // Vàng chóe
  }

  // Nhóm TÍM: Các thẻ Hiếm (Rare, Holo)
  if (['rare', 'rare_holo'].includes(r)) {
    return '#C084FC'; // Tím mộng mơ
  }

  // Nhóm XANH: Còn lại (Common, Uncommon)
  return '#3B82F6'; // Xanh dương
};

// --- 2. COMPONENT THẺ BÀI CON (Xử lý hiệu ứng lật & Flash) ---
const GachaCardItem = ({ item, index, revealed, onFlip, sizeMode }: {
    item: Card, index: number, revealed: boolean, onFlip: () => void, sizeMode: 'big' | 'small'
}) => {
    // Animation Values
    const flashAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    // Lấy màu theo 3 hệ (Vàng/Tím/Xanh)
    const tierColor = getTierColor(item.rarity);

    // Kiểm tra xem có phải hàng "VÀNG" không để nổ hiệu ứng Flash
    const isGoldTier = tierColor === '#FFD700';

    useEffect(() => {
        if (revealed) {
            // Hiệu ứng nảy thẻ
            Animated.sequence([
                Animated.timing(scaleAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
                Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true })
            ]).start();

            // CHỈ THẺ VÀNG MỚI CÓ HIỆU ỨNG "VÀNG CHÓE" (FLASH)
            if (isGoldTier) {
                flashAnim.setValue(0);
                Animated.sequence([
                    Animated.timing(flashAnim, { toValue: 1, duration: 100, useNativeDriver: true }), // Bùng sáng
                    Animated.timing(flashAnim, { toValue: 0, duration: 1000, useNativeDriver: true })  // Tắt từ từ
                ]).start();
            }
        }
    }, [revealed]);

    const containerStyle = sizeMode === 'big' ? styles.bigCardSpace : styles.cardSpace2Col;

    return (
        <TouchableOpacity activeOpacity={0.9} onPress={onFlip} style={containerStyle}>
            <Animated.View style={{ flex: 1, transform: [{ scale: scaleAnim }] }}>
                {/* Glow nền (Mạnh hơn nếu là thẻ Vàng) */}
                <View style={[
                    styles.glowBehind,
                    {
                        backgroundColor: tierColor,
                        opacity: revealed ? (isGoldTier ? 0.9 : 0.6) : 0,
                        elevation: isGoldTier ? 20 : 10
                    }
                ]} />

                <View style={[
                    styles.cardBase,
                    {
                        borderColor: revealed ? tierColor : '#444',
                        borderWidth: isGoldTier && revealed ? 3 : 2
                    }
                ]}>
                    {revealed ? (
                        <>
                            <Image source={item.image} style={styles.cardImg} resizeMode="cover" />

                            {/* LỚP FLASH VÀNG CHÓE (Chỉ hiện khi FlashAnim > 0) */}
                            <Animated.View
                                style={[
                                    StyleSheet.absoluteFill,
                                    {
                                        backgroundColor: '#FFF7CC', // Màu trắng vàng nhạt
                                        opacity: flashAnim,
                                        zIndex: 99
                                    }
                                ]}
                                pointerEvents="none"
                            />
                        </>
                    ) : (
                        <View style={styles.cardBack}>
                            <Sparkles color="#666" size={sizeMode === 'big' ? 40 : 28} />
                        </View>
                    )}
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
};

// --- 3. WIDGET CHÍNH ---
const GachaWidget = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [phase, setPhase] = useState<'IDLE' | 'ANIMATING' | 'RESULT'>('IDLE');

  const [currentViewCards, setCurrentViewCards] = useState<Card[]>([]);
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const [bestReward, setBestReward] = useState<Card | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isRollMulti, setIsRollMulti] = useState(false);

  const spend = useUserStore(state => state.spend);
  const userBalance = useUserStore(state => state.profile?.balance || 0);

  const generateRandomCards = (count: number): Card[] => {
      const results: Card[] = [];
      for(let i=0; i<count; i++) {
          const rand = Math.random();
          let pool: Card[] = [];

          if (rand < 0.05) { // 5% ra Vàng
             pool = mockCards.filter(c => ['rare_secret', 'rare_rainbow', 'rare_holo_v'].includes(c.rarity));
          } else if (rand < 0.30) { // 25% ra Tím
             pool = mockCards.filter(c => ['rare_holo', 'rare'].includes(c.rarity));
          } else { // 70% ra Xanh
             pool = mockCards.filter(c => ['common', 'uncommon'].includes(c.rarity));
          }

          // Fallback nếu pool rỗng
          if (pool.length === 0) pool = mockCards;

          const randomCard = pool[Math.floor(Math.random() * pool.length)];
          results.push({ ...randomCard, id: `${randomCard.id}-${Date.now()}-${i}` });
      }
      return results;
  };

  const startSummon = (isMulti: boolean) => {
    const cost = isMulti ? PRICE_10 : PRICE_1;
    const isSuccess = spend(cost);

    if (!isSuccess) {
      Alert.alert("Thông báo", "Số dư không đủ để thực hiện quay.");
      return;
    }

    setIsRollMulti(isMulti);
    const count = isMulti ? 10 : 1;
    const newResults = generateRandomCards(count);

    // Tìm thẻ xịn nhất để rương 3D hiện màu đó (Vàng/Tím/Xanh)
    const best = newResults.reduce((prev, current) => {
      const rankPrev = RARITY_RANKS[prev.rarity] || 0;
      const rankCurr = RARITY_RANKS[current.rarity] || 0;
      return rankCurr > rankPrev ? current : prev;
    });
    setBestReward(best);

    setCurrentViewCards(newResults);
    setRevealed(new Array(count).fill(false));
    setPhase('ANIMATING');
  };

  const onChestClose = () => {
    setPhase('RESULT');
  };

  const flipCard = (index: number) => {
    if (!revealed[index]) {
      const newRevealed = [...revealed];
      newRevealed[index] = true;
      setRevealed(newRevealed);
    } else {
      setSelectedCard(currentViewCards[index]);
    }
  };

  const openAllCurrent = () => setRevealed(new Array(currentViewCards.length).fill(true));

  const resetGacha = () => {
    setModalVisible(false);
    setPhase('IDLE');
    setCurrentViewCards([]);
    setBestReward(null);
    setSelectedCard(null);
  };

  return (
    <>
      {!modalVisible && (
        <TouchableOpacity style={styles.floatingTrigger} onPress={() => setModalVisible(true)}>
          <Gift color="white" size={28} />
          <Text style={styles.triggerText}>GACHA</Text>
        </TouchableOpacity>
      )}

      <Modal transparent visible={modalVisible} animationType="fade" onRequestClose={resetGacha}>

        {phase === 'IDLE' && (
          <View style={styles.modalOverlay}>
            <View style={styles.menuContainer}>
              <TouchableOpacity style={styles.closeBtn} onPress={resetGacha}><X color="#333" /></TouchableOpacity>
              <Text style={styles.menuTitle}>VÒNG QUAY THẦN THÚ</Text>

              <View style={styles.balanceTag}>
                 <Text style={styles.balanceLabel}>Số dư:</Text>
                 <Text style={styles.balanceValue}>{userBalance.toLocaleString('vi-VN')} VND</Text>
              </View>

              <View style={styles.btnRow}>
                <TouchableOpacity style={[styles.summonBtn, {backgroundColor: '#3b82f6'}]} onPress={() => startSummon(false)}>
                   <Text style={styles.btnTitle}>ROLL x1</Text>
                   <Text style={styles.btnPrice}>{PRICE_1.toLocaleString('vi-VN')} VND</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.summonBtn, {backgroundColor: '#eab308'}]} onPress={() => startSummon(true)}>
                   <View style={styles.tagDiscount}><Text style={styles.tagText}>HOT</Text></View>
                   <Text style={styles.btnTitle}>ROLL x10</Text>
                   <Text style={styles.btnPrice}>{PRICE_10.toLocaleString('vi-VN')} VND</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {phase === 'ANIMATING' && bestReward && (
          <GachaLootbox
            isOpen={true}
            reward={bestReward}
            onClose={onChestClose}
            currency="VND"
            // Truyền thẳng màu Vàng/Tím/Xanh vào rương 3D để nó đổi màu theo
            highestSelectedRarity={bestReward.rarity}
          />
        )}

        {phase === 'RESULT' && (
          <View style={styles.resultContainer}>
            <View style={styles.headerResult}>
               <Text style={styles.headerTitle}>
                 {isRollMulti ? 'KẾT QUẢ (10 THẺ)' : 'THẺ BÀI NHẬN ĐƯỢC'}
               </Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
              {!isRollMulti ? (
                 /* ROLL 1 */
                 <View style={styles.singleCardContainer}>
                    {currentViewCards.map((item, index) => (
                        <GachaCardItem
                            key={item.id} item={item} index={index}
                            revealed={revealed[index]} onFlip={() => flipCard(index)}
                            sizeMode="big"
                        />
                    ))}
                 </View>
              ) : (
                /* ROLL 10 - 2 CỘT DỌC */
                <View style={styles.columnsContainer}>
                  <View style={styles.column}>
                    {currentViewCards.slice(0, 5).map((item, i) => (
                        <GachaCardItem
                            key={item.id} item={item} index={i}
                            revealed={revealed[i]} onFlip={() => flipCard(i)}
                            sizeMode="small"
                        />
                    ))}
                  </View>
                  <View style={styles.column}>
                    {currentViewCards.slice(5, 10).map((item, i) => (
                        <GachaCardItem
                            key={item.id} item={item} index={i + 5}
                            revealed={revealed[i + 5]} onFlip={() => flipCard(i + 5)}
                            sizeMode="small"
                        />
                    ))}
                  </View>
                </View>
              )}
              <View style={{height: 100}} />
            </ScrollView>

            <View style={styles.footer}>
              {!revealed.every(v => v) ? (
                <TouchableOpacity style={styles.footerBtn} onPress={openAllCurrent}>
                  <Text style={styles.footerBtnText}>LẬT TẤT CẢ</Text>
                </TouchableOpacity>
              ) : (
                <View style={{flexDirection: 'row', gap: 15}}>
                    <TouchableOpacity style={[styles.footerBtn, {backgroundColor: '#3b82f6', paddingHorizontal: 30}]} onPress={resetGacha}>
                        <Check color="white" size={20} strokeWidth={3}/>
                        <Text style={[styles.footerBtnText, {color: 'white', marginLeft: 5}]}>XONG</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.footerBtn, {backgroundColor: '#eab308'}]} onPress={() => startSummon(isRollMulti)}>
                        <RotateCcw color="black" size={20} strokeWidth={3}/>
                        <Text style={[styles.footerBtnText, {marginLeft: 5}]}>QUAY TIẾP</Text>
                    </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}

        {/* MODAL CHI TIẾT */}
        <Modal transparent visible={!!selectedCard} animationType="fade">
          <TouchableWithoutFeedback onPress={() => setSelectedCard(null)}>
            <View style={styles.detailOverlay}>
              <View style={[styles.detailContent, { borderColor: getTierColor(selectedCard?.rarity || 'common') }]}>
                <Image source={selectedCard?.image} style={styles.detailImg} resizeMode="contain" />
                <Text style={[styles.detailTier, { color: getTierColor(selectedCard?.rarity || 'common') }]}>
                  {selectedCard?.name}
                </Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </Modal>
    </>
  );
};

export default GachaWidget;

const styles = StyleSheet.create({
  floatingTrigger: { position: 'absolute', right: 20, bottom: 40, backgroundColor: '#ef4444', width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', elevation: 8, zIndex: 9999, borderWidth: 3, borderColor: 'white' },
  triggerText: { color: 'white', fontSize: 10, fontWeight: 'bold', marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  menuContainer: { width: '90%', backgroundColor: 'white', borderRadius: 24, padding: 25, alignItems: 'center' },
  closeBtn: { alignSelf: 'flex-end', padding: 5 },
  menuTitle: { fontSize: 24, fontWeight: '900', marginBottom: 15, color: '#111' },
  balanceTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginBottom: 20 },
  balanceLabel: { color: '#6b7280', fontSize: 14, marginRight: 5 },
  balanceValue: { color: '#111827', fontSize: 16, fontWeight: 'bold' },
  btnRow: { flexDirection: 'row', gap: 15, width: '100%' },
  summonBtn: { flex: 1, paddingVertical: 25, borderRadius: 16, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  btnTitle: { color: 'white', fontWeight: '900', fontSize: 20, marginBottom: 5 },
  btnPrice: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '600' },
  tagDiscount: { position: 'absolute', top: 0, right: 0, backgroundColor: '#ef4444', paddingHorizontal: 8, paddingVertical: 4, borderBottomLeftRadius: 10 },
  tagText: { color: 'white', fontSize: 10, fontWeight: 'bold' },

  resultContainer: { flex: 1, backgroundColor: '#0f172a' },
  headerResult: { paddingVertical: 20, alignItems: 'center', paddingTop: 60 },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold', letterSpacing: 1 },
  scrollContainer: { paddingHorizontal: 10, alignItems: 'center', paddingTop: 20 },

  singleCardContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', height: height * 0.6 },
  bigCardSpace: { width: width * 0.7, aspectRatio: 0.7, marginBottom: 0 },

  columnsContainer: { flexDirection: 'row', justifyContent: 'center', gap: 15, paddingBottom: 20 },
  column: { flexDirection: 'column', gap: 15 },
  cardSpace2Col: { width: width * 0.42, aspectRatio: 0.7 },

  glowBehind: { position: 'absolute', width: '100%', height: '100%', borderRadius: 12 },
  cardBase: { width: '100%', height: '100%', backgroundColor: '#1e293b', borderRadius: 12, overflow: 'hidden' },
  cardBack: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#334155' },
  cardImg: { width: '100%', height: '100%' },

  footer: { position: 'absolute', bottom: 50, width: '100%', alignItems: 'center' },
  footerBtn: { backgroundColor: '#eab308', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 40, elevation: 5, flexDirection: 'row', alignItems: 'center' },
  footerBtnText: { color: '#000', fontWeight: '900', fontSize: 16 },

  detailOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  detailContent: { width: width * 0.85, height: height * 0.65, backgroundColor: '#111', borderRadius: 20, borderWidth: 3, padding: 20, alignItems: 'center' },
  detailImg: { width: '100%', height: '85%' },
  detailTier: { fontSize: 26, fontWeight: 'bold', marginTop: 15 }
});