import { CardRarity, Listing } from '../../domain/models/Market';
import { Circle, Diamond, Star, Sparkles, Gem, Crown } from 'lucide-react-native';

export type { CardRarity, Listing };

export interface Card {
  id: string;
  name: string;
  rarity: CardRarity;
  rarityLabel?: string; // For display (e.g. "Secret Rare", "VMAX", "Full Art")
  value: number; // Value in VND
  symbol?: string;
  tcgPlayerPrice?: number;
  cardMarketPrice?: number;
  imageUrl?: string;
  isFavorite?: boolean;
  listings?: Listing[];
  listedAt?: string;
  amount?: number;
}

export const RARITY_COLORS: Record<CardRarity, string> = {
  common: '#94a3b8',           // Slate 400 - Circle
  uncommon: '#22c55e',         // Green 500 - Diamond
  rare: '#3b82f6',             // Blue 500 - Star
  double_rare: '#a855f7',      // Purple 500 - 2 Stars
  ultra_rare: '#ec4899',       // Pink 500 - 2 Silver/Gold Stars
  illustration_rare: '#f59e0b', // Amber 500 - 1 Gold Star
  special_illustration_rare: '#f97316', // Orange 500 - 2 Gold Stars
  secret_rare: '#eab308',      // Yellow 500 - 3 Gold Stars (Hyper Rare)
  promo: '#06b6d4',            // Cyan 500 - PROMO
};

export const RARITY_RANKS: Record<CardRarity, number> = {
  common: 1,
  uncommon: 2,
  rare: 3,
  double_rare: 4,
  ultra_rare: 5,
  illustration_rare: 6,
  special_illustration_rare: 7,
  secret_rare: 8,
  promo: 0,
};

export interface RarityConfigItem {
  label: string;
  symbol: string;
  shape: 'circle' | 'diamond' | 'star' | 'sparkles' | 'gem' | 'crown' | 'zap' | 'image' | 'text';
  starCount?: number;
  color: string;
  borderColor: string;
  shadowColor?: string;
  glowColor: string;
  isHolo?: boolean;
  isFullArt?: boolean;
}

export const RARITY_CONFIGS: Record<CardRarity, RarityConfigItem> = {
  common: {
    label: 'Common',
    symbol: 'C',
    shape: 'circle',
    color: '#94a3b8',
    borderColor: '#cbd5e1',
    glowColor: 'rgba(148, 163, 184, 0.1)',
  },
  uncommon: {
    label: 'Uncommon',
    symbol: 'U',
    shape: 'diamond',
    color: '#22c55e',
    borderColor: '#4ade80',
    glowColor: 'rgba(34, 197, 94, 0.15)',
  },
  rare: {
    label: 'Rare',
    symbol: 'R',
    shape: 'star',
    starCount: 1,
    color: '#3b82f6',
    borderColor: '#60a5fa',
    glowColor: 'rgba(59, 130, 246, 0.2)',
    isHolo: true,
  },
  double_rare: {
    label: 'Double Rare',
    symbol: 'RR',
    shape: 'sparkles',
    color: '#a855f7',
    borderColor: '#c084fc',
    glowColor: 'rgba(168, 85, 247, 0.25)',
    isHolo: true,
  },
  ultra_rare: {
    label: 'Ultra Rare',
    symbol: 'UR',
    shape: 'zap',
    color: '#ec4899',
    borderColor: '#f472b6',
    glowColor: 'rgba(236, 72, 153, 0.3)',
    isHolo: true,
    isFullArt: true,
  },
  illustration_rare: {
    label: 'Illus. Rare', // Reverted to English Shortened
    symbol: 'IR',
    shape: 'image',
    color: '#f59e0b',
    borderColor: '#fbbf24',
    glowColor: 'rgba(245, 158, 11, 0.3)',
    isHolo: true,
    isFullArt: true,
  },
  special_illustration_rare: {
    label: 'Special Illus.', // Reverted to English Shortened
    symbol: 'SIR',
    shape: 'crown',
    color: '#f97316',
    borderColor: '#fdba74',
    glowColor: 'rgba(249, 115, 22, 0.35)',
    isHolo: true,
    isFullArt: true,
  },
  secret_rare: {
    label: 'Secret Rare',
    symbol: 'SR',
    shape: 'gem',
    color: '#eab308', // Gold
    borderColor: '#fde047',
    glowColor: 'rgba(234, 179, 8, 0.4)',
    isHolo: true,
    isFullArt: true,
  },
  promo: {
    label: 'Promo',
    symbol: 'PROMO',
    shape: 'text',
    color: '#06b6d4',
    borderColor: '#22d3ee',
    glowColor: 'rgba(6, 182, 212, 0.25)',
  },
};

