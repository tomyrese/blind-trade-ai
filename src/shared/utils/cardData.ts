import { CardRarity, Listing } from '../../domain/models/Market';
// Remove specific icon imports to avoid issues if they don't exist, use generic View/Text or update later if needed.
// Keeping it simple for now, assuming icons are used in components, not here purely.
// Wait, RARITY_CONFIGS uses shape matching string.
// But valid shapes in config are 'circle' | 'diamond' ...
// We don't import icons here. We import types.

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
  isTrending?: boolean; // New property for Trending tab
}

export const RARITY_COLORS: Record<CardRarity, string> = {
  common: '#9CA3AF',
  uncommon: '#10B981',
  rare: '#3B82F6',
  rare_holo: '#8B5CF6',
  rare_holo_ex: '#6366F1',
  rare_holo_gx: '#EC4899',
  rare_holo_v: '#F43F5E',
  rare_rainbow: '#D946EF',
  rare_secret: '#EAB308',
  promo: '#06B6D4',
};

export const RARITY_RANKS: Record<CardRarity, number> = {
  common: 1,
  uncommon: 2,
  rare: 3,
  rare_holo: 4,
  rare_holo_ex: 5,
  rare_holo_gx: 6,
  rare_holo_v: 7,
  rare_rainbow: 8,
  rare_secret: 9,
  promo: 0,
};

export interface RarityConfigItem {
  label: string;
  symbol: string;
  shape: 'circle' | 'diamond' | 'star' | 'sparkles' | 'gem' | 'crown' | 'zap' | 'image' | 'text';
  starCount?: number;
  color: string;
  borderColor: string;
  borderGradient?: string[]; // New property for Gradient Borders
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
    color: '#9CA3AF',
    borderColor: '#D1D5DB',
    glowColor: 'rgba(156, 163, 175, 0.1)',
  },
  uncommon: {
    label: 'Uncommon',
    symbol: 'U',
    shape: 'diamond',
    color: '#10B981',
    borderColor: '#34D399',
    glowColor: 'rgba(16, 185, 129, 0.15)',
  },
  rare: {
    label: 'Rare',
    symbol: 'R',
    shape: 'star',
    starCount: 1,
    color: '#3B82F6',
    borderColor: '#60A5FA',
    glowColor: 'rgba(59, 130, 246, 0.2)',
  },
  rare_holo: {
    label: 'Rare Holo',
    symbol: 'H',
    shape: 'sparkles',
    color: '#8B5CF6',
    borderColor: '#A78BFA',
    glowColor: 'rgba(139, 92, 246, 0.25)',
    isHolo: true,
  },
  rare_holo_ex: {
    label: 'Rare Holo EX',
    symbol: 'EX',
    shape: 'star',
    starCount: 2,
    color: '#6366F1',
    borderColor: '#818CF8',
    glowColor: 'rgba(99, 102, 241, 0.3)',
    isHolo: true,
  },
  rare_holo_gx: {
    label: 'Rare Holo GX',
    symbol: 'GX',
    shape: 'star',
    starCount: 2,
    color: '#EC4899',
    borderColor: '#F472B6',
    glowColor: 'rgba(236, 72, 153, 0.3)',
    isHolo: true,
  },
  rare_holo_v: {
    label: 'Rare Holo V',
    symbol: 'V',
    shape: 'star',
    starCount: 2,
    color: '#F43F5E',
    borderColor: '#FB7185',
    glowColor: 'rgba(244, 63, 94, 0.3)',
    isHolo: true,
  },
  rare_rainbow: {
    label: 'Rare Rainbow',
    symbol: 'RB',
    shape: 'star',
    starCount: 3,
    color: '#D946EF',
    borderColor: '#E879F9',
    borderGradient: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'], // Rainbow Gradient
    glowColor: 'rgba(217, 70, 239, 0.35)',
    isHolo: true,
    isFullArt: true,
  },
  rare_secret: {
    label: 'Secret Rare',
    symbol: 'SR',
    shape: 'gem',
    color: '#EAB308',
    borderColor: '#FACC15',
    borderGradient: ['#fcd34d', '#f59e0b', '#b45309', '#f59e0b', '#fcd34d'], // Gold Gradient
    glowColor: 'rgba(234, 179, 8, 0.4)',
    isHolo: true,
    isFullArt: true,
  },
  promo: {
    label: 'Promo',
    symbol: 'P',
    shape: 'crown', // Changed from text to crown icon
    color: '#06B6D4',
    borderColor: '#22D3EE',
    glowColor: 'rgba(6, 182, 212, 0.25)',
  },
};

