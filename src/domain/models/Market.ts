// Domain Layer - Market Entity for Pokemon Cards
export type CardRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'rare_holo'
  | 'rare_holo_ex'
  | 'rare_holo_gx'
  | 'rare_holo_v'
  | 'rare_rainbow'
  | 'rare_secret'
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

export interface Transaction {
  id: string;
  price: number;
  condition: string;
  type: 'buy' | 'sell';
  timestamp: string;
  buyerName?: string;
  sellerName?: string;
}

export interface ValuationAnalysis {
  score: number; // 0-100
  rating: 'Great' | 'Fair' | 'Premium' | 'Undervalued';
  liquidity: 'High' | 'Medium' | 'Low';
  aiAnalysis: string;
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
  image?: any;
  listings?: Listing[];
  priceHistory?: PriceHistoryItem[];
  recentSales?: Transaction[];
  valuation?: ValuationAnalysis;
  listedAt?: string; // ISO Timestamp for sorting
}

export interface MarketTrend {
  period: string;
  high: number;
  low: number;
  average: number;
}
