// Premium CardItem Design - Modern & Beautiful
import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Check, Heart, ShoppingCart, Star, Diamond, Circle, Sparkles, Gem, Crown, Zap, Image } from 'lucide-react-native';
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
  size?: 'normal' | 'small' | 'list';
}

export const CardItem: React.FC<CardItemProps> = ({ card, selected = false, onToggle, disabled = false, showActions = true, size = 'normal' }) => {
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
            return <Image size={iconSize} color={color} />;
        case 'text':
            return <Text style={{fontSize: 8, fontWeight: '900', color: color}}>{config.symbol}</Text>
        default:
          return null;
      }
    };

    return (
      <Pressable
        onPress={onToggle ? () => onToggle(card.id) : undefined}
        disabled={disabled}
        style={[
          styles.container,
          isSmall && styles.containerSmall,
          isList && styles.containerList,
          { 
            borderColor: config.borderColor,
            shadowColor: config.shadowColor || config.color,
          },
          selected && styles.selectedContainer,
          disabled && styles.disabledContainer,
        ]}
      >
        {/* Selection Indicator */}
        {selected && (
          <View style={[styles.selectionBadge, { backgroundColor: config.borderColor }]}>
            <Check size={12} color="#ffffff" strokeWidth={3} />
          </View>
        )}

        {/* Top Actions Bar - Hidden in List Mode (Moves to bottom/side) */}
        {showActions && !isSmall && !isList && (
          <View style={styles.topBar}>
             <View style={[styles.rarityTag, { borderColor: config.borderColor, backgroundColor: config.glowColor }]}>
                {renderRarityIcon()}
                <Text style={[styles.raritySymbol, { color: config.color }]}>{config.label}</Text>
             </View>

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
            (isSmall || isList) && styles.artworkContainerSmall
          ]}>
             {/* Gradient Background for Holo effect if applicable */}
                <View style={[
                    styles.artworkBackground, 
                    { backgroundColor: (isSmall || isList) ? config.borderColor : config.glowColor }, 
                    (isSmall || isList) && { opacity: 0.15 }
                ]}>
                    {!(isSmall || isList) && (
                        <Text style={[styles.artworkLetter, { color: config.color }]}>{card.name.charAt(0)}</Text>
                    )}
                </View>
                
                {/* Thumbnail Icon/Symbol for Small/List Cards */}
                {(isSmall || isList) && (
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
            {!isList && <View style={{ flex: 1 }} />}

            {/* Price & Action Row */}
            <View style={[styles.bottomRow, isList && { marginTop: 0 }]}>
              <View style={[styles.priceWrapper, isList && { flexDirection: 'row', alignItems: 'baseline', gap: 6 }]}>
                <Text style={[styles.mainPrice, isList && { fontSize: 16 }]} numberOfLines={1} adjustsFontSizeToFit>
                  {formatCurrency(card.value, currency)}
                </Text>
                {card.tcgPlayerPrice && (
                  <Text style={[styles.subPrice, isList && { marginTop: 0 }]} numberOfLines={1}>
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
    padding: 10,
    aspectRatio: 0.65, // Taller card to show all content including price
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    position: 'relative',
    // Removed overflow: 'hidden' to allow selectionBadge to pop out
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
    zIndex: 20,
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
    marginBottom: 10,
  },
  artworkWrapperSmall: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  artworkContainer: {
    width: '60%', // Smaller image - 60% of card width
    aspectRatio: 0.75, // Taller potrait aspect ratio
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
    borderWidth: 0, // Remove inner border for cleaner look
    padding: 0,
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
    gap: 5,
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
    marginTop: 2,
  },

  // Bottom Row (Price & Cart)
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 6,
  },
  priceWrapper: {
    flex: 1,
    minWidth: 0, // Enable text truncation
  },
  mainPrice: {
    fontSize: 14,
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
    aspectRatio: undefined, // Remove fixed aspect ratio
    height: 100, // Reduced height
    alignItems: 'center',
    padding: 8, // Reduced padding
  },
  
  // Artwork wrappers
  artworkWrapperList: {
      width: 70, // Smaller thumbnail
      height: 70,
      marginBottom: 0,
      marginRight: 12,
  },
  
  // Details list specific
  detailsSectionList: {
      justifyContent: 'center', 
      gap: 2, // Minimal gap between the two main blocks
      paddingVertical: 0, 
  },
});