// Mock Pokemon card inventory
export const mockCards: Card[] = [
  { id: '1', name: 'Pikachu (Holographic)', rarity: 'rare', value: 2500000, tcgPlayerPrice: 2650000, cardMarketPrice: 2400000 },
  { id: '2', name: 'Bulbasaur', rarity: 'common', value: 45000, tcgPlayerPrice: 50000, cardMarketPrice: 40000 },
  { id: '3', name: 'Charizard ex', rarity: 'double_rare', value: 15000000, tcgPlayerPrice: 16000000, cardMarketPrice: 14500000 },
  { id: '4', name: 'Squirtle', rarity: 'common', value: 42000, tcgPlayerPrice: 45000, cardMarketPrice: 40000 },
  { id: '5', name: 'Mewtwo VSTAR', rarity: 'ultra_rare', value: 850000, tcgPlayerPrice: 900000, cardMarketPrice: 820000 },
  { id: '6', name: 'Iono', rarity: 'special_illustration_rare', value: 1200000, tcgPlayerPrice: 1300000, cardMarketPrice: 1100000 },
  { id: '7', name: 'Eevee', rarity: 'uncommon', value: 35000, tcgPlayerPrice: 38000, cardMarketPrice: 32000 },
  { id: '8', name: 'Giratina V (Alt Art)', rarity: 'secret_rare', value: 25000000, tcgPlayerPrice: 27000000, cardMarketPrice: 24000000 },
  { id: '9', name: 'Pikachu (Promo)', rarity: 'promo', value: 150000, tcgPlayerPrice: 160000, cardMarketPrice: 140000 },
  { id: '10', name: 'Ralts', rarity: 'illustration_rare', value: 300000, tcgPlayerPrice: 320000, cardMarketPrice: 290000 },
];

// Probabilities and Weights for Fusion based on highest input rarity
export interface fusionOdds {
  upgrade: number;
  same: number;
  downgrade: number;
}

export const getFusionProbabilities = (cards: Card[]): fusionOdds => {
  if (cards.length === 0) return { upgrade: 0, same: 0, downgrade: 0 };
  
  // Find highest rarity rank
  const highestRank = Math.max(...cards.map(c => RARITY_RANKS[mapRarity(c.rarity)] || 0));
  
  // Logic: Lower rarity is easier to upgrade. Higher rarity is harder.
  // Rank 1 (Common) -> High upgrade chance
  // Rank 8 (Secret Rare) -> Low upgrade chance
  
  if (highestRank <= 2) { // Common, Uncommon
    return { upgrade: 0.60, same: 0.30, downgrade: 0.10 };
  } else if (highestRank <= 4) { // Rare, Double Rare
    return { upgrade: 0.40, same: 0.40, downgrade: 0.20 };
  } else if (highestRank <= 6) { // Ultra Rare, Illus Rare
    return { upgrade: 0.20, same: 0.50, downgrade: 0.30 };
  } else { // SIR, Secret Rare
    return { upgrade: 0.05, same: 0.45, downgrade: 0.50 };
  }
};

