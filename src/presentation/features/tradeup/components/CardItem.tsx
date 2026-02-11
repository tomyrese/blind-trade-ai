// Premium CardItem Design - Modern & Beautiful
import React from 'react';
import { Pressable, Text, View, StyleSheet, Image } from 'react-native';
import { Check, Heart, ShoppingCart, Star, Diamond, Circle, Sparkles, Gem, Crown, Zap, Image as ImageIcon } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Card, RARITY_CONFIGS } from '../../../../shared/utils/cardData';
import { formatCurrency } from '../../../../shared/utils/currency';
import { useUserStore } from '../../../../shared/stores/userStore';
import { useTranslation } from '../../../../shared/utils/translations';
import { useFavoritesStore } from '../../../../shared/stores/favoritesStore';
import { useCartStore } from '../../../../shared/stores/cartStore';
import { useToast } from '../../../../shared/contexts/ToastContext';

interface CardItemProps {
  card: Card;
  selected?: boolean;
  onToggle?: (id: string) => void;
  disabled?: boolean;
  showActions?: boolean;
  showRarity?: boolean; // New prop
  size?: 'normal' | 'small' | 'list';
  largeImage?: boolean; // New prop for controlling image size in grid
  amount?: number; // New prop for showing quantity badge
}

export const CardItem: React.FC<CardItemProps> = ({ card, selected = false, onToggle, disabled = false, showActions = true, showRarity = true, size = 'normal', largeImage = false, amount }) => {
    const isFavorite = useFavoritesStore((state) => state.isFavorite(card.id));
    const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
    const addToCart = useCartStore((state) => state.addToCart);
    const { showToast } = useToast();
    const user = useUserStore((state) => state.profile);
    const currency = user?.currency || 'VND';
    const { t } = useTranslation();

    const isSmall = size === 'small';
    const isList = size === 'list';
    const config = RARITY_CONFIGS[card.rarity] || RARITY_CONFIGS.common;

    // Rarity Shape Renderer
    const renderRarityIcon = () => {
      const iconSize = 10;
      const color = config.color;
      
      switch (config.shape) {
        case 'circle':
          return <Circle size={iconSize} fill={color} color={color} />;
        case 'diamond':
          return <Diamond size={iconSize} fill={color} color={color} />;
        case 'star':
          return (
            <View style={{ flexDirection: 'row', gap: 1 }}>
              {Array.from({ length: config.starCount || 1 }).map((_, i) => (
                <Star key={i} size={iconSize} fill={color} color={color} />
              ))}
            </View>
          );
        case 'sparkles':
          return <Sparkles size={iconSize} fill={color} color={color} />;
        case 'gem':
          return <Gem size={iconSize} fill={color} color={color} />;
        case 'crown':
          return <Crown size={iconSize} fill={color} color={color} />;
        case 'zap':
          return <Zap size={iconSize} fill={color} color={color} />;
        case 'image':
            return <ImageIcon size={iconSize} color={color} />;
        case 'text':
            return <Text style={{fontSize: 8, fontWeight: '900', color: color}}>{config.symbol}</Text>
        default:
          return null;
      }
    };

    const ContainerComponent = config.borderGradient ? LinearGradient : View;
    const containerProps = config.borderGradient ? {
        colors: config.borderGradient,
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
        style: [
            styles.gradientBorder,
            isSmall && styles.containerSmall,
            isList && styles.containerList,
            {
                borderRadius: 16,
                padding: 2, // Width of the gradient border
            },
            (!isSmall && !isList) && { aspectRatio: 0.70 },
            selected && styles.selectedContainer,
            disabled && styles.disabledContainer,
        ]
    } : {
        style: [
            styles.container,
            isSmall && styles.containerSmall,
            isList && styles.containerList,
            { 
                borderColor: config.borderColor,
                shadowColor: config.shadowColor || config.color,
            },
            (!isSmall && !isList) && { aspectRatio: 0.70 },
            selected && styles.selectedContainer,
            disabled && styles.disabledContainer,
        ]
    };

    return (
      <Pressable
        onPress={onToggle ? () => onToggle(card.id) : undefined}
        disabled={disabled}
        style={[
            // Outer Pressable style needs to handle layout mostly
            { width: '100%' },
            // For list view, we need flex row behavior on the PRESSABLE itself if we want the whole thing clickable area
            // ACTUALLY, simpler to render Pressable INSIDE. But we want whole card clickable.
            // Let's keep Pressable as wrapper but apply styles to inner Container.
            // WAIT, duplicates style usage.
            // Let's wrap Pressable around the Gradient/View.
        ]}
      >
        <ContainerComponent {...containerProps as any}>
            <View style={[
                styles.innerContent, 
                config.borderGradient && { borderRadius: 14, backgroundColor: '#ffffff' }, // Slightly smaller radius for inner content
                isList && { flexDirection: 'row', alignItems: 'center', padding: 10, width: '100%' } // Restore logic for list layout
            ]}>

                {/* Top Actions Bar - Hidden in List Mode (Moves to bottom/side) */}
                {(!isSmall && !isList) && (
                <View style={[styles.topBar, !showActions && { justifyContent: 'flex-start' }]}> 
                    {showRarity ? (
                        <View style={[styles.rarityTag, { borderColor: config.borderColor, backgroundColor: config.glowColor }]}>
                            {renderRarityIcon()}
                            <Text style={[styles.raritySymbol, { color: config.color }]}>{config.label}</Text>
                        </View>
                    ) : (
                        <View style={[styles.rarityTag, { opacity: 0, borderWidth: 0 }]} /> 
                    )}

                    {showActions && (
                    <Pressable 
                    onPress={() => {

                        const wasFavorite = isFavorite;
                        toggleFavorite(card.id);
                        showToast(
                        wasFavorite 
                            ? `${t('remove_success')} ${card.name}`
                            : `${t('add_success')} ${card.name}`,
                        'favorite'
                        );
                    }}
                    style={styles.iconButton}
                    >
                    <Heart 
                        size={14} 
                        color={isFavorite ? '#ef4444' : '#94a3b8'} 
                        fill={isFavorite ? '#ef4444' : 'transparent'}
                        strokeWidth={2}
                    />
                    </Pressable>
                    )}
                </View>
                )}

                {/* Artwork Section */}
                <View style={[
                    isSmall ? styles.artworkWrapperSmall : styles.artworkWrapper,
                    isList && styles.artworkWrapperList
                ]}>
                <View style={[
                    styles.artworkContainer, 
                    { borderColor: config.borderColor },
                    (!isSmall && !isList) && { aspectRatio: 0.75 },
                    (isSmall || isList) && styles.artworkContainerSmall,
                    largeImage && !isList && !isSmall && { width: '62%' } // Reduced from 70% to clear price
                ]}>
                    {/* Gradient Background for Holo effect if applicable */}
                        <View style={[
                            styles.artworkBackground, 
                            { backgroundColor: (isSmall || isList) ? config.borderColor : config.glowColor }, 
                        ]}>
                            {card.image ? (
                                <Image 
                                    source={card.image} 
                                    style={{ width: '100%', height: '100%' }} 
                                    resizeMode="contain" 
                                />
                            ) : (
                                !(isSmall || isList) && (
                                    <Text style={[styles.artworkLetter, { color: config.color }]}>{card.name.charAt(0)}</Text>
                                )
                            )}
                        </View>
                        
                        {/* Thumbnail Icon/Symbol for Small/List Cards */}
                        {(isSmall || isList) && !card.image && (
                            <View style={styles.thumbnailCenter}>
                                <Text style={[styles.thumbnailLetter, { color: config.color }]}>{card.name.charAt(0)}</Text>
                            </View>
                        )}
                </View>
                </View>

                {/* Detailed Information Section */}
                {!isSmall && (
                <View style={[styles.detailsSection, isList && styles.detailsSectionList]}>
                    <View>
                        {/* List Mode Rarity Tag */}
                        {isList && (
                            <View style={[styles.rarityTag, { 
                                borderColor: config.borderColor, 
                                backgroundColor: config.glowColor,
                                alignSelf: 'flex-start',
                                marginBottom: 4,
                                marginTop: 10, // Add margin top to prevent touching border
                            }]}>
                                {renderRarityIcon()}
                                <Text style={[styles.raritySymbol, { color: config.color }]}>{config.label}</Text>
                            </View>
                        )}

                        {/* Card Name */}
                        <Text style={[styles.cardTitle, isList && { fontSize: 14 }]} numberOfLines={1}>
                        {card.name}
                        </Text>

                        {/* Product ID & Seller Info Row */}
                        <View style={isList ? { flexDirection: 'row', alignItems: 'center', gap: 8 } : undefined}>
                            <Text style={styles.productId} numberOfLines={1}>
                            ID: {card.id.substring(0, 8)}
                            </Text>
                            
                            {/* List Mode Seller Info */}
                            {isList && (
                                <Text style={[styles.sellerInfo, { fontSize: 10, marginTop: 3 }]} numberOfLines={1}>
                                    • {card.listings?.[0]?.sellerName || card.symbol || 'Trainer'}
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* Grid Mode Seller Info */}
                    {!isList && (
                        <Text style={styles.sellerInfo} numberOfLines={1}>
                        {t('listed_by')}: {card.listings?.[0]?.sellerName || card.symbol || 'Trainer'}
                        </Text>
                    )}

                    {/* Spacer */}


                    {/* Price & Action Row */}
                    <View style={[styles.bottomRow, isList && { marginTop: 0 }]}>
                    <View style={[styles.priceWrapper, isList && { flexDirection: 'row', alignItems: 'baseline', gap: 6 }]}>
                        <Text style={[styles.mainPrice, isList && { fontSize: 16 }]} numberOfLines={1} adjustsFontSizeToFit={!isList} minimumFontScale={isList ? 1 : 0.8}>
                        {formatCurrency(card.value, currency)}
                        </Text>
                        {card.tcgPlayerPrice && (
                        <Text style={[styles.subPrice, isList && { marginTop: 0 }]} numberOfLines={1} adjustsFontSizeToFit={!isList} minimumFontScale={isList ? 1 : 0.8}>
                            TCG: {formatCurrency(card.tcgPlayerPrice, currency)}
                        </Text>
                        )}
                    </View>

                    {showActions && (
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            {isList && (
                                <Pressable 
                                    onPress={() => {
                                        const wasFavorite = isFavorite;
                                        toggleFavorite(card.id);
                                        showToast(wasFavorite ? t('remove_success') : t('add_success'), 'favorite');
                                    }}
                                    style={styles.iconButton}
                                >
                                    <Heart 
                                        size={14} 
                                        color={isFavorite ? '#ef4444' : '#94a3b8'} 
                                        fill={isFavorite ? '#ef4444' : 'transparent'}
                                        strokeWidth={2}
                                    />
                                </Pressable>
                            )}
                            <Pressable 
                            onPress={() => {
                                addToCart(card);
                                showToast(`${t('add_success')} ${card.name}`, 'cart');
                            }}
                            style={[styles.cartIconButton, { backgroundColor: config.glowColor }]}
                            >
                            <ShoppingCart size={13} color={config.color} strokeWidth={2} />
                            </Pressable>
                        </View>
                    )}
                    </View>
                </View>
                )}
            </View>

            {selected && (
            <View style={[styles.selectionBadge, { backgroundColor: config.borderColor }]}>
                <Check size={12} color="#ffffff" strokeWidth={3} />
            </View>
            )}

            {/* Amount Badge - Internalized for consistency */}
            {(amount !== undefined && amount > 1) && (
              <View style={styles.internalAmountBadge}>
                <Text style={styles.internalAmountText}>x{amount}</Text>
              </View>
            )}
        </ContainerComponent>
      </Pressable>
    );
};

CardItem.displayName = 'CardItem';

const styles = StyleSheet.create({
  // Main Container - Premium Modern Card with Fixed Dimensions
  container: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    padding: 2, // Width of border, matches gradientBorder padding for alignment
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    position: 'relative',
    overflow: 'visible', // Allow SelectionBadge to pop out
  },
  gradientBorder: {
      width: '100%',
      // Padding handles the border thickness
      borderRadius: 16,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 10,
      position: 'relative',
      overflow: 'visible', // Allow SelectionBadge to pop out
  },
  innerContent: {
      flex: 1,
      backgroundColor: '#ffffff',
      borderRadius: 13, // 16 - 2(padding) - 1(visual correction)
      padding: 4, // Reduced from 8 to tighten layout
      overflow: 'hidden',
  },
  containerSmall: {
    aspectRatio: 1, // Square for cart thumbnail
    padding: 4, // Less padding to maximize image
    borderRadius: 16,
  },
  selectedContainer: {
    transform: [{ scale: 0.97 }],
    opacity: 0.85,
  },
  disabledContainer: {
    opacity: 0.5,
  },

  // Selection Badge
  selectionBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50, // Higher zIndex to be on top of borders
    borderWidth: 2.5,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },

  // Top Action Bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Changed to space-between to accommodate rarity tag
    alignItems: 'center',
    marginBottom: 8,
    zIndex: 10,
  },
  rarityTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 12,
      borderWidth: 1,
  },
  raritySymbol: {
      fontSize: 9, 
      fontWeight: '800',
      textTransform: 'uppercase',
  },
  iconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Artwork Section - Fixed Square Aspect Ratio
  artworkWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 6, // Reduced from 10
  },
  artworkWrapperSmall: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  artworkContainer: {
    width: '52%', // Reduced from 60% to clear price on Home screen
    borderRadius: 12,
    borderWidth: 2,
    padding: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  artworkContainerSmall: {
    width: '100%', // Fill the square container
    height: '100%',
    borderRadius: 14, // Match outer radius roughly
    borderWidth: 1, // Restore inner border
    padding: 1,
    backgroundColor: 'transparent',
  },
  artworkBackground: {
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  thumbnailCenter: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailLetter: {
    fontSize: 28,
    fontWeight: '900',
  },
  artworkLetter: {
    fontSize: 72,
    fontWeight: '900',
    opacity: 0.75,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  // Details Section
  detailsSection: {
    flex: 1,
    gap: 2, // Final tightening to 2px
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 17,
    letterSpacing: -0.2,
  },
  productId: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 3,
    letterSpacing: 0.2,
  },
  sellerInfo: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginTop: -2,
  },

  // Bottom Row (Price & Cart)
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: -1, // Eliminate gap completely to pull price right under seller info
  },
  priceWrapper: {
    flex: 1,
    minWidth: 0, // Enable text truncation
  },
  mainPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: '#10b981',
    letterSpacing: -0.2,
  },
  subPrice: {
    fontSize: 8,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  cartIconButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  containerList: {
    flexDirection: 'row',
    minHeight: 86, // Reduced from 100 to be more compact
    // alignItems: 'center', // Handled by innerContent
    padding: 0, // Gradient border handles padding
    backgroundColor: 'transparent',
    // Removed borderWidth: 0 to allow standard card borders to show in list view
  },
  
  // Artwork wrappers
  artworkWrapperList: {
      width: 60, // Portrait ratio
      height: 84, // ~0.7 ratio * 1.4 scale
      marginBottom: 0,
      marginRight: 16,
  },
  
  // Details list specific
  detailsSectionList: {
      justifyContent: 'center', 
      gap: 2, // Minimal gap between the two main blocks
      paddingVertical: 0, 
  },
  
  // Internalized Badges
  internalAmountBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    zIndex: 100,
  },
  internalAmountText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '900',
  },
});
