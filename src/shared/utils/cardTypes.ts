import { CardRarity, Listing } from '../../domain/models/Market';
export type { CardRarity, Listing };

export interface Card {
  id: string;
  name: string;
  rarity: CardRarity;
  rarityLabel?: string;
  value: number;
  symbol?: string;
  tcgPlayerPrice?: number;
  cardMarketPrice?: number;
  image?: any;
  isFavorite?: boolean;
  listings?: Listing[];
  listedAt?: string;
  amount?: number;
  isTrending?: boolean;
}

export interface RarityConfigItem {
  label: string;
  symbol: string;
  shape: 'circle' | 'diamond' | 'star' | 'sparkles' | 'gem' | 'crown' | 'zap' | 'image' | 'text';
  starCount?: number;
  color: string;
  borderColor: string;
  borderGradient?: string[];
  shadowColor?: string;
  glowColor: string;
  isHolo?: boolean;
  isFullArt?: boolean;
}
