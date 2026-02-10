// Domain Layer - Market Entity for Pokemon Cards
export type CardRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'double_rare'
  | 'ultra_rare'
  | 'illustration_rare'
  | 'special_illustration_rare'
  | 'secret_rare'
  | 'promo';

export interface Listing {
  id: string;
  sellerId: string;
  sellerName: string;
  price: number;
  condition: 'M' | 'NM' | 'LP' | 'MP' | 'HP';
  timestamp: string;
}

export interface PriceHistoryItem {
  timestamp: string;
  price: number;
}

export interface Market {
  id: string;
  symbol: string; // e.g., "PKM-025" (Pikachu)
  name: string;
  currentPrice: number; // Value in VND
  tcgPlayerPrice?: number; // Price from TCGPlayer in VND
  cardMarketPrice?: number; // Price from CardMarket in VND
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  supply: number;
  rarity: CardRarity;
  rarityLabel?: string;
  listings?: Listing[];
  priceHistory?: PriceHistoryItem[];
  listedAt?: string; // ISO Timestamp for sorting
}

export interface MarketTrend {
  period: string;
  high: number;
  low: number;
  average: number;
}
