import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, Image, ScrollView, SafeAreaView, useWindowDimensions, Modal,
} from 'react-native';
import { Sparkles, Check, RotateCcw, Coins } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  FadeIn,
  ZoomIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  interpolate,
  withRepeat,
  Easing,
} from 'react-native-reanimated';

// Import Component & Data
import { normalizedCards, Card, mapRarity, RARITY_CONFIGS, RARITY_RANKS } from '../../shared/utils/cardData';
import { useUserStore } from '../../shared/stores/userStore';
import { useTranslation } from '../../shared/utils/translations';
import { formatCurrency } from '../../shared/utils/currency';
import { usePortfolioStore } from '../../shared/stores/portfolioStore';
import { GachaAnimation } from '../../features/gacha/components/GachaAnimation';

const { width } = Dimensions.get('window');

const PRICE_1 = 200000;
const PRICE_10 = 1600000;

import { GachaCardItem, getTierColor } from '../../shared/components/GachaCardItem';

// --- 3. MÀN HÌNH GACHA CHÍNH ---
export const GachaScreen = () => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isWide = windowWidth > 600;

  const [phase, setPhase] = useState<'IDLE' | 'ANIMATING' | 'RESULT'>('IDLE');
  const [currentViewCards, setCurrentViewCards] = useState<Card[]>([]);
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const [isRollMulti, setIsRollMulti] = useState(false);
  const [showInsufficentUI, setShowInsufficentUI] = useState(false);
  const [bestRarityColor, setBestRarityColor] = useState('#3B82F6');

  const spend = useUserStore(state => state.spend);
  const userBalance = useUserStore(state => state.profile?.balance || 0);
  const userCurrency = useUserStore(state => state.profile?.currency || 'VND');
  const addItems = usePortfolioStore(state => state.addItems);
  const { t } = useTranslation();

  const isAllRevealed = revealed.length > 0 && revealed.every(v => v);

  const generateRandomCards = (count: number): any[] => {
    const results: any[] = [];
    for (let i = 0; i < count; i++) {
      const rand = Math.random();
      let pool: Card[] = [];

      // Filter pools based on ALREADY NORMALIZED rarity
      if (rand < 0.05) {
        pool = normalizedCards.filter(c => ['rare_secret', 'rare_rainbow', 'rare_holo_vstar', 'rare_holo_vmax', 'rare_holo_v'].includes(c.rarity));
      } else if (rand < 0.25) {
        pool = normalizedCards.filter(c => ['rare_holo', 'rare', 'rare_holo_gx', 'rare_holo_ex', 'promo'].includes(c.rarity));
      } else {
        pool = normalizedCards.filter(c => ['common', 'uncommon'].includes(c.rarity));
      }

      if (pool.length === 0) pool = normalizedCards;

      const baseCard = pool[Math.floor(Math.random() * pool.length)];

      results.push({
        ...baseCard,
        id: `${baseCard.id}-${Date.now()}-${i}`,
        baseId: baseCard.id
      });
    }
    return results;
  };

  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const startSummon = (isMulti: boolean) => {
    // Safety check: Cannot summon again if current cards aren't fully revealed
    if (phase === 'RESULT' && !isAllRevealed) {
      return;
    }

    const cost = isMulti ? PRICE_10 : PRICE_1;
    const isSuccess = spend(cost);

    if (!isSuccess) {
      setShowInsufficentUI(true);
      return;
    }

    setIsRollMulti(isMulti);
    const count = isMulti ? 10 : 1;
    const newResults = generateRandomCards(count);

    // Calculate Best Rarity for Glow
    let bestColor = '#9CA3AF';
    let maxRank = 0;

    newResults.forEach(c => {
      const rank = RARITY_RANKS[c.rarity as keyof typeof RARITY_RANKS] || 0;
      if (rank > maxRank) {
        maxRank = rank;
        bestColor = getTierColor(c.rarity);
      }
    });
    setBestRarityColor(bestColor);

    const assetsToAdd = newResults.map(card => ({
      id: card.id,
      name: card.name,
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

    // START ANIMATION
    setPhase('ANIMATING');
  };

  const onAnimationFinish = () => {
    setPhase('RESULT');
  };

  const resetGacha = () => {
    setPhase('IDLE');
    setCurrentViewCards([]);
    setRevealed([]);
    setSelectedCard(null);
  };

  const flipCard = (idx: number) => {
    if (revealed[idx]) {
      // If already revealed, open detail view
      setSelectedCard(currentViewCards[idx]);
      return;
    }
    const nextStates = [...revealed];
    nextStates[idx] = true;
    setRevealed(nextStates);
  };

  const openAllCurrent = () => setRevealed(new Array(currentViewCards.length).fill(true));

  return (
    <SafeAreaView style={styles.container}>
      {phase === 'IDLE' && (
        <View style={styles.menuOverlay}>
          <Animated.View
            entering={FadeIn.duration(600)}
            style={[
              styles.menuContainer,
              isWide && { maxWidth: 500 }
            ]}
          >
            <Text style={styles.menuTitle}>{t('gacha_title')}</Text>

            <View style={styles.balanceTag}>
              <Sparkles color="#eab308" size={20} />
              <Text style={styles.balanceAmt}>{formatCurrency(userBalance, userCurrency)}</Text>
            </View>

            <View style={styles.priceSection}>
              <TouchableOpacity style={styles.priceRow} onPress={() => startSummon(false)}>
                <View style={styles.sumBtn}>
                  <View style={styles.pokeballIconSmall}>
                    <View style={[styles.pokeballTop, { backgroundColor: '#ef4444' }]} />
                    <View style={styles.pokeballBeltSmall} />
                    <View style={styles.pokeballBase} />
                    <View style={styles.pokeballCenterSmall}>
                      <View style={styles.pokeballCenterInner} />
                    </View>
                  </View>
                  <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={styles.btnTitle}>{t('gacha_roll_x1')}</Text>
                    <Text style={styles.btnDesc}>{t('gacha_roll_x1_desc')}</Text>
                  </View>
                  <Text style={styles.btnPrice}>{formatCurrency(PRICE_1, userCurrency)}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.priceRow} onPress={() => startSummon(true)}>
                <View style={styles.sumBtn}>
                  <View style={[styles.pokeballIconSmall, { borderColor: '#1e293b' }]}>
                    <View style={[styles.pokeballTop, { backgroundColor: '#a855f7' }]}>
                      <View style={styles.masterBallSpotLeft} />
                      <View style={styles.masterBallSpotRight} />
                    </View>
                    <View style={styles.pokeballBeltSmall} />
                    <View style={styles.pokeballBase} />
                    <View style={styles.pokeballCenterSmall}>
                      <Text style={styles.masterBallM}>M</Text>
                    </View>
                  </View>
                  <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={styles.btnTitle}>{t('gacha_roll_x10')}</Text>
                    <Text style={styles.btnDesc}>{t('gacha_roll_x10_desc')}</Text>
                  </View>
                  <Text style={styles.btnPrice}>{formatCurrency(PRICE_10, userCurrency)}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      )}

      {phase === 'ANIMATING' && (
        <Modal visible={true} transparent={true} animationType="fade">
          <GachaAnimation tierColor={bestRarityColor} isMulti={isRollMulti} onFinish={onAnimationFinish} />
        </Modal>
      )}

      {phase === 'RESULT' && (
        <Modal visible={true} transparent={false} animationType="fade" onRequestClose={resetGacha}>
          <Animated.View entering={FadeIn.duration(300)} style={styles.resultContainer}>
            <View style={styles.headerResult}>
              <Text style={styles.headerTitle}>{t('gacha_result_title')}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
              {isRollMulti ? (
                <View style={[
                  styles.columnsContainer,
                  isWide && { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 1000 }
                ]}>
                  {isWide ? (
                    // 5x2 or wrapped grid for wide screens
                    currentViewCards.map((card, idx) => (
                      <GachaCardItem
                        key={card.id}
                        item={card}
                        index={idx}
                        revealed={revealed[idx]}
                        onFlip={() => flipCard(idx)}
                        sizeMode="small"
                      />
                    ))
                  ) : (
                    // Original 2-column mobile layout
                    <>
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
                    </>
                  )}
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
              <View style={{ height: 180 }} />
            </ScrollView>

            <Animated.View entering={FadeIn.delay(200)} style={styles.footer}>
              <View style={[isWide && { flexDirection: 'row', gap: 16 }]}>
                {isAllRevealed ? (
                  <TouchableOpacity
                    style={[styles.footerBtn, { backgroundColor: '#3b82f6' }, isWide && { minWidth: 180 }]}
                    onPress={resetGacha}
                  >
                    <Check color="white" size={20} style={{ marginRight: 8 }} />
                    <Text style={[styles.footerBtnText, { color: 'white' }]}>{t('gacha_done') || 'DONE'}</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.footerBtn, isWide && { minWidth: 180 }]}
                    onPress={openAllCurrent}
                  >
                    <Sparkles color="#111" size={20} style={{ marginRight: 8 }} />
                    <Text style={styles.footerBtnText}>{t('gacha_flip_all') || 'REVEAL ALL'}</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.footerBtn,
                    { marginTop: isWide ? 0 : 12, backgroundColor: isAllRevealed ? '#334155' : '#94a3b8' },
                    isWide && { minWidth: 180 }
                  ]}
                  onPress={() => isAllRevealed && startSummon(isRollMulti)}
                  disabled={!isAllRevealed}
                >
                  <RotateCcw color="white" size={20} style={{ marginRight: 8, opacity: isAllRevealed ? 1 : 0.5 }} />
                  <Text style={[styles.footerBtnText, { color: 'white', opacity: isAllRevealed ? 1 : 0.7 }]}>{t('gacha_roll_again')}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Animated.View>
        </Modal>
      )}

      {/* Internal Modal for Insufficient Balance */}
      {/* Internal Modal for Insufficient Balance */}
      {showInsufficentUI && (
        <Modal visible={true} transparent={true} animationType="fade" onRequestClose={() => setShowInsufficentUI(false)}>
          <View style={styles.balanceOverlayAbsolute}>
            <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowInsufficentUI(false)} />
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
      )}

      {/* CARD DETAIL MODAL */}
      {selectedCard && (
        <Modal visible={true} transparent={true} animationType="fade" onRequestClose={() => setSelectedCard(null)}>
          <View style={styles.detailOverlay}>
            <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setSelectedCard(null)} />
            <Animated.View entering={ZoomIn.duration(300)} style={styles.detailCardContainer}>
              <Image source={selectedCard.image} style={styles.detailImage} resizeMode="contain" />
            </Animated.View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdf2f2' },
  menuOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  menuContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 32,
    padding: 30,
    alignItems: 'center',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 25,
    borderWidth: 2,
    borderColor: '#ef4444'
  },
  menuTitle: { fontSize: 32, fontWeight: '900', marginBottom: 20, color: '#ef4444', letterSpacing: 2, textTransform: 'uppercase' },
  balanceTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef2f2', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 30, marginBottom: 35, borderWidth: 1, borderColor: '#fee2e2' },
  balanceAmt: { fontSize: 20, fontWeight: 'bold', marginLeft: 8, color: '#1e293b' },

  priceSection: { width: '100%', gap: 16 },
  priceRow: { backgroundColor: '#f8fafc', borderRadius: 24, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden' },
  sumBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, paddingHorizontal: 30 },
  btnTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  btnDesc: { fontSize: 13, color: '#64748b', marginTop: 2 },
  btnPrice: { fontSize: 20, fontWeight: '900', color: '#ef4444' },

  resultContainer: { flex: 1, backgroundColor: '#0f172a' },
  headerResult: { paddingHorizontal: 25, paddingTop: 40, marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: 'white', letterSpacing: 2 },

  scrollContainer: { paddingHorizontal: 20, alignItems: 'center' },
  singleCardContainer: { paddingTop: 40, alignItems: 'center' },
  columnsContainer: { flexDirection: 'row', justifyContent: 'center', gap: 15, paddingBottom: 20 },
  column: { flexDirection: 'column', gap: 15 },
  cardSpace2Col: { width: Math.min(width * 0.40, 160), aspectRatio: 0.72 },
  bigCardSpace: { width: Math.min(width * 0.6, 280), aspectRatio: 0.72 },

  glowBehind: { position: 'absolute', width: '100%', height: '100%', borderRadius: 12 },
  cardBaseContainer: { flex: 1, backgroundColor: '#1e293b', borderRadius: 12, overflow: 'hidden' },
  cardFace: { ...StyleSheet.absoluteFillObject, borderRadius: 12, backfaceVisibility: 'hidden', justifyContent: 'center', alignItems: 'center' },
  cardFront: { backgroundColor: '#0f172a' },
  cardBack: { backgroundColor: '#1e293b' },
  cardImg: { width: '100%', height: '100%' },
  cardOverlay: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'rgba(0,0,0,0.85)', padding: 10, alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  cardNameText: { fontSize: 13, fontWeight: '900', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5 },

  rarityHintText: { color: 'white', fontSize: 11, fontWeight: '900', position: 'absolute', bottom: 15, opacity: 0.8, letterSpacing: 1 },

  pokeballDecor: { position: 'absolute', width: 100, height: 100, borderRadius: 50, overflow: 'hidden', opacity: 0.1, borderWidth: 4, borderColor: '#1e293b' },
  pokeballTop: { flex: 1, backgroundColor: '#ef4444' },
  pokeballBase: { flex: 1, backgroundColor: 'white' },
  pokeballBelt: { position: 'absolute', top: '46%', width: '100%', height: 8, backgroundColor: '#1e293b' },
  pokeballCenter: { position: 'absolute', top: '50%', left: '50%', width: 28, height: 28, marginLeft: -14, marginTop: -14, borderRadius: 14, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center' },
  pokeballCenterInner: { width: 16, height: 16, borderRadius: 8, backgroundColor: 'white', borderWidth: 2, borderColor: '#1e293b' },

  pokeballIconSmall: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', borderWidth: 2, borderColor: '#1e293b', position: 'relative' },
  pokeballBeltSmall: { position: 'absolute', top: '44%', width: '100%', height: 4, backgroundColor: '#1e293b' },
  pokeballCenterSmall: { position: 'absolute', top: '50%', left: '50%', width: 14, height: 14, marginLeft: -7, marginTop: -7, borderRadius: 7, backgroundColor: 'white', borderWidth: 2, borderColor: '#1e293b', justifyContent: 'center', alignItems: 'center', zIndex: 10 },

  masterBallSpotLeft: { position: 'absolute', left: 4, top: 4, width: 10, height: 10, borderRadius: 5, backgroundColor: '#ec4899' },
  masterBallSpotRight: { position: 'absolute', right: 4, top: 4, width: 10, height: 10, borderRadius: 5, backgroundColor: '#ec4899' },
  masterBallM: { color: '#ec4899', fontSize: 8, fontWeight: '900' },

  footer: { position: 'absolute', bottom: 40, width: '100%', alignItems: 'center' },
  footerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 32, elevation: 8, minWidth: 240, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  footerBtnText: { fontSize: 16, fontWeight: '900', color: '#1e293b', letterSpacing: 1.5, textTransform: 'uppercase' },

  balanceOverlayAbsolute: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center', padding: 20, zIndex: 9999 },
  balanceCard: { width: '85%', maxWidth: 320, backgroundColor: '#1e293b', borderRadius: 28, padding: 25, alignItems: 'center', borderWidth: 2, borderColor: '#eab308' },
  balanceIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(234,179,8,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  balanceTitle: { color: 'white', fontSize: 20, fontWeight: '900', textAlign: 'center', marginBottom: 12, letterSpacing: 1 },
  balanceDesc: { color: '#94a3b8', fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 25 },
  balanceCloseBtn: { width: '100%', backgroundColor: '#eab308', paddingVertical: 14, borderRadius: 16, alignItems: 'center', elevation: 4 },
  balanceCloseText: { color: '#000', fontSize: 16, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },

  detailOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  detailCardContainer: { width: '85%', height: '55%', justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' },
  detailImage: { width: '100%', height: '100%', borderRadius: 16, resizeMode: 'contain' },
});