// Generate random reward based on input cards for Fusion
export const generateReward = (selectedCards: Card[]): Card => {
  const totalValue = selectedCards.reduce((sum, c) => sum + c.value, 0);
  const odds = getFusionProbabilities(selectedCards);
  const roll = Math.random();
  
  // Get unique rarities from input to determine "Same" and "Downgrade/Upgrade" paths
  const ranks = Object.keys(RARITY_RANKS) as CardRarity[];
  const highestRank = Math.max(...selectedCards.map(c => RARITY_RANKS[mapRarity(c.rarity)] || 0));
  
  let targetRarity: CardRarity = 'common';
  let multiplier = 1.0;

  if (roll <= odds.upgrade) {
    // SUCCESS: Move up 1-2 ranks
    const targetRank = Math.min(8, highestRank + (Math.random() > 0.8 ? 2 : 1));
    targetRarity = ranks.find(r => RARITY_RANKS[r] === targetRank) || 'rare';
    multiplier = 1.5 + (Math.random() * 1.5); // 1.5x to 3.0x
  } else if (roll <= odds.upgrade + odds.same) {
    // STAY: Same rank
    targetRarity = ranks.find(r => RARITY_RANKS[r] === highestRank) || 'common';
    multiplier = 0.9 + (Math.random() * 0.4); // 0.9x to 1.3x
  } else {
    // FAIL: Downgrade
    const targetRank = Math.max(1, highestRank - 1);
    targetRarity = ranks.find(r => RARITY_RANKS[r] === targetRank) || 'common';
    multiplier = 0.4 + (Math.random() * 0.4); // 0.4x to 0.8x
  }

  const rewardValue = Math.floor(totalValue * multiplier);
  
  const namesByRarity: Record<CardRarity, string[]> = {
    common: ['Rattata', 'Pidgey', 'Zubat', 'Caterpie'],
    uncommon: ['Ivysaur', 'Charmeleon', 'Wartortle', 'Pikachu'],
    rare: ['Gyarados', 'Arcanine', 'Alakazam', 'Machamp'],
    double_rare: ['Charizard ex', 'Blastoise ex', 'Venusaur ex', 'Mewtwo ex'],
    ultra_rare: ['Lugia VSTAR', 'Arceus VSTAR', 'Giratina VSTAR', 'Palkia VSTAR'],
    illustration_rare: ['Gardevoir', 'Koraidon', 'Miraidon', 'Arven'],
    special_illustration_rare: ['Iono', 'Miriam', 'Penny', 'Nemona'],
    secret_rare: ['Mew (Gold)', 'Pikachu (Gold)', 'Charizard (Rainbow)', 'Lugia (Rainbow)'],
    promo: ['Pikachu (Promo)', 'Eevee (Promo)', 'Meowth (Promo)', 'Psyduck (Promo)'],
  };

  const possibleNames = namesByRarity[targetRarity];
  const name = possibleNames[Math.floor(Math.random() * possibleNames.length)];

  return {
    id: `fusion-${Date.now()}`,
    name: `${name} (Fusion)`,
    rarity: targetRarity,
    value: rewardValue,
    tcgPlayerPrice: Math.floor(rewardValue * 1.1),
    cardMarketPrice: Math.floor(rewardValue * 0.95),
  };
};

// Helper to map API rarity strings to internal CardRarity type
export const mapRarity = (rarity: string | undefined): CardRarity => {
  if (!rarity) return 'common';
  
  // If rarity is already a valid CardRarity set, return it
  const validRarities: CardRarity[] = [
    'common', 'uncommon', 'rare', 'double_rare', 
    'ultra_rare', 'illustration_rare', 
    'special_illustration_rare', 'secret_rare', 'promo'
  ];
  
  if (validRarities.includes(rarity as CardRarity)) {
    return rarity as CardRarity;
  }

  const r = rarity.toLowerCase();
  
  // Mapping logic
  if (r.includes('hyper') || r.includes('rainbow') || r.includes('secret')) return 'secret_rare';
  if (r.includes('illustration') && r.includes('special')) return 'special_illustration_rare';
  if (r.includes('illustration')) return 'illustration_rare';
  if (r.includes('ultra') || r.includes('vmax') || r.includes('vstar')) return 'ultra_rare';
  if (r.includes('double') || r.includes('ex') || r.includes('gx')) return 'double_rare';
  if (r.includes('promo')) return 'promo';
  if (r.includes('rare') || r.includes('holo')) return 'rare';
  if (r.includes('uncommon')) return 'uncommon';
  
  return 'common';
};