// Helper to get image or fallback
const getCardImage = (rarity: string, name: string) => {
    // In a real app, this would map to actual assets. 
    // For now we try to use existing asserts or return undefined to let CardItem render the fallback letter.
    // We will use the existing paths where possible or just null to test the renders.
    return null; 
};

export const mockCards: Card[] = [
  // --- COMMON ---
  {
    id: 'c-101',
    name: 'Erikas Oddish',
    rarity: 'common',
    value: 5000,
    image: require('../../assets/images/pokemon_by_rarity/Common/Ascended_Heroes_001_Erikas_Oddish.png'),
    isTrending: false,
  },
  {
    id: 'c-102',
    name: 'Charmander',
    rarity: 'common',
    value: 8000,
    image: require('../../assets/images/pokemon_by_rarity/Common/Ascended_Heroes_020_Charmander.png'),
    isTrending: true,
  },
  {
    id: 'c-103',
    name: 'Pikachu',
    rarity: 'common',
    value: 12000,
    image: require('../../assets/images/pokemon_by_rarity/Common/Ascended_Heroes_055_Pikachu.png'),
    isTrending: true,
  },
  {
    id: 'c-104',
    name: 'Erikas Bellsprout',
    rarity: 'common',
    value: 4500,
    image: require('../../assets/images/pokemon_by_rarity/Common/Ascended_Heroes_004_Erikas_Bellsprout.png'),
    isTrending: false,
  },

  // --- UNCOMMON ---
  {
    id: 'u-101',
    name: 'Charmeleon',
    rarity: 'uncommon',
    value: 18000,
    image: require('../../assets/images/pokemon_by_rarity/Uncommon/Ascended_Heroes_021_Charmeleon.png'),
    isTrending: true,
  },
  {
    id: 'u-102',
    name: 'Raichu',
    rarity: 'uncommon',
    value: 25000,
    image: require('../../assets/images/pokemon_by_rarity/Uncommon/Ascended_Heroes_056_Raichu.png'),
    isTrending: false,
  },
  {
    id: 'u-103',
    name: 'Bayleef',
    rarity: 'uncommon',
    value: 15000,
    image: require('../../assets/images/pokemon_by_rarity/Uncommon/Ascended_Heroes_009_Bayleef.png'),
    isTrending: false,
  },

  // --- RARE ---
  {
    id: 'r-101',
    name: 'Entei',
    rarity: 'rare',
    value: 85000,
    image: require('../../assets/images/pokemon_by_rarity/Rare/Ascended_Heroes_025_Entei.png'),
    isTrending: true,
  },
  {
    id: 'r-102',
    name: 'Rayquaza',
    rarity: 'rare',
    value: 120000,
    image: require('../../assets/images/pokemon_by_rarity/Rare/Ascended_Heroes_153_Rayquaza.png'),
    isTrending: true,
  },
  {
    id: 'r-103',
    name: 'Groudon',
    rarity: 'rare',
    value: 95000,
    image: require('../../assets/images/pokemon_by_rarity/Rare/Ascended_Heroes_108_Groudon.png'),
    isTrending: false,
  },

  // --- RARE HOLO ---
  {
    id: 'h-101',
    name: 'Charizard Holo',
    rarity: 'rare_holo',
    value: 450000,
    image: require('../../assets/images/pokemon_by_rarity/Rare_Holo/Arceus_001_Charizard.png'),
    isTrending: true,
  },
  {
    id: 'h-102',
    name: 'Alakazam Holo',
    rarity: 'rare_holo',
    value: 320000,
    image: require('../../assets/images/pokemon_by_rarity/Rare_Holo/Base_001_Alakazam.png'),
    isTrending: false,
  },
  {
    id: 'h-104',
    name: 'Dark Alakazam',
    rarity: 'rare_holo',
    value: 350000,
    image: require('../../assets/images/pokemon_by_rarity/Rare_Holo/Team_Rocket_001_Dark_Alakazam.png'),
    isTrending: true,
  },

  // --- RARE HOLO EX ---
  {
    id: 'ex-101',
    name: 'Venusaur-EX',
    rarity: 'rare_holo_ex',
    value: 550000,
    image: require('../../assets/images/pokemon_by_rarity/Rare_Holo_EX/XY_001_Venusaur-EX.png'),
    isTrending: true,
  },

  // --- RARE HOLO GX ---
  {
    id: 'gx-101',
    name: 'Venusaur & Snivy-GX',
    rarity: 'rare_holo_gx',
    value: 680000,
    image: require('../../assets/images/pokemon_by_rarity/Rare_Holo_GX/Cosmic_Eclipse_001_Venusaur_and_Snivy-GX.png'),
    isTrending: true,
  },

  // --- RARE HOLO V ---
  {
    id: 'v-101',
    name: 'Venusaur V',
    rarity: 'rare_holo_v',
    value: 350000,
    image: require('../../assets/images/pokemon_by_rarity/Rare_Holo_V/Champions_Path_001_Venusaur_V.png'),
    isTrending: false,
  },

  // --- RARE RAINBOW ---
  {
    id: 'rb-101',
    name: 'Charizard VMAX Rainbow',
    rarity: 'rare_rainbow',
    value: 2500000,
    image: require('../../assets/images/pokemon_by_rarity/Rare_Rainbow/Champions_Path_074_Charizard_VMAX.png'),
    isTrending: true,
  },
  {
    id: 'rb-102',
    name: 'Gyarados-GX Rainbow',
    rarity: 'rare_rainbow',
    value: 1800000,
    image: require('../../assets/images/pokemon_by_rarity/Rare_Rainbow/Crimson_Invasion_112_Gyarados-GX.png'),
    isTrending: true,
  },

  // --- RARE SECRET ---
  {
    id: 'sr-101',
    name: 'M Rayquaza-EX Secret',
    rarity: 'rare_secret',
    value: 3500000,
    image: require('../../assets/images/pokemon_by_rarity/Rare_Secret/Ancient_Origins_098_M_Rayquaza-EX.png'),
    isTrending: true,
  },
  {
    id: 'sr-102',
    name: 'Giratina VSTAR Secret',
    rarity: 'rare_secret',
    value: 4200000,
    image: require('../../assets/images/pokemon_by_rarity/Rare_Secret/Crown_Zenith_Galarian_Gallery_GG69_Giratina_VSTAR.png'),
    isTrending: true,
  },
  {
    id: 'sr-103',
    name: 'Dark Raichu Secret',
    rarity: 'rare_secret',
    value: 2800000,
    image: require('../../assets/images/pokemon_by_rarity/Rare_Secret/Team_Rocket_083_Dark_Raichu.png'),
    isTrending: false,
  },

  // --- PROMO ---
  {
    id: 'p-101',
    name: 'Pikachu Promo',
    rarity: 'promo',
    value: 150000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/Wizards_Black_Star_Promos_001_Pikachu.png'),
    isTrending: true,
  },
  {
    id: 'p-102',
    name: 'Snorlax-GX Promo',
    rarity: 'promo',
    value: 220000,
    image: require('../../assets/images/pokemon_by_rarity/Promo/SM_Black_Star_Promos_SM05_Snorlax-GX.png'),
    isTrending: false,
  },
];
export interface fusionOdds {
  upgrade: number;
  same: number;
  downgrade: number;
}

