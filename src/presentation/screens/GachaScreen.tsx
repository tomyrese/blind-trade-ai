import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, Image, ScrollView, SafeAreaView, useWindowDimensions, Modal,
} from 'react-native';
import { X, Sparkles, Check, RotateCcw, Coins } from 'lucide-react-native';
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

// --- 1. HÀM QUY ĐỔI MÀU ---
const getTierColor = (rarity: string) => {
  const r = rarity.toLowerCase();
  const config = RARITY_CONFIGS[r as keyof typeof RARITY_CONFIGS];

  if (config) {
    return config.borderColor;
  }

  // Logical Fallbacks for unknown strings
  if (r.includes('secret') || r.includes('rainbow') || r.includes('vstar') || r.includes('vmax') || r.includes('gold')) {
    return '#FACC15'; // Gold/Yellow
  }
  if (r.includes('rare') || r.includes('holo')) {
    return '#A78BFA'; // Purple/Violet
  }
  if (r.includes('uncommon')) {
    return '#34D399'; // Green
  }

  return '#9CA3AF'; // Gray (Common)
};

// --- 2. COMPONENT THẺ BÀI CON (3D Flip) ---
const GachaCardItem = ({ item, index, revealed, onFlip, sizeMode }: {
  item: Card, index: number, revealed: boolean, onFlip: () => void, sizeMode: 'big' | 'small'
}) => {
  const tierColor = getTierColor(item.rarity);
  const rank = RARITY_RANKS[item.rarity as keyof typeof RARITY_RANKS] || 0;
  const isGoldTier = rank >= 5;
  const isPurpleTier = rank >= 3 && rank < 5;

  // Hint color for the border before flipping
  const hintBorderColor = revealed ? tierColor : tierColor + '40'; // 40 is hex for ~25% opacity

  const entryDelay = index * 100;
  const rotate = useSharedValue(0);
  const shineOpacity = useSharedValue(0);
  const borderRotate = useSharedValue(0);

  useEffect(() => {
    // Loop border rotation for high rarity (ONCE on mount)
    if (rank >= 3) {
      borderRotate.value = withRepeat(withTiming(360, { duration: 3000, easing: Easing.linear }), -1);
    }
  }, []);

  useEffect(() => {
    if (revealed) {
      rotate.value = withTiming(180, { duration: 600 });
      // Flash effect for Rare+ cards
      if (rank >= 3) {
        shineOpacity.value = withDelay(500, withSequence(
          withTiming(1, { duration: 150 }), // Burst
          withTiming(0, { duration: 500 })    // Fade
        ));
      }
    } else {
      rotate.value = 0;
      shineOpacity.value = 0;
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

  // Hoisted Styles (Fix for "Rendered fewer hooks" error)


  // Hoisted Styles (Fix for "Rendered fewer hooks" error)
  const beam1Style = useAnimatedStyle(() => ({
    opacity: shineOpacity.value,
    transform: [{ rotate: '45deg' }, { scale: interpolate(shineOpacity.value, [0, 1], [0.8, 1.8]) }]
  }));

  const beam2Style = useAnimatedStyle(() => ({
    opacity: shineOpacity.value,
    transform: [{ rotate: '-45deg' }, { scale: interpolate(shineOpacity.value, [0, 1], [0.8, 1.8]) }]
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: shineOpacity.value * 0.5,
    transform: [{ scale: 1.4 }]
  }));

  const flashOverlayStyle = useAnimatedStyle(() => ({
    opacity: shineOpacity.value
  }));

  const runningBorderStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${borderRotate.value}deg` }]
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(entryDelay).duration(500)}
      style={sizeMode === 'big' ? styles.bigCardSpace : styles.cardSpace2Col}
    >
      {/* 3D Cross Burst Flash for High Rarity */}
      {(rank >= 3) && (
        <>
          {/* Beam 1 */}
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              { zIndex: -1, justifyContent: 'center', alignItems: 'center' },
              beam1Style
            ]}
          >
            <LinearGradient
              colors={['transparent', tierColor, tierColor, 'transparent']}
              start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
              style={{ width: '150%', height: '20%' }} // Wide subtle beam
            />
            <LinearGradient
              colors={['transparent', 'white', 'white', 'transparent']}
              start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
              style={{ position: 'absolute', width: '5%', height: '140%' }} // Vertical sharp beam
            />
          </Animated.View>

          {/* Beam 2 */}
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              { zIndex: -1, justifyContent: 'center', alignItems: 'center' },
              beam2Style
            ]}
          >
            <LinearGradient
              colors={['transparent', tierColor, tierColor, 'transparent']}
              start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
              style={{ width: '150%', height: '20%' }}
            />
            <LinearGradient
              colors={['transparent', 'white', 'white', 'transparent']}
              start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
              style={{ position: 'absolute', width: '5%', height: '140%' }}
            />
          </Animated.View>

          {/* Central Halo */}
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              { zIndex: -2, backgroundColor: tierColor, borderRadius: 20 },
              haloStyle
            ]}
          />
        </>
      )}

      <TouchableOpacity activeOpacity={0.9} onPress={onFlip} style={{ flex: 1 }}>
        <View style={styles.cardBaseContainer}>
          <Animated.View style={[
            styles.cardFace,
            styles.cardFront,
            frontAnimatedStyle,
            {
              // Remove static border for High Rarity to show Running Border
              borderColor: (rank >= 3) ? 'transparent' : tierColor,
              borderWidth: (rank >= 3) ? 0 : (isGoldTier ? 4 : 2),
              shadowColor: tierColor,
              shadowOpacity: 0.6,
              shadowRadius: 10,
              elevation: 5,
              padding: (rank >= 3) ? 3 : 0, // Padding for border to show
            }
          ]}>
            {/* RUNNING BORDER FOR FRONT (High Rarity) */}
            {(rank >= 3) && (
              <Animated.View style={[
                StyleSheet.absoluteFill,
                { justifyContent: 'center', alignItems: 'center' }
              ]}>
                <Animated.View style={[
                  { width: '250%', height: '250%' },
                  runningBorderStyle
                ]}>
                  <LinearGradient
                    colors={[tierColor, 'transparent', tierColor, 'transparent']}
                    start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                    style={{ flex: 1 }}
                  />
                </Animated.View>
              </Animated.View>
            )}

            {/* Content Container with Background to mask the center */}
            <View style={{ flex: 1, width: '100%', borderRadius: 9, overflow: 'hidden', backgroundColor: '#0f172a' }}>
              <Image source={item.image} style={styles.cardImg} resizeMode="cover" />
              <View style={styles.cardOverlay}>
                <Text style={[styles.cardNameText, { color: tierColor }]}>{item.name}</Text>
              </View>
              {/* Flash Overlay for High Rarity */}
              {(isPurpleTier || isGoldTier) && (
                <Animated.View
                  style={[
                    StyleSheet.absoluteFillObject,
                    { backgroundColor: 'white', zIndex: 10 },
                    flashOverlayStyle
                  ]}
                />
              )}
            </View>
          </Animated.View>

          <Animated.View style={[
            styles.cardFace,
            styles.cardBack,
            backAnimatedStyle,
            {
              // For high rarity, we use the running border logic (no static border)
              borderColor: (rank >= 3 && !revealed) ? 'transparent' : hintBorderColor,
              borderWidth: (rank >= 3 && !revealed) ? 0 : 2,
              shadowColor: tierColor,
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 3,
              padding: (rank >= 3 && !revealed) ? 3 : 0, // Padding to expose gradient
            }
          ]}>
            {/* RUNNING BORDER GRADIENT LAYER (High Rarity Only) */}
            {(rank >= 3 && !revealed) && (
              <Animated.View style={[
                StyleSheet.absoluteFill,
                { justifyContent: 'center', alignItems: 'center' }
              ]}>
                <Animated.View style={[
                  { width: '250%', height: '250%' }, // Larger to cover rotation
                  runningBorderStyle
                ]}>
                  <LinearGradient
                    colors={[tierColor, 'transparent', tierColor, 'transparent']}
                    start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                    style={{ flex: 1 }}
                  />
                </Animated.View>
              </Animated.View>
            )}

            {/* INNER CONTENT MASK */}
            <View style={{ flex: 1, width: '100%', borderRadius: 9, backgroundColor: '#1e293b', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
              <View style={styles.pokeballDecor}>
                <View style={styles.pokeballTop} />
                <View style={styles.pokeballBelt} />
                <View style={styles.pokeballBase} />
                <View style={styles.pokeballCenter} />
              </View>
              <Sparkles color={tierColor} size={32} opacity={0.6} />
              <Text style={styles.rarityHintText}>
                {(RARITY_CONFIGS[item.rarity as keyof typeof RARITY_CONFIGS]?.label || item.rarity).toUpperCase()}
              </Text>
            </View>
          </Animated.View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

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
        <View style={styles.balanceOverlayAbsolute}>
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
      )}

      {/* CARD DETAIL MODAL */}
      {selectedCard && (
        <Modal visible={true} transparent={true} animationType="fade" onRequestClose={() => setSelectedCard(null)}>
          <View style={styles.detailOverlay}>
            <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setSelectedCard(null)} />
            <Animated.View entering={ZoomIn.duration(300)} style={styles.detailCardContainer}>
              <Image source={selectedCard.image} style={styles.detailImage} resizeMode="contain" />
              <View style={styles.detailInfo}>
                <Text style={[styles.detailRarity, { color: getTierColor(selectedCard.rarity) }]}>
                  {(RARITY_CONFIGS[selectedCard.rarity as keyof typeof RARITY_CONFIGS]?.label || selectedCard.rarity).toUpperCase()}
                </Text>
                <Text style={styles.detailName}>{selectedCard.name}</Text>
                <Text style={styles.detailValue}>{formatCurrency(selectedCard.value, userCurrency)}</Text>
              </View>
              <TouchableOpacity style={styles.closeDetailBtn} onPress={() => setSelectedCard(null)}>
                <X color="white" size={24} />
              </TouchableOpacity>
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

  detailOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  detailCardContainer: { width: '50%', backgroundColor: '#1e293b', borderRadius: 20, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  detailImage: { width: '100%', aspectRatio: 0.72, borderRadius: 12 },
  detailInfo: { width: '100%', padding: 10, alignItems: 'center' },
  detailRarity: { fontSize: 12, fontWeight: '900', letterSpacing: 1.5, marginBottom: 4 },
  detailName: { fontSize: 16, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 4 },
  detailValue: { fontSize: 16, fontWeight: '900', color: '#eab308' },
  closeDetailBtn: { position: 'absolute', top: -12, right: -12, width: 36, height: 36, borderRadius: 18, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white', elevation: 10 },
});