export const getFusionProbabilities = (cards: Card[]): fusionOdds => {
  if (cards.length === 0) return { upgrade: 0, same: 0, downgrade: 0 };
  
  const highestRank = Math.max(...cards.map(c => RARITY_RANKS[mapRarity(c.rarity)] || 0));
  
  if (highestRank <= 2) { // Common, Uncommon
    return { upgrade: 0.40, same: 0.45, downgrade: 0.15 };
  } else if (highestRank <= 4) { // Rare, Holo
    return { upgrade: 0.25, same: 0.50, downgrade: 0.25 };
  } else if (highestRank <= 7) { // EX, GX, V
    return { upgrade: 0.10, same: 0.50, downgrade: 0.40 };
  } else { // Rainbow, Secret
    return { upgrade: 0.02, same: 0.38, downgrade: 0.60 };
  }
};

export const generateReward = (selectedCards: Card[]): Card => {
  const totalValue = selectedCards.reduce((sum, c) => sum + c.value, 0);
  const odds = getFusionProbabilities(selectedCards);
  const roll = Math.random();
  
  const ranks = Object.keys(RARITY_RANKS) as CardRarity[];
  const highestRank = Math.max(...selectedCards.map(c => RARITY_RANKS[mapRarity(c.rarity)] || 0));
  
  let targetRarity: CardRarity = 'common';
  let multiplier = 1.0;

  if (roll <= odds.upgrade) {
    const targetRank = Math.min(9, highestRank + (Math.random() > 0.8 ? 2 : 1));
    targetRarity = ranks.find(r => RARITY_RANKS[r] === targetRank) || 'rare';
    multiplier = 1.5 + (Math.random() * 1.5);
  } else if (roll <= odds.upgrade + odds.same) {
    targetRarity = ranks.find(r => RARITY_RANKS[r] === highestRank) || 'common';
    multiplier = 0.9 + (Math.random() * 0.4);
  } else {
    const targetRank = Math.max(1, highestRank - 1);
    targetRarity = ranks.find(r => RARITY_RANKS[r] === targetRank) || 'common';
    multiplier = 0.4 + (Math.random() * 0.4);
  }

  const rewardValue = Math.floor(totalValue * multiplier);
  
  const namesByRarity: Record<CardRarity, string[]> = {
    common: ['Rattata', 'Pidgey', 'Zubat', 'Caterpie'],
    uncommon: ['Ivysaur', 'Charmeleon', 'Wartortle', 'Pikachu'],
    rare: ['Gyarados', 'Arcanine', 'Alakazam', 'Machamp'],
    rare_holo: ['Charizard', 'Blastoise', 'Venusaur', 'Dragonite'],
    rare_holo_ex: ['Mewtwo ex', 'Rayquaza ex', 'Lugia ex', 'Kyogre ex'],
    rare_holo_gx: ['Lunala GX', 'Solgaleo GX', 'Darkrai GX', 'Snorlax GX'],
    rare_holo_v: ['Zacian V', 'Zamazenta V', 'Pikachu V', 'Eevee V'],
    rare_rainbow: ['Charizard VMAX', 'Pikachu VMAX', 'Mew VMAX', 'Rayquaza VMAX'],
    rare_secret: ['Mew (Gold)', 'Pikachu (Gold)', 'Ultra Ball (Gold)', 'Arceus VSTAR (Gold)'],
    promo: ['Pikachu (Promo)', 'Eevee (Promo)', 'Meowth (Promo)', 'Psyduck (Promo)'],
  };

  // Find all matching cards for the target rarity
  const matchingCards = mockCards.filter(c => c.rarity === targetRarity);
  
  // Pick one specific source card to base the reward on
  const sourceCard = matchingCards.length > 0 
    ? matchingCards[Math.floor(Math.random() * matchingCards.length)] 
    : mockCards[0]; // Fallback

  const name = sourceCard.name;
  const image = sourceCard.image;

  return {
    id: `fusion-${sourceCard.id}-${targetRarity}`,
    name: `${name} (Fusion)`,
    rarity: targetRarity,
    value: rewardValue,
    tcgPlayerPrice: Math.floor(rewardValue * 1.1),
    cardMarketPrice: Math.floor(rewardValue * 0.95),
    image: image,
    symbol: sourceCard.symbol || `PKM-${sourceCard.id}`,
  };
};

export const mapRarity = (rarity: string | undefined): CardRarity => {
  if (!rarity) return 'common';
  
  const validRarities: CardRarity[] = [
    'common', 'uncommon', 'rare', 'rare_holo', 
    'rare_holo_ex', 'rare_holo_gx', 
    'rare_holo_v', 'rare_rainbow', 'rare_secret', 'promo'
  ];
  
  if (validRarities.includes(rarity as CardRarity)) {
    return rarity as CardRarity;
  }

  const r = rarity.toLowerCase();
  
  if (r.includes('rainbow') || r.includes('hyper')) return 'rare_rainbow';
  if (r.includes('secret')) return 'rare_secret';
  if (r.includes('v') && !r.includes('vmax') && !r.includes('vstar')) return 'rare_holo_v';
  if (r.includes('gx')) return 'rare_holo_gx';
  if (r.includes('ex')) return 'rare_holo_ex';
  if (r.includes('promo')) return 'promo';
  if (r.includes('holo')) return 'rare_holo';
  if (r.includes('rare')) return 'rare';
  if (r.includes('uncommon')) return 'uncommon';
  
  return 'common';
};
